import pool from '../config/db.js';

// Create a new quotation
export const createQuotation = async (req, res) => {
  const { job_description, userId } = req.body;

  if (!job_description || !userId) {
    return res.status(400).json({ success: false, message: "Job description and userId are required" });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO quotations (customer_id, job_description, quotation_amount, status) VALUES (?, ?, 0.00, "Pending")',
      [userId, job_description]
    );
    return res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      quotationId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error creating quotation" });
  }
};

// Get all quotations for a customer
export const getQuotations = async (req, res) => {
  const customerId = req.body.userId; // Assume userId is passed in the request body

  try {
    const [quotations] = await pool.query(
      'SELECT * FROM quotations WHERE customer_id = ?',
      [customerId]
    );

    return res.status(200).json({
      success: true,
      quotations,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error fetching quotations" });
  }
};

// Get all quotations for the admin
export const getAllQuotationsForAdmin = async (req, res) => {
  try {
    // Assuming the 'quotations' table has a 'customer_id' field that references the 'customers' table
    const [quotations] = await pool.query(`
      SELECT q.*, c.customer_name 
      FROM quotations q
      JOIN customers c ON q.customer_id = c.CustomerID
    `);
    
    return res.status(200).json({
      success: true,
      quotations,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error fetching quotations" });
  }
};


// Update quotation status
export const updateQuotationStatus = async (req, res) => {
  const { quotationId, status } = req.body;

  try {
    // Update the quotation status
    await pool.query(
      'UPDATE quotations SET status = ? WHERE id = ?',
      [status, quotationId]
    );

    // If the status is "Approved", save it as a job
    if (status === "Approved") {
      // Fetch the quotation details along with customer_id
      const [quotation] = await pool.query(
        'SELECT job_description AS name, customer_id, quotation_amount FROM quotations WHERE id = ?',
        [quotationId]
      );

      // Check if quotation exists
      if (quotation.length > 0) {
        const jobName = quotation[0].name;
        const customerId = quotation[0].customer_id;
        const quotationAmount = quotation[0].quotation_amount;
        const startDate = new Date(); // Set current date as start date
        const finishDate = null;
        const jobStatus = "Pending";

        // Save as job with customer_id
        await pool.query(
          'INSERT INTO jobs (quotation_id, job_name, start_date, finish_date, status, customer_id, quotation_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [quotationId, jobName, startDate, finishDate, jobStatus, customerId, quotationAmount]
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Quotation status updated successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error updating quotation status" });
  }
};


// Create an invoice and add items to it
export const createInvoice = async (req, res) => {
  const { quotationId, invoiceAmount, materials } = req.body;

  try {
    // Create the invoice with paid_amount and payment_status
    const [invoiceResult] = await pool.query(
      'INSERT INTO invoices (quotation_id, total_amount, paid_amount, payment_status) VALUES (?, ?, 0, "Pending")',
      [quotationId, invoiceAmount]
    );

    // Add materials to the invoice
    for (const material of materials) {
      await pool.query(
        'INSERT INTO invoice_items (invoice_id, material_name, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [invoiceResult.insertId, material.material_name, material.quantity, material.unit_price]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error creating invoice" });
  }
};
export const addPayment = async (req, res) => {
  const { invoiceId, paymentAmount } = req.body;

  try {
    // Get the current invoice data
    const [invoice] = await pool.query(
      'SELECT total_amount, paid_amount FROM invoices WHERE id = ?',
      [invoiceId]
    );

    if (invoice.length === 0) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const { total_amount, paid_amount } = invoice[0];
    const newPaidAmount = parseFloat(paid_amount) + parseFloat(paymentAmount);

    // Determine the new payment status
    let paymentStatus = 'Partially Paid';
    if (newPaidAmount >= total_amount) {
      paymentStatus = 'Completed';
    }

    // Update the invoice
    await pool.query(
      'UPDATE invoices SET paid_amount = ?, payment_status = ? WHERE id = ?',
      [newPaidAmount, paymentStatus, invoiceId]
    );

    return res.status(200).json({
      success: true,
      message: 'Payment added successfully',
      newPaidAmount,
      paymentStatus
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error adding payment" });
  }
};

export const getInvoicesByUserId = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    // Fetch all invoices for the specific user with related custom order details
    const [invoices] = await pool.query(
      `SELECT 
        i.id AS invoice_id,
        i.quotation_id,
        i.total_amount,
        i.paid_amount,
        i.payment_status,
        i.created_at,
        co.customer_id, 
        co.description AS job_description,
        co.status AS order_status
      FROM invoices i
      JOIN custom_orders co ON i.quotation_id = co.order_id
      WHERE co.customer_id = ?
      ORDER BY i.created_at DESC`,
      [userId]
    );

    // Fetch invoice items for each invoice
    const invoiceDetails = await Promise.all(
      invoices.map(async (invoice) => {
        const [items] = await pool.query(
          `SELECT 
            material_name, 
            quantity, 
            unit_price 
          FROM invoice_items 
          WHERE invoice_id = ?`,
          [invoice.invoice_id]
        );
        return {
          ...invoice,
          items,
        };
      })
    );

    return res.status(200).json({
      success: true,
      invoices: invoiceDetails,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error fetching invoices",
    });
  }
};

export const getAllInvoicesAdmin = async (req, res) => {
  try {
    // Fetch all invoices with custom order details for admin view
    const [invoices] = await pool.query(
      `SELECT 
        i.id AS invoice_id,
        i.quotation_id,
        i.total_amount,
        i.created_at,
        i.paid_amount,
        i.payment_status,
        co.customer_id,
        co.description AS job_description,
        co.status AS order_status
      FROM invoices i
      JOIN custom_orders co ON i.quotation_id = co.order_id
      ORDER BY i.created_at DESC`
    );

    // Fetch invoice items for each invoice
    const invoiceDetails = await Promise.all(
      invoices.map(async (invoice) => {
        const [items] = await pool.query(
          `SELECT 
            material_name, 
            quantity, 
            unit_price 
          FROM invoice_items 
          WHERE invoice_id = ?`,
          [invoice.invoice_id]
        );
        return {
          ...invoice,
          items,
        };
      })
    );

    return res.status(200).json({
      success: true,
      invoices: invoiceDetails,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error fetching invoices",
    });
  }
};
// Ensure you're expecting both 'userId' and 'invoiceId' in the request body
export const getInvoicesByUserId2 = async (req, res) => {
  const { userId, invoiceId } = req.body;

  if (!userId || !invoiceId) {
    return res.status(400).json({
      success: false,
      message: "User ID and Invoice ID are required",
    });
  }

  try {
    // Fetch invoice details based on both userId and invoiceId
    const [invoices] = await pool.query(
      `SELECT 
        i.id AS invoice_id,
        i.quotation_id,
        i.total_amount,
        i.paid_amount,
        i.payment_status,
        i.created_at,
        q.customer_id, 
        q.job_description
      FROM invoices i
      JOIN quotations q ON i.quotation_id = q.id
      WHERE q.customer_id = ? AND i.id = ?  -- Check both userId (customer_id) and invoiceId
      ORDER BY i.created_at DESC`,
      [userId, invoiceId]  // Use both userId and invoiceId from the request body
    );

    // Fetch invoice items for each invoice
    const invoiceDetails = await Promise.all(
      invoices.map(async (invoice) => {
        const [items] = await pool.query(
          `SELECT 
            material_name, 
            quantity, 
            unit_price 
          FROM invoice_items 
          WHERE invoice_id = ?`,
          [invoice.invoice_id]
        );
        return {
          ...invoice,
          items,
        };
      })
    );

    return res.status(200).json({
      success: true,
      invoices: invoiceDetails,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error fetching invoices",
    });
  }
};
export const getAllJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query('SELECT * FROM jobs');
    res.status(200).json({
      success: true,
      jobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching jobs" });
  }
};
export const updateJob = async (req, res) => {
  const { jobId, startDate, finishDate, status } = req.body;

  try {
    await pool.query(
      'UPDATE jobs SET start_date = ?, finish_date = ?, status = ? WHERE id = ?',
      [startDate, finishDate, status, jobId]
    );

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating job" });
  }
};
export const getJobsByCustomerId = async (req, res) => {
  const { userId } = req.body;

  try {
    // Fetch jobs for the specified customer_id
    const [jobs] = await pool.query(
      'SELECT * FROM jobs WHERE customer_id = ?',
      [userId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No jobs found for this customer',
      });
    }

    return res.status(200).json({
      success: true,
      jobs,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
    });
  }
};
export const createInvoices = async (req, res) => {
  const { invoiceAmount, materials } = req.body;

  // Auto-generate quotation_id using timestamp (or use UUID for more uniqueness)
  const quotationId = Date.now(); // or use `uuidv4()` from 'uuid'

  try {
    // Insert into invoice table
    const [invoiceResult] = await pool.query(
      'INSERT INTO invoice (quotation_id, total_amount, paid_amount, payment_status) VALUES (?, ?, 0, "Pending")',
      [quotationId, invoiceAmount]
    );

    // Insert materials into invoice_item table
    for (const material of materials) {
      await pool.query(
        'INSERT INTO invoice_item (invoice_id, material_name, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [invoiceResult.insertId, material.material_name, material.quantity, material.unit_price]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      quotationId, // return for reference
      invoiceId: invoiceResult.insertId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error creating invoice' });
  }
};
