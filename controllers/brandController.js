const Brand = require('../models/Brand');

// Create a new brand
exports.createBrand = async (req, res) => {
  try {
    const brand = new Brand(req.body);
    await brand.save();
    
    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Brand name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all brands
exports.getAllBrands = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const brands = await Brand.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalBrands = await Brand.countDocuments(filter);
    const totalPages = Math.ceil(totalBrands / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: brands,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBrands,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single brand
exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let brand;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      brand = await Brand.findById(id);
    } else {
      brand = await Brand.findOne({ slug: id });
    }
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update brand
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    
    const brand = await Brand.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete brand
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    
    const brand = await Brand.findByIdAndDelete(id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
