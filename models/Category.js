const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true 
    },
    description: { 
      type: String 
    },
    image: { 
      type: String 
    },
    parentCategory: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category',
      default: null 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

// Generate slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
