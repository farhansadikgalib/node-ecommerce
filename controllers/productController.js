const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const User = require('../models/User');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', JSON.stringify(req.body, null, 2));
    const productData = req.body;
    
    // Validate brand exists
    console.log('Validating brand:', productData.brand?.brandId);
    const brand = await Brand.findById(productData.brand.brandId);
    if (!brand) {
      console.log('Brand not found for ID:', productData.brand?.brandId);
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    console.log('Brand found:', brand.name);
    
    // Validate category exists
    console.log('Validating category:', productData.category?.categoryId);
    const category = await Category.findById(productData.category.categoryId);
    if (!category) {
      console.log('Category not found for ID:', productData.category?.categoryId);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    console.log('Category found:', category.name);
    
    // Validate seller exists
    console.log('Validating seller:', productData.seller?.sellerId);
    const seller = await User.findById(productData.seller.sellerId);
    if (!seller) {
      console.log('Seller not found for ID:', productData.seller?.sellerId);
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }
    console.log('Seller found:', seller.email);
    
    // Set brand and category names
    productData.brand.name = brand.name;
    productData.category.name = category.name;
    productData.seller.name = `${seller.firstName} ${seller.lastName}`;
    
    console.log('Final product data:', JSON.stringify(productData, null, 2));
    const product = new Product(productData);
    await product.save();
    console.log('Product created successfully:', product._id);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all products with filters and pagination
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      rating,
      availability,
      featured,
      seller
    } = req.query;
    
    // Build filter object
    const filter = {
      'status.isActive': true,
      'status.isApproved': true
    };
    
    if (category) filter['category.categoryId'] = category;
    if (brand) filter['brand.brandId'] = brand;
    if (seller) filter['seller.sellerId'] = seller;
    if (availability) filter['stock.availability'] = availability;
    if (featured === 'true') filter['status.isFeatured'] = true;
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter['price.finalPrice'] = {};
      if (minPrice) filter['price.finalPrice'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['price.finalPrice'].$lte = parseFloat(maxPrice);
    }
    
    // Rating filter
    if (rating) {
      filter['ratings.average'] = { $gte: parseFloat(rating) };
    }
    
    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const products = await Product.find(filter)
      .populate('brand.brandId', 'name logo')
      .populate('category.categoryId', 'name image')
      .populate('seller.sellerId', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews'); // Exclude reviews for list view
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single product by ID or slug
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by ObjectId first, then by slug
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ slug: id });
    }
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Populate references
    await product.populate([
      { path: 'brand.brandId', select: 'name logo website' },
      { path: 'category.categoryId', select: 'name image description' },
      { path: 'seller.sellerId', select: 'firstName lastName email' },
      { path: 'reviews.userId', select: 'firstName lastName' }
    ]);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Validate brand if being updated
    if (updateData.brand?.brandId) {
      const brand = await Brand.findById(updateData.brand.brandId);
      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }
      updateData.brand.name = brand.name;
    }
    
    // Validate category if being updated
    if (updateData.category?.categoryId) {
      const category = await Category.findById(updateData.category.categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      updateData.category.name = category.name;
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await Product.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add product review
exports.addProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, title, comment } = req.body;
    
    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.userId.toString() === userId
    );
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }
    
    // Add review
    const newReview = {
      userId,
      name: `${user.firstName} ${user.lastName}`,
      rating,
      title,
      comment
    };
    
    product.reviews.push(newReview);
    
    // Recalculate ratings
    product.calculateAverageRating();
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: product.reviews[product.reviews.length - 1]
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, rating } = req.query;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    let reviews = product.reviews;
    
    // Filter by rating if specified
    if (rating) {
      reviews = reviews.filter(review => review.rating === parseInt(rating));
    }
    
    // Sort by date (newest first)
    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedReviews = reviews.slice(skip, skip + parseInt(limit));
    
    const totalReviews = reviews.length;
    const totalPages = Math.ceil(totalReviews / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: paginatedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      ratingSummary: product.ratings
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const featuredProducts = await Product.find({
      'status.isActive': true,
      'status.isApproved': true,
      'status.isFeatured': true
    })
      .populate('brand.brandId', 'name logo')
      .populate('category.categoryId', 'name')
      .sort({ 'ratings.average': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('-reviews -specifications');
    
    res.status(200).json({
      success: true,
      data: featuredProducts
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get products by seller
exports.getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find({
      'seller.sellerId': sellerId,
      'status.isActive': true,
      'status.isApproved': true
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews');
    
    const totalProducts = await Product.countDocuments({
      'seller.sellerId': sellerId,
      'status.isActive': true,
      'status.isApproved': true
    });
    
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
