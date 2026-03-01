/**
 * PayTheFly Order Status API
 *
 * Checks the status of a PayTheFly payment order.
 */
module.exports = function (knex) {
    let orderStatus = async function (req, res, next) {
        try {
            let userId = req.user && req.user.get("id");
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }

            let serialNo = req.query.serial_no;
            if (!serialNo) {
                return res.status(400).json({ error: "serial_no is required" });
            }

            let order = await knex("paythefly_orders")
                .where({ serial_no: serialNo, user_id: userId })
                .first();

            if (!order) {
                return res.status(404).json({ error: "Order not found" });
            }

            res.status(200).json({
                status: true,
                serial_no: order.serial_no,
                order_status: order.status,
                tx_hash: order.tx_hash || null,
                wallet: order.wallet || null,
                paid_value: order.paid_value || null,
                completed: order.status === "completed",
                created_at: order.created_at,
            });
        } catch (err) {
            console.error("[PayTheFly] Order status error:", err);
            res.status(500).json({ error: "Failed to check order status" });
        }
    };

    return {
        endpoint: "/paythefly/status",
        method: "get",
        middleware: [orderStatus],
        permissions: ["can_administrate", "can_manage"],
        description: "Check PayTheFly Payment Order Status",
    };
};
