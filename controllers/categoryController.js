const Category = require('../models/Category');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive, parentCategory } = req.query;
    
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
    if (parentCategory !== undefined) {
      filter.parentCategory = parentCategory === 'null' ? null : parentCategory;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const categories = await Category.find(filter)
      .populate('parentCategory', 'name slug')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalCategories = await Category.countDocuments(filter);
    const totalPages = Math.ceil(totalCategories / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCategories,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single category
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id).populate('parentCategory', 'name slug');
    } else {
      category = await Category.findOne({ slug: id }).populate('parentCategory', 'name slug');
    }
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Get subcategories
    const subcategories = await Category.find({ parentCategory: category._id });
    
    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        subcategories
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has subcategories
    const subcategories = await Category.find({ parentCategory: id });
    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories. Please delete subcategories first.'
      });
    }
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get category tree (hierarchical structure)
exports.getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    // Build tree structure
    const categoryMap = {};
    const tree = [];
    
    // First pass: create map
    categories.forEach(category => {
      categoryMap[category._id] = {
        ...category.toObject(),
        children: []
      };
    });
    
    // Second pass: build tree
    categories.forEach(category => {
      if (category.parentCategory) {
        if (categoryMap[category.parentCategory]) {
          categoryMap[category.parentCategory].children.push(categoryMap[category._id]);
        }
      } else {
        tree.push(categoryMap[category._id]);
      }
    });
    
    res.status(200).json({
      success: true,
      data: tree
    });
  } catch (error) {
    console.error('Error fetching category tree:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
