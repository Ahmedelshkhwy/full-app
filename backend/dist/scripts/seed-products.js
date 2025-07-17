"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const product_model_1 = __importDefault(require("../models/product.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const MONGODB_URI = 'mongodb://localhost:27017/pharmacy_db';
// بيانات المنتجات
const PRODUCTS_DATA = [
    {
        name: 'بنادول اكسترا',
        description: 'مسكن للألم وخافض للحرارة',
        price: 12,
        image: 'https://placehold.co/100x100?text=بنادول',
        stock: 50
    },
    {
        name: 'أدفيل 200 ملجم',
        description: 'مسكن للألم ومضاد للالتهاب',
        price: 15,
        image: 'https://placehold.co/100x100?text=أدفيل',
        stock: 40
    },
    {
        name: 'فيتامين سي 1000',
        description: 'مكمل غذائي لتقوية المناعة',
        price: 25,
        image: 'https://placehold.co/100x100?text=Vit+C',
        stock: 30
    },
    {
        name: 'زنك بلس',
        description: 'مكمل غذائي للزنك',
        price: 22,
        image: 'https://placehold.co/100x100?text=Zinc+',
        stock: 35
    },
    {
        name: 'باراسيتامول',
        description: 'مسكن للألم وخافض للحرارة',
        price: 10,
        image: 'https://placehold.co/100x100?text=باراسيتامول',
        stock: 60
    },
    {
        name: 'ديكلوفيناك جل',
        description: 'جل مسكن للآلام العضلية',
        price: 18,
        image: 'https://placehold.co/100x100?text=ديكلوفيناك',
        stock: 25
    },
    {
        name: 'فيتامين د 5000',
        description: 'مكمل غذائي لفيتامين د',
        price: 30,
        image: 'https://placehold.co/100x100?text=Vit+D',
        stock: 20
    },
    {
        name: 'مكمل أوميغا 3',
        description: 'مكمل غذائي للأوميغا 3',
        price: 35,
        image: 'https://placehold.co/100x100?text=Omega+3',
        stock: 15
    },
    {
        name: 'مرطب شفايف نيفيا',
        description: 'مرطب للشفايف',
        price: 14,
        image: 'https://placehold.co/100x100?text=Nivea',
        stock: 45
    },
    {
        name: 'شامبو هيد اند شولدرز',
        description: 'شامبو للشعر',
        price: 28,
        image: 'https://placehold.co/100x100?text=Shampoo',
        stock: 30
    },
    {
        name: 'كريم بيبانثين',
        description: 'كريم للبشرة الحساسة',
        price: 32,
        image: 'https://placehold.co/100x100?text=Bepanthen',
        stock: 20
    },
    {
        name: 'مرهم فيوسيدين',
        description: 'مرهم مضاد حيوي',
        price: 19,
        image: 'https://placehold.co/100x100?text=Fucidin',
        stock: 25
    },
    {
        name: 'مكمل كالسيوم',
        description: 'مكمل غذائي للكالسيوم',
        price: 27,
        image: 'https://placehold.co/100x100?text=Calcium',
        stock: 30
    },
    {
        name: 'غسول سيباميد',
        description: 'غسول للبشرة الحساسة',
        price: 36,
        image: 'https://placehold.co/100x100?text=Sebamed',
        stock: 15
    },
    {
        name: 'ديتول معقم',
        description: 'معقم ومطهر',
        price: 16,
        image: 'https://placehold.co/100x100?text=Dettol',
        stock: 40
    },
    {
        name: 'كريم فيتامين E',
        description: 'كريم فيتامين E للبشرة',
        price: 21,
        image: 'https://placehold.co/100x100?text=Vit+E',
        stock: 25
    },
    {
        name: 'مرطب افين',
        description: 'مرطب للبشرة الحساسة',
        price: 38,
        image: 'https://placehold.co/100x100?text=Avene',
        stock: 10
    },
    {
        name: 'مكياج ريميل',
        description: 'مكياج عيون',
        price: 45,
        image: 'https://placehold.co/100x100?text=Rimmel',
        stock: 20
    },
    {
        name: 'واقي شمس لاروش',
        description: 'واقي شمس للبشرة',
        price: 55,
        image: 'https://placehold.co/100x100?text=LaRoche',
        stock: 15
    },
    {
        name: 'قطرة ريفريش للعين',
        description: 'قطرة لترطيب العين',
        price: 24,
        image: 'https://placehold.co/100x100?text=Refresh',
        stock: 30
    }
];
async function seedProducts() {
    try {
        // الاتصال بقاعدة البيانات
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ تم الاتصال بقاعدة البيانات');
        // إنشاء فئة افتراضية إذا لم تكن موجودة
        let defaultCategory = await category_model_1.default.findOne({ name: 'أدوية عامة' });
        if (!defaultCategory) {
            defaultCategory = await category_model_1.default.create({
                name: 'أدوية عامة',
                description: 'فئة عامة للمنتجات الطبية'
            });
            console.log('✅ تم إنشاء الفئة الافتراضية');
        }
        // حذف المنتجات الموجودة
        await product_model_1.default.deleteMany({});
        console.log('✅ تم حذف المنتجات القديمة');
        // إضافة المنتجات الجديدة
        const productsWithCategory = PRODUCTS_DATA.map(product => ({
            ...product,
            category: defaultCategory._id
        }));
        const createdProducts = await product_model_1.default.insertMany(productsWithCategory);
        console.log(`✅ تم إضافة ${createdProducts.length} منتج`);
        // عرض المنتجات المضافة
        console.log('\n📋 المنتجات المضافة:');
        createdProducts.forEach(product => {
            console.log(`- ${product.name}: ${product.price} ر.س`);
        });
        console.log('\n🎉 تم إضافة المنتجات بنجاح!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ خطأ في إضافة المنتجات:', error);
        process.exit(1);
    }
}
// تشغيل السكريبت
seedProducts();
//# sourceMappingURL=seed-products.js.map