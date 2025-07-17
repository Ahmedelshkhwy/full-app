import { Request, Response } from 'express';
import Product from '../models/product.model';

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتجات' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء المنتج' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params['productId']);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتج' });
  }
};