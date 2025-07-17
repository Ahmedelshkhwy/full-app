import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Discount from '../models/discount.model';
import Product from '../models/product.model';

// جلب العروض المتاحة للمستخدمين
export const getAvailableOffers = async (_req: Request, res: Response) => {
  try {
    console.log('🔍 جلب العروض المتاحة...');
    
    // جلب الخصومات المفعلة والصالحة
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).populate({
      path: 'applicableProducts',
      populate: {
        path: 'category',
        select: 'name'
      }
    }).populate('applicableCategories');

    console.log(`📊 تم العثور على ${discounts.length} خصم مفعل`);

    // تحويل الخصومات إلى عروض
    const offers = [];
    
    for (const discount of discounts) {
      if (discount.applicableProducts && discount.applicableProducts.length > 0) {
        for (const product of discount.applicableProducts) {
          // Type guard to ensure product is populated
          if (product && typeof product === 'object' && !(product instanceof Types.ObjectId)) {
            const originalPrice = (product as any).price;
            let discountPrice = originalPrice;
            
            // التأكد من أن السعر الأصلي صحيح
            if (!originalPrice || originalPrice <= 0) {
              console.warn(`Product ${(product as any).name} has invalid price: ${originalPrice}`);
              continue;
            }
            
            if (discount.discountType === 'percentage') {
              discountPrice = originalPrice * (1 - discount.discountValue / 100);
              if (discount.maxDiscount) {
                discountPrice = Math.max(discountPrice, originalPrice - discount.maxDiscount);
              }
            } else {
              discountPrice = Math.max(0, originalPrice - discount.discountValue);
            }

            // التأكد من أن السعر النهائي صحيح
            if (discountPrice <= 0 || discountPrice >= originalPrice) {
              console.warn(`Invalid discount price for product ${(product as any).name}: ${discountPrice}`);
              continue;
            }

            offers.push({
              _id: `${discount._id}_${(product as any)._id}`,
              title: discount.name || 'عرض مميز',
              description: discount.description || `خصم على ${(product as any).name}`,
              originalPrice: Math.round(originalPrice * 100) / 100,
              discountPrice: Math.round(discountPrice * 100) / 100,
              discountPercentage: Math.round((1 - discountPrice / originalPrice) * 100),
              image: (product as any).image ? `http://192.168.8.87:5000${(product as any).image}` : null,
              validUntil: discount.endDate,
              category: (product as any).category?.name || 'عام',
              productId: (product as any)._id,
              isActive: true,
              product: {
                _id: (product as any)._id,
                name: (product as any).name || 'منتج غير محدد',
                price: Math.round(originalPrice * 100) / 100,
                image: (product as any).image ? `http://192.168.8.87:5000${(product as any).image}` : null,
                category: (product as any).category
              },
              discount: {
                _id: discount._id,
                code: discount.code,
                type: discount.discountType,
                value: discount.discountValue,
                startDate: discount.startDate,
                endDate: discount.endDate
              }
            });
          }
        }
      }

      // عروض على الفئات
      if (discount.applicableCategories && discount.applicableCategories.length > 0) {
        for (const category of discount.applicableCategories) {
          if (category && typeof category === 'object' && !(category instanceof Types.ObjectId)) {
            // جلب المنتجات المتعلقة بهذه الفئة
            const categoryProducts = await Product.find({ 
              category: (category as any)._id 
            }).limit(5); // أخذ أول 5 منتجات كعينة

            offers.push({
              _id: `${discount._id}_category_${(category as any)._id}`,
              title: `${discount.name} - ${(category as any).name}`,
              description: discount.description || `خصم على فئة ${(category as any).name}`,
              type: 'category',
              category: {
                _id: (category as any)._id,
                name: (category as any).name
              },
              sampleProducts: categoryProducts.map(p => ({
                _id: p._id,
                name: p.name,
                price: p.price,
                image: p.image
              })),
              discount: {
                _id: discount._id,
                code: discount.code,
                type: discount.discountType,
                value: discount.discountValue,
                startDate: discount.startDate,
                endDate: discount.endDate
              }
            });
          }
        }
      }

      // عروض عامة (بدون منتجات أو فئات محددة)
      if ((!discount.applicableProducts || discount.applicableProducts.length === 0) &&
          (!discount.applicableCategories || discount.applicableCategories.length === 0)) {
        offers.push({
          _id: `${discount._id}_general`,
          title: discount.name,
          description: discount.description || 'خصم عام على جميع المنتجات',
          type: 'general',
          discount: {
            _id: discount._id,
            code: discount.code,
            type: discount.discountType,
            value: discount.discountValue,
            minAmount: discount.minAmount,
            maxDiscount: discount.maxDiscount,
            startDate: discount.startDate,
            endDate: discount.endDate
          }
        });
      }
    }

    console.log(`✅ تم إنشاء ${offers.length} عرض من الخصومات`);
    
    return res.json({
      success: true,
      offers: offers.sort((a, b) => {
        // ترتيب العروض حسب نسبة الخصم أو قيمة الخصم
        if (a.discountPercentage && b.discountPercentage) {
          return b.discountPercentage - a.discountPercentage;
        }
        return 0;
      })
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return res.status(500).json({ 
      success: false,
      message: 'حدث خطأ أثناء جلب العروض' 
    });
  }
};

// جلب عروض منتج معين
export const getProductOffers = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    // التحقق من وجود المنتج
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    // البحث عن الخصومات المطبقة على هذا المنتج أو فئته
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      $or: [
        { applicableProducts: productId },
        { applicableCategories: product.category },
        { 
          applicableProducts: { $exists: true, $size: 0 },
          applicableCategories: { $exists: true, $size: 0 }
        }
      ]
    });

    const offers = discounts.map(discount => {
      let discountPrice = product.price;
      
      if (discount.discountType === 'percentage') {
        discountPrice = product.price * (1 - discount.discountValue / 100);
        if (discount.maxDiscount) {
          discountPrice = Math.max(discountPrice, product.price - discount.maxDiscount);
        }
      } else {
        discountPrice = Math.max(0, product.price - discount.discountValue);
      }

      return {
        _id: `${discount._id}_${productId}`,
        title: discount.name,
        description: discount.description,
        originalPrice: product.price,
        discountPrice: Math.round(discountPrice * 100) / 100,
        discountPercentage: Math.round((1 - discountPrice / product.price) * 100),
        savings: Math.round((product.price - discountPrice) * 100) / 100,
        discount: {
          _id: discount._id,
          code: discount.code,
          type: discount.discountType,
          value: discount.discountValue,
          startDate: discount.startDate,
          endDate: discount.endDate
        }
      };
    });

    return res.json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image
      },
      offers: offers.sort((a, b) => b.discountPercentage - a.discountPercentage)
    });
  } catch (error) {
    console.error('Error fetching product offers:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب عروض المنتج' });
  }
};

