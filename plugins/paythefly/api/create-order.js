let crypto = require("crypto");

/**
 * PayTheFly Create Order API
 *
 * Creates a new crypto payment order. The frontend should redirect the user
 * to the PayTheFly payment URL constructed from the returned parameters.
 *
 * Payment URL format:
 *   https://pro.paythefly.com/pay?chainId=56&projectId=xxx&amount=0.01&serialNo=xxx&deadline=xxx&signature=0x...&token=0x...
 *
 * Amount is human-readable (e.g., "0.01"), NOT raw token units.
 *
 * EIP-712 domain: { name: "PayTheFlyPro", version: "1" }
 * PaymentRequest struct: (projectId string, token address, amount uint256, serialNo string, deadline uint256)
 */
module.exports = function (knex) {
    let createOrder = async function (req, res, next) {
        try {
            let userId = req.user && req.user.get("id");
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }

            let { amount, service_instance_id } = req.body;
            if (!amount || parseFloat(amount) <= 0) {
                return res.status(400).json({ error: "Invalid amount" });
            }

            let projectId = process.env.PAYTHEFLY_PROJECT_ID;
            let chainId = parseInt(process.env.PAYTHEFLY_CHAIN_ID || "56");
            let tokenAddress = process.env.PAYTHEFLY_TOKEN_ADDRESS;

            if (!projectId || !tokenAddress) {
                return res.status(500).json({ error: "PayTheFly is not configured" });
            }

            // Generate unique serial number
            let serialNo = crypto.randomBytes(32).toString("hex");
            let deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes

            // Store pending order
            let [orderId] = await knex("paythefly_orders").insert({
                serial_no: serialNo,
                user_id: userId,
                service_instance_id: service_instance_id || null,
                amount: amount.toString(),
                chain_id: chainId,
                deadline: deadline,
                status: "pending",
                created_at: knex.fn.now(),
                updated_at: knex.fn.now(),
            });

            res.status(200).json({
                status: true,
                order_id: orderId,
                serial_no: serialNo,
                amount: amount.toString(),
                deadline: deadline,
                chain_id: chainId,
                project_id: projectId,
                token_address: tokenAddress,
            });
        } catch (err) {
            console.error("[PayTheFly] Create order error:", err);
            res.status(500).json({ error: "Failed to create payment order" });
        }
    };

    return {
        endpoint: "/paythefly/create",
        method: "post",
        middleware: [createOrder],
        permissions: ["can_administrate", "can_manage"],
        description: "Create PayTheFly Crypto Payment Order",
    };
};
