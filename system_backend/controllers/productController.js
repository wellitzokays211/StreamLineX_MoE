import pool from "../config/db.js";

// Add Product (Handles one image per product)
export const addProduct = async (req, res) => {
  try {
    const { productId, name, category, price, stock, description } = req.body;

    if (!productId || !name || !category || !price || !stock) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    // Insert product into the database
    const [productResult] = await pool.query(
      'INSERT INTO products (product_id, name, category, price, stock, description) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, name, category, price, stock, description]
    );

    // Insert or update the image (replace existing image if already exists)
    if (req.file) {
      await pool.query(
        `INSERT INTO product_images (product_id, file_name, file_type, file_path)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE file_name = VALUES(file_name), file_type = VALUES(file_type), file_path = VALUES(file_path)`,
        [productId, req.file.filename, req.file.mimetype, req.file.path]
      );
    }

    res.json({
      success: true,
      message: 'Product added successfully!',
      product: {
        productId,
        name,
        category,
        price,
        stock,
        description,
        productImage: req.file ? req.file.filename : null,
      },
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add the product. Please try again.',
      error: error.message,
    });
  }
};

// Get All Products (Includes Image Data)
export const getAllProducts = async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT p.product_id, p.name, p.category, p.price, p.stock, p.description, pi.file_name FROM products p LEFT JOIN product_images pi ON p.product_id = pi.product_id'
    );

    const groupedProducts = products.reduce((acc, product) => {
      if (!acc[product.product_id]) {
        acc[product.product_id] = {
          productId: product.product_id,
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          description: product.description,
          productImage: null,
        };
      }

      if (product.file_name) {
        acc[product.product_id].productImage = product.file_name;
      }

      return acc;
    }, {});

    res.json({
      success: true,
      message: 'Products fetched successfully',
      products: Object.values(groupedProducts),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products. Please try again.',
      error: error.message,
    });
  }
};

// Update Product (Handles image update)
export const updateProduct = async (req, res) => {
  try {
    const { productId, name, category, price, stock, description } = req.body;

    if (!productId || !name || !category || !price || !stock) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    // Update product details
    const [updateResult] = await pool.query(
      'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, description = ? WHERE product_id = ?',
      [name, category, price, stock, description, productId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Update image if new one is uploaded
    if (req.file) {
      await pool.query(
        `INSERT INTO product_images (product_id, file_name, file_type, file_path)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE file_name = VALUES(file_name), file_type = VALUES(file_type), file_path = VALUES(file_path)`,
        [productId, req.file.filename, req.file.mimetype, req.file.path]
      );
    }

    res.json({
      success: true,
      message: 'Product updated successfully!',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product. Please try again.',
      error: error.message,
    });
  }
};

// Delete Product (Handles image deletion)
// In your deleteProduct controller
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;  // Changed from 'id' to 'productId'

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required to delete product.' 
      });
    }

    // Delete image if exists
    await pool.query('DELETE FROM product_images WHERE product_id = ?', [productId]);

    const [deleteResult] = await pool.query(
      'DELETE FROM products WHERE product_id = ?', 
      [productId]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found.' 
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully!',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product. Please try again.',
      error: error.message,
    });
  }
};