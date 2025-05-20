import pool from "../config/db.js";

export const processPayment = async (req, res) => {

    const customerId = req.body.userId
    const { items, paymentMethod } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Verify customer exists
        const [customer] = await connection.query(
            'SELECT CustomerID FROM customers WHERE CustomerID = ? LIMIT 1',
            [customerId]
        );
        
        if (customer.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Customer not found' });
        }

        // 2. Validate stock and calculate total
        let totalAmount = 0;
        const stockCheckQueries = items.map(item => 
            connection.query(
                'SELECT product_id, name, price, stock FROM products WHERE product_id = ? FOR UPDATE',
                [item.productId]
            )
        );

        const stockResults = await Promise.all(stockCheckQueries);
        
        for (let i = 0; i < items.length; i++) {
            const product = stockResults[i][0][0];
            const item = items[i];
            
            if (!product) {
                await connection.rollback();
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }
            
            if (product.stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({ 
                    error: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }
            
            totalAmount += product.price * item.quantity;
        }

        // 3. Calculate amount to pay
        const amountToPay = paymentMethod === 'advance' ? totalAmount * 0.3 : totalAmount;
        
        // 4. Create order
        const [orderResult] = await connection.query(
            `INSERT INTO orders SET
            customer_id = ?,
            total_amount = ?,
            payment_method = ?,
            amount_paid = ?,
            payment_status = 'paid',
            order_date = NOW()`,
            [customerId, totalAmount, paymentMethod, amountToPay]
        );
        
        const orderId = orderResult.insertId;
        
        // 5. Insert all order items
        const orderItemsValues = items.map(item => [
            orderId,
            item.productId,
            item.quantity,
            stockResults.find(r => r[0][0].product_id === item.productId)[0][0].price
        ]);

        await connection.query(
            `INSERT INTO order_items 
            (order_id, product_id, quantity, unit_price) 
            VALUES ?`,
            [orderItemsValues]
        );
        
        // 6. Update all product stocks
        for (const item of items) {
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE product_id = ?',
                [item.quantity, item.productId]
            );
        }

        await connection.commit();
        
        res.status(201).json({
            success: true,
            orderId,
            amountPaid: amountToPay.toFixed(2),
            paymentMethod,
            totalAmount: totalAmount.toFixed(2)
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Payment processing error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Payment processing failed',
            details: error.message 
        });
    } finally {
        connection.release();
    }
};

export const getAllOrders = async (req, res) => {
    try {
        // 1. Fetch all orders
        const [orders] = await pool.query(
            'SELECT * FROM orders ORDER BY order_date DESC'
        );

        // 2. If no orders found, return empty array
        if (orders.length === 0) {
            return res.json([]);
        }

        // 3. Fetch items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const [items] = await pool.query(
                    'SELECT * FROM order_items WHERE order_id = ?',
                    [order.order_id]
                );
                return {
                    ...order,
                    items
                };
            })
        );

        // 4. Send the final response (ONLY ONCE)
        res.json(ordersWithItems);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};
export const getOrdersByCustomerId = async (req, res) => {
    const customerId = req.body.userId; // or req.params.customerId, depending on your route
    
    if (!customerId || isNaN(customerId)) {
        return res.status(400).json({ error: 'Valid customer ID is required' });
    }

    try {
        // 1. Fetch orders for the customer
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC',
            [customerId]
        );

        // 2. If no orders found, return empty array (or 404 if preferred)
        if (orders.length === 0) {
            return res.json([]); // or res.status(404).json({ error: 'No orders found' });
        }

        // 3. Fetch items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const [items] = await pool.query(
                    'SELECT * FROM order_items WHERE order_id = ?',
                    [order.order_id]
                );
                return {
                    ...order,
                    items
                };
            })
        );

        // 4. Send the final response (ONLY ONCE)
        res.json(ordersWithItems);
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};
// Create Custom Order
export const createCustomOrder = async (req, res) => {
  try {
    
    const { customerId , description, quantity, specialNotes } = req.body;

    if (!customerId || !description || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer ID, description, and quantity are required.' 
      });
    }

    // Insert order into database
    const [result] = await pool.query(
      `INSERT INTO custom_orders 
       (customer_id, description, quantity, special_notes)
       VALUES (?, ?, ?, ?)`,
      [customerId, description, quantity, specialNotes || null]
    );

    const orderId = result.insertId; // Get the auto-incremented ID

    // Save design files if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await pool.query(
          `INSERT INTO custom_order_designs
           (order_id, file_name, file_type, file_path)
           VALUES (?, ?, ?, ?)`,
          [orderId, file.filename, file.mimetype, file.path]
        );
      }
    }

    res.json({
      success: true,
      message: 'Custom order created successfully!',
      orderId,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error creating custom order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom order.',
      error: error.message,
    });
  }
};