// جلب عروض فئة معينة
export const getCategoryOffers = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    // البحث عن الخصومات المطبقة على هذه الفئة
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      $or: [
        { applicableCategories: categoryId },
        { 
          applicableProducts: { $exists: true, $size: 0 },
          applicableCategories: { $exists: true, $size: 0 }
        }
      ]
    });

    // جلب منتجات هذه الفئة
    const categoryProducts = await Product.find({ category: categoryId });

    const offers = [];
    
    for (const discount of discounts) {
      for (const product of categoryProducts) {
        let discountPrice = product.price;
        
        if (discount.discountType === 'percentage') {
          discountPrice = product.price * (1 - discount.discountValue / 100);
          if (discount.maxDiscount) {
            discountPrice = Math.max(discountPrice, product.price - discount.maxDiscount);
          }
        } else {
          discountPrice = Math.max(0, product.price - discount.discountValue);
        }

        offers.push({
          _id: `${discount._id}_${product._id}`,
          title: `${discount.name} - ${product.name}`,
          description: discount.description,
          originalPrice: product.price,
          discountPrice: Math.round(discountPrice * 100) / 100,
          discountPercentage: Math.round((1 - discountPrice / product.price) * 100),
          product: {
            _id: product._id,
            name: product.name,
            image: product.image
          },
          discount: {
            _id: discount._id,
            code: discount.code,
            type: discount.discountType,
            value: discount.discountValue
          }
        });
      }
    }

    return res.json({
      success: true,
      categoryId,
      offers: offers.sort((a, b) => b.discountPercentage - a.discountPercentage)
    });
  } catch (error) {
    console.error('Error fetching category offers:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب عروض الفئة' });
  }
};

// حساب السعر مع الخصم لمنتج معين
export const calculateDiscountedPrice = async (req: Request, res: Response) => {
  try {
    const { productId, discountCode } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'معرف المنتج مطلوب' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    let finalPrice = product.price;
    let appliedDiscount = null;

    if (discountCode) {
      // البحث عن الخصم بالكود
      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        $or: [
          { applicableProducts: productId },
          { applicableCategories: product.category },
          { 
            applicableProducts: { $exists: true, $size: 0 },
            applicableCategories: { $exists: true, $size: 0 }
          }
        ]
      });

      if (discount) {
        if (discount.discountType === 'percentage') {
          finalPrice = product.price * (1 - discount.discountValue / 100);
          if (discount.maxDiscount) {
            finalPrice = Math.max(finalPrice, product.price - discount.maxDiscount);
          }
        } else {
          finalPrice = Math.max(0, product.price - discount.discountValue);
        }

        appliedDiscount = {
          _id: discount._id,
          name: discount.name,
          code: discount.code,
          type: discount.discountType,
          value: discount.discountValue,
          savings: Math.round((product.price - finalPrice) * 100) / 100
        };
      }
    }

    return res.json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        originalPrice: product.price,
        finalPrice: Math.round(finalPrice * 100) / 100
      },
      appliedDiscount
    });
  } catch (error) {
    console.error('Error calculating discounted price:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء حساب السعر مع الخصم' });
  }
};
