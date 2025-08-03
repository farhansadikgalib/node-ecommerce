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
categorySchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isNew) {
    // Generate base slug
    let baseSlug = this.name.toLowerCase()
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
  next();
});

module.exports = mongoose.model('Category', categorySchema);
