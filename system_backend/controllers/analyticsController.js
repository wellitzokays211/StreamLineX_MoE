import pool from "../config/db.js";

export const getAllAnalytics = async (req, res) => {
    try {
        // Execute all analytics queries in parallel
        const [
            salesTrends,
            productSales,
            orderStatus,
            materialUsage,
            paymentStatuses
        ] = await Promise.all([
            pool.query(`
                SELECT 
                    DATE_FORMAT(order_date, '%Y-%m') as month,
                    SUM(total_amount) as total_sales
                FROM orders
                GROUP BY DATE_FORMAT(order_date, '%Y-%m')
                ORDER BY month
            `),
            pool.query(`
                SELECT 
                    p.name,
                    SUM(oi.quantity) as total_sold
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                GROUP BY p.product_id
                ORDER BY total_sold DESC
                LIMIT 5
            `),
            pool.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM custom_orders
                GROUP BY status
            `),
            pool.query(`
                SELECT 
                    m.item_name,
                    m.available_qty,
                    SUM(ii.quantity) as used_qty
                FROM materials m
                LEFT JOIN invoice_items ii ON m.item_name = ii.material_name
                GROUP BY m.item_id
            `),
            pool.query(`
                SELECT 
                    payment_status,
                    COUNT(*) as count
                FROM orders
                GROUP BY payment_status
            `)
        ]);

        res.json({
            salesTrends: salesTrends[0],
            productSales: productSales[0],
            orderStatus: orderStatus[0],
            materialUsage: materialUsage[0],
            paymentStatuses: paymentStatuses[0]
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: error.message,
            message: "Failed to fetch analytics data"
        });
    }
};

