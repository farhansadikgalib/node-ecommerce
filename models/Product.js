const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: { 
    type: String, 
    required: true, 
    unique: true 
  },
  attributes: {
    color: String,
    size: String,
    storage: String,
    ram: String,
    // Add more attributes as needed
    other: mongoose.Schema.Types.Mixed
  },
  price: { 
    type: Number, 
    required: true 
  },
  stock: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  image: String
});

const reviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  title: String,
  comment: String,
  date: { 
    type: Date, 
    default: Date.now 
  },
  isVerifiedPurchase: { 
    type: Boolean, 
    default: false 
  }
});

const faqSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true 
  },
  answer: { 
    type: String, 
    required: true 
  }
});

const productSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true 
    },
    slug: { 
      type: String, 
      unique: true,
      lowercase: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    brand: {
      brandId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Brand', 
        required: true 
      },
      name: { 
        type: String, 
        required: true 
      }
    },
    category: {
      categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
      },
      name: { 
        type: String, 
        required: true 
      }
    },
    seller: {
      sellerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      name: { 
        type: String, 
        required: true 
      },
      rating: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 5 
      }
    },
    price: {
      basePrice: { 
        type: Number, 
        required: true, 
        min: 0 
      },
      discount: {
        type: { 
          type: String, 
          enum: ['percentage', 'fixed'], 
          default: 'percentage' 
        },
        value: { 
          type: Number, 
          default: 0, 
          min: 0 
        }
      },
      finalPrice: { 
        type: Number, 
        required: true, 
        min: 0 
      }
    },
    stock: {
      total: { 
        type: Number, 
        required: true, 
        min: 0 
      },
      availability: { 
        type: String, 
        enum: ['in_stock', 'out_of_stock', 'limited'], 
        default: 'in_stock' 
      }
    },
    images: [{ 
      type: String, 
      required: true 
    }],
    videos: [String],
    highlights: [String],
    variants: [variantSchema],
    specifications: {
      general: {
        model: String,
        os: String,
        releaseDate: Date
      },
      display: {
        type: String,
        size: String,
        resolution: String
      },
      hardware: {
        processor: String,
        ram: String,
        storage: String
      },
      camera: {
        rear: String,
        front: String
      },
      battery: {
        capacity: String,
        charging: String
      },
      connectivity: {
        sim: String,
        network: String,
        wifi: String,
        bluetooth: String
      },
      // Allow additional custom specifications
      other: mongoose.Schema.Types.Mixed
    },
    tags: [String],
    faqs: [faqSchema],
    warranty: {
      type: { 
        type: String, 
        default: 'Brand Warranty' 
      },
      duration: String,
      details: String
    },
    shipping: {
      weight: String,
      dimensions: String,
      deliveryTime: String,
      freeShipping: { 
        type: Boolean, 
        default: false 
      },
      fulfilledBy: String
    },
    ratings: {
      average: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 5 
      },
      count: { 
        type: Number, 
        default: 0 
      },
      breakdown: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 }
      }
    },
    reviews: [reviewSchema],
    status: {
      isActive: { 
        type: Boolean, 
        default: true 
      },
      isFeatured: { 
        type: Boolean, 
        default: false 
      },
      isApproved: { 
        type: Boolean, 
        default: false 
      }
    }
  },
  { timestamps: true }
);

// Generate slug before saving
productSchema.pre('save', async function(next) {
  if (this.isModified('title') || this.isNew) {
    // Generate base slug
    let baseSlug = this.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    // Ensure uniqueness
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.constructor.findOne({ slug: slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  // Calculate final price
  if (this.isModified('price.basePrice') || this.isModified('price.discount') || this.isNew) {
    const { basePrice, discount } = this.price;
    if (discount && discount.type === 'percentage') {
      this.price.finalPrice = basePrice - (basePrice * discount.value / 100);
    } else if (discount && discount.type === 'fixed') {
      this.price.finalPrice = Math.max(0, basePrice - discount.value);
    } else {
      this.price.finalPrice = basePrice;
    }
  }
  
  // Update stock availability based on total stock
  if (this.isModified('stock.total') || this.isNew) {
    if (this.stock.total === 0) {
      this.stock.availability = 'out_of_stock';
    } else if (this.stock.total <= 10) {
      this.stock.availability = 'limited';
    } else {
      this.stock.availability = 'in_stock';
    }
  }
  
  next();
});

// Method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
    return;
  }
  
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;
  
  this.reviews.forEach(review => {
    totalRating += review.rating;
    breakdown[review.rating]++;
  });
  
  this.ratings.average = parseFloat((totalRating / this.reviews.length).toFixed(1));
  this.ratings.count = this.reviews.length;
  this.ratings.breakdown = breakdown;
};

// Index for better query performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ 'brand.brandId': 1 });
productSchema.index({ 'category.categoryId': 1 });
productSchema.index({ 'seller.sellerId': 1 });
productSchema.index({ 'price.finalPrice': 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'status.isActive': 1, 'status.isApproved': 1 });

module.exports = mongoose.model('Product', productSchema);
