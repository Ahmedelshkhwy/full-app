const mongoose = require('mongoose');
require('dotenv').config();

const createSampleData = async () => {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy');
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // تعريف النماذج مباشرة
    const categorySchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true },
      description: { type: String },
      image: { type: String }
    }, {
      timestamps: true
    });

    const productSchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true },
      description: { type: String },
      price: { type: Number, required: true },
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
      image: { type: String },
      stock: { type: Number, default: 0 }
    }, {
      timestamps: true
    });

    const Category = mongoose.model('Category', categorySchema);
    const Product = mongoose.model('Product', productSchema);

    // إنشاء الفئات
    const categories = [
      { name: 'مسكنات الألم', description: 'أدوية لتسكين الآلام المختلفة' },
      { name: 'فيتامينات', description: 'مكملات غذائية وفيتامينات' },
      { name: 'أدوية البرد والإنفلونزا', description: 'علاجات نزلات البرد والإنفلونزا' },
      { name: 'أدوية الجهاز الهضمي', description: 'علاجات مشاكل المعدة والجهاز الهضمي' },
      { name: 'أدوية الحساسية', description: 'علاجات الحساسية والجيوب الأنفية' }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (!existingCategory) {
        const category = new Category(categoryData);
        await category.save();
        createdCategories.push(category);
        console.log(`✅ تم إنشاء فئة: ${categoryData.name}`);
      } else {
        createdCategories.push(existingCategory);
        console.log(`⚠️  الفئة موجودة بالفعل: ${categoryData.name}`);
      }
    }

    // إنشاء المنتجات
    const products = [
      {
        name: 'باراسيتامول 500mg',
        description: 'مسكن للألم وخافض للحرارة',
        price: 15.00,
        category: createdCategories[0]._id,
        image: 'https://via.placeholder.com/300x300?text=Paracetamol',
        stock: 100
      },
      {
        name: 'إيبوبروفين 400mg',
        description: 'مسكن للألم ومضاد للالتهاب',
        price: 20.00,
        category: createdCategories[0]._id,
        image: 'https://via.placeholder.com/300x300?text=Ibuprofen',
        stock: 75
      },
      {
        name: 'فيتامين سي 1000mg',
        description: 'مكمل غذائي لتقوية المناعة',
        price: 45.00,
        category: createdCategories[1]._id,
        image: 'https://via.placeholder.com/300x300?text=Vitamin+C',
        stock: 50
      },
      {
        name: 'فيتامين د3 1000IU',
        description: 'مكمل غذائي لصحة العظام',
        price: 35.00,
        category: createdCategories[1]._id,
        image: 'https://via.placeholder.com/300x300?text=Vitamin+D',
        stock: 60
      },
      {
        name: 'كونجستال',
        description: 'علاج احتقان الأنف والجيوب',
        price: 25.00,
        category: createdCategories[2]._id,
        image: 'https://via.placeholder.com/300x300?text=Congestal',
        stock: 40
      },
      {
        name: 'بانادول كولد',
        description: 'علاج أعراض البرد والإنفلونزا',
        price: 18.00,
        category: createdCategories[2]._id,
        image: 'https://via.placeholder.com/300x300?text=Panadol+Cold',
        stock: 55
      },
      {
        name: 'أوميبرازول 20mg',
        description: 'علاج حموضة المعدة',
        price: 30.00,
        category: createdCategories[3]._id,
        image: 'https://via.placeholder.com/300x300?text=Omeprazole',
        stock: 35
      },
      {
        name: 'دومبي',
        description: 'علاج الغثيان والقيء',
        price: 22.00,
        category: createdCategories[3]._id,
        image: 'https://via.placeholder.com/300x300?text=Dompy',
        stock: 45
      },
      {
        name: 'كلاريتين 10mg',
        description: 'علاج الحساسية والجيوب الأنفية',
        price: 28.00,
        category: createdCategories[4]._id,
        image: 'https://via.placeholder.com/300x300?text=Claritin',
        stock: 30
      },
      {
        name: 'زيرتيك 10mg',
        description: 'علاج الحساسية الموسمية',
        price: 32.00,
        category: createdCategories[4]._id,
        image: 'https://via.placeholder.com/300x300?text=Zyrtec',
        stock: 25
      }
    ];

    for (const productData of products) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ تم إنشاء منتج: ${productData.name} - ${productData.price} ريال`);
      } else {
        console.log(`⚠️  المنتج موجود بالفعل: ${productData.name}`);
      }
    }

    console.log('🎉 تم إنشاء البيانات التجريبية بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
};

// تشغيل السكريبت
createSampleData(); 