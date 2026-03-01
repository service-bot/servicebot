let Logger = require("../models/logger");
let User = require("../../../models/user");
let ServiceInstance = require("../../../models/service-instance");
let crypto = require("crypto");

/**
 * PayTheFly Webhook Handler
 *
 * Receives payment notifications from PayTheFly and processes them.
 *
 * Webhook body: { "data": "<json string>", "sign": "<hmac hex>", "timestamp": <unix> }
 * Signature: HMAC-SHA256(data + "." + timestamp, projectKey)
 * Response must contain "success" string.
 *
 * Webhook payload fields:
 *   - value (not amount): human-readable payment value
 *   - confirmed (not status): boolean confirmation flag
 *   - serial_no: unique serial number
 *   - tx_hash: blockchain transaction hash
 *   - wallet: payer wallet address
 *   - tx_type: 1=payment, 2=withdrawal
 */
module.exports = function (knex) {
    /**
     * Verify PayTheFly webhook HMAC-SHA256 signature using timing-safe comparison.
     * Signature = HMAC-SHA256(data + "." + timestamp, projectKey)
     *
     * IMPORTANT: Uses HMAC-SHA256, NOT SHA3-256. PayTheFly requires standard SHA-256.
     */
    function verifySignature(data, timestamp, signature) {
        let projectKey = process.env.PAYTHEFLY_PROJECT_KEY;
        if (!projectKey) {
            console.error("[PayTheFly] PAYTHEFLY_PROJECT_KEY not configured");
            return false;
        }

        let message = data + "." + timestamp;
        let expectedSignature = crypto
            .createHmac("sha256", projectKey)
            .update(message)
            .digest("hex");

        // Timing-safe comparison to prevent timing attacks
        try {
            return crypto.timingSafeEqual(
                Buffer.from(expectedSignature, "hex"),
                Buffer.from(signature, "hex")
            );
        } catch (err) {
            console.error("[PayTheFly] Signature comparison error:", err.message);
            return false;
        }
    }

    /**
     * Process a confirmed payment webhook
     */
    async function processPayment(payload) {
        let order = await knex("paythefly_orders")
            .where({ serial_no: payload.serial_no })
            .first();

        if (!order) {
            console.error(`[PayTheFly] Order not found: ${payload.serial_no}`);
            return;
        }

        if (order.status !== "pending") {
            console.log(`[PayTheFly] Order already processed: ${payload.serial_no} (${order.status})`);
            return;
        }

        // Update order status
        await knex("paythefly_orders")
            .where({ serial_no: payload.serial_no, status: "pending" })
            .update({
                status: "completed",
                tx_hash: payload.tx_hash,
                wallet: payload.wallet,
                paid_value: payload.value,
                updated_at: knex.fn.now(),
            });

        // If linked to a service instance, activate it
        if (order.service_instance_id) {
            let instance = (await ServiceInstance.find({ id: order.service_instance_id }))[0];
            if (instance && instance.get("status") !== "running") {
                instance.data.status = "running";
                await instance.update();
                console.log(`[PayTheFly] Service instance ${order.service_instance_id} activated`);
            }
        }

        Logger.log(
            `ptf_${payload.serial_no}`,
            `PayTheFly payment confirmed: value=${payload.value} tx=${payload.tx_hash} wallet=${payload.wallet}`
        );
    }

    let webhook = function (req, res, next) {
        let body = req.body;

        // Validate webhook structure
        if (!body || !body.data || !body.sign || !body.timestamp) {
            console.error("[PayTheFly] Invalid webhook body structure");
            return res.status(400).send("invalid request");
        }

        // Verify HMAC-SHA256 signature (timing-safe)
        if (!verifySignature(body.data, body.timestamp, body.sign)) {
            console.error("[PayTheFly] Webhook signature verification failed");
            return res.status(403).send("invalid signature");
        }

        // Reject stale webhooks (> 5 minutes old)
        let now = Math.floor(Date.now() / 1000);
        if (now - body.timestamp > 300) {
            console.error("[PayTheFly] Webhook timestamp too old");
            return res.status(400).send("timestamp expired");
        }

        // Parse inner data payload
        let payload;
        try {
            payload = JSON.parse(body.data);
        } catch (err) {
            console.error("[PayTheFly] Failed to parse webhook data:", err.message);
            return res.status(400).send("invalid data");
        }

        // Only process confirmed payment transactions (tx_type=1)
        if (payload.tx_type === 1 && payload.confirmed) {
            processPayment(payload)
                .then(() => {
                    console.log(`[PayTheFly] Payment processed: ${payload.serial_no}`);
                })
                .catch((err) => {
                    console.error(`[PayTheFly] Payment processing error:`, err);
                });
        } else {
            console.log(
                `[PayTheFly] Skipping: tx_type=${payload.tx_type} confirmed=${payload.confirmed}`
            );
        }

        // Response MUST contain "success" string per PayTheFly API spec
        res.status(200).send("success");
    };

    return {
        endpoint: "/paythefly/webhook",
        method: "post",
        middleware: [webhook],
        permissions: [],
        description: "PayTheFly Crypto Payment Webhook",
    };
};