// Get All Custom Orders
export const getCustomOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.order_id, o.customer_id, o.description, o.quantity, 
              o.status, o.special_notes, o.created_at, o.updated_at,
              GROUP_CONCAT(d.file_name) as design_files
       FROM custom_orders o
       LEFT JOIN custom_order_designs d ON o.order_id = d.order_id
       GROUP BY o.order_id`
    );

    // Format the response
    const formattedOrders = orders.map(order => ({
      orderId: order.order_id,
      customerId: order.customer_id,
      description: order.description,
      quantity: order.quantity,
      status: order.status,
      specialNotes: order.special_notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      designFiles: order.design_files ? order.design_files.split(',') : []
    }));

    res.json({
      success: true,
      message: 'Custom orders fetched successfully',
      orders: formattedOrders,
    });
  } catch (error) {
    console.error('Error fetching custom orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom orders.',
      error: error.message,
    });
  }
};
// Get Orders by Customer ID
export const getOrderByCustomerId = async (req, res) => {
  try {
    const  customerId = req.body.userId; // or req.params.customerId, depending on your route

    if (!customerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer ID is required.' 
      });
    }

    // Get all orders for this customer
    const [orders] = await pool.query(
      `SELECT 
        o.order_id as orderId,
        o.description,
        o.quantity,
        o.status,
        o.special_notes as specialNotes,
        o.created_at as createdAt,
        o.updated_at as updatedAt,
        GROUP_CONCAT(d.file_name) as designFiles
       FROM custom_orders o
       LEFT JOIN custom_order_designs d ON o.order_id = d.order_id
       WHERE o.customer_id = ?
       GROUP BY o.order_id
       ORDER BY o.created_at DESC`,
      [customerId]
    );

    // Format the response
    const formattedOrders = orders.map(order => ({
      ...order,
      designFiles: order.designFiles ? order.designFiles.split(',') : []
    }));

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      customerId,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders.',
      error: error.message,
    });
  }
};
// Update order status
// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and status are required'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const [result] = await pool.query(
      'UPDATE custom_orders SET status = ? WHERE order_id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};
export const updateNewOrderStatus = async (req, res) => {
    const { order_id } = req.body   ;
    const { new_status } = req.body;

    // Validate input
    if (!order_id || !new_status) {
        return res.status(400).json({ 
            error: 'Both order_id and new_status are required' 
        });
    }

    // Validate the status is one of the allowed values
    const allowedStatuses = ['processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!allowedStatuses.includes(new_status)) {
        return res.status(400).json({ 
            error: 'Invalid status value',
            allowed_statuses: allowedStatuses
        });
    }

    try {
        // 1. Check if order exists
        const [order] = await pool.query(
            'SELECT * FROM orders WHERE order_id = ?',
            [order_id]
        );

        if (order.length === 0) {
            return res.status(404).json({ 
                error: 'Order not found' 
            });
        }

        const currentOrder = order[0];

        // 2. Additional validation based on current status
        if (new_status === 'processing' && currentOrder.current_status !== 'processing') {
            return res.status(400).json({ 
                error: 'Cannot revert order back to processing status' 
            });
        }

        if (new_status === 'cancelled' && currentOrder.current_status === 'delivered') {
            return res.status(400).json({ 
                error: 'Cannot cancel an already delivered order' 
            });
        }

        // 3. Update the order status
        await pool.query(
            'UPDATE orders SET current_status = ? WHERE order_id = ?',
            [new_status, order_id]
        );

        // 4. If order is being delivered, you might want to update delivery date
        if (new_status === 'delivered') {
            await pool.query(
                'UPDATE orders SET delivery_date = NOW() WHERE order_id = ?',
                [order_id]
            );
        }

        // 5. If order is cancelled, you might want to handle refunds
        if (new_status === 'cancelled') {
            // Check if payment was made
            if (currentOrder.payment_status === 'paid') {
                await pool.query(
                    'UPDATE orders SET payment_status = "refunded" WHERE order_id = ?',
                    [order_id]
                );
                
                // Here you would typically integrate with your payment gateway
                // to process the refund
            }
        }

        // 6. Get the updated order to return
        const [updatedOrder] = await pool.query(
            'SELECT * FROM orders WHERE order_id = ?',
            [order_id]
        );

        // 7. Send success response
        res.json({ 
            success: true,
            message: `Order status updated to ${new_status}`,
            order: updatedOrder[0]
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};
export const updateAmountPaid = async (req, res) => {
    const { orderId, amount_paid } = req.body;

    try {
        // 1. Validate input
        if (!orderId || isNaN(amount_paid)) {
            return res.status(400).json({ error: 'Invalid input parameters' });
        }

        // 2. Check if order exists
        const [order] = await pool.query(
            'SELECT * FROM orders WHERE order_id = ?',
            [orderId]
        );

        if (order.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const currentOrder = order[0];
        const totalAmount = parseFloat(currentOrder.total_amount);
        const newAmountPaid = parseFloat(amount_paid);

        // 3. Validate payment amount
        if (newAmountPaid < 0 || newAmountPaid > totalAmount) {
            return res.status(400).json({ 
                error: `Payment amount must be between 0 and ${totalAmount}`
            });
        }

        // 4. Update payment and force status to 'paid'
        await pool.query(
            `UPDATE orders 
            SET amount_paid = ?,
                payment_status = 'paid'
            WHERE order_id = ?`,
            [newAmountPaid, orderId]
        );

        // 5. Get updated order
        const [updatedOrder] = await pool.query(
            'SELECT * FROM orders WHERE order_id = ?',
            [orderId]
        );

        // 6. Get order items
        const [orderItems] = await pool.query(
            'SELECT * FROM order_items WHERE order_id = ?',
            [orderId]
        );

        // Combine order and items
        const responseData = {
            ...updatedOrder[0],
            items: orderItems
        };

        res.json(responseData);

    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};