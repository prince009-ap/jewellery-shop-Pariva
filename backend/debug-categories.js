const mongoose = require('mongoose');

// Simple product schema for debugging
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  image: String,
  images: [String],
  metal: String,
  purity: String,
  occasion: String,
  price: Number,
  weight: Number
});

const Product = mongoose.model('Product', productSchema);

mongoose.connect('mongodb://localhost:27017/jewellery-shop')
  .then(async () => {
    console.log('Connected to DB');
    
    try {
      // Get all unique categories
      const categories = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      console.log('Categories in DB with counts:');
      categories.forEach(cat => {
        console.log('  - ' + cat._id + ': ' + cat.count + ' products');
      });
      
      // Get sample products for each category
      for (const catData of categories) {
        const products = await Product.find({ category: catData._id }).limit(3);
        console.log('\nCategory: ' + catData._id);
        products.forEach(p => {
          console.log('  - Name: ' + p.name);
          console.log('  - Image: ' + p.image);
          console.log('  - Images: ' + (p.images ? p.images.length : 0));
          if (p.images && p.images.length > 0) {
            console.log('  - Image array: ' + JSON.stringify(p.images));
          }
        });
      }
      
    } catch (err) {
      console.error('Query Error:', err);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('DB Error:', err);
    process.exit(1);
  });
