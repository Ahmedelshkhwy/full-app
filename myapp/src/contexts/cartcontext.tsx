import React, { createContext, ReactNode, useContext, useReducer } from 'react';
import { addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, getCart, updateCartItemQuantity as apiUpdateQuantity } from '../api/api';
import { useAuth } from './AuthContext';

type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    stock?: number;
};

type CartState = {
    items: CartItem[];
    loading: boolean;
};

type CartAction =
    | { type: 'ADD_ITEM'; item: CartItem }
    | { type: 'REMOVE_ITEM'; id: string }
    | { type: 'CLEAR_CART' }
    | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
    | { type: 'SET_CART'; items: CartItem[] }
    | { type: 'SET_LOADING'; loading: boolean };

const initialState: CartState = {
    items: [],
    loading: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existing = state.items.find(i => i.id === action.item.id);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map(i =>
                        i.id === action.item.id
                            ? { ...i, quantity: i.quantity + action.item.quantity }
                            : i
                    ),
                };
            }
            return { ...state, items: [...state.items, action.item] };
        }
        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter(i => i.id !== action.id) };
        case 'CLEAR_CART':
            return { ...state, items: [] };
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(i =>
                    i.id === action.id ? { ...i, quantity: action.quantity } : i
                ),
            };
        case 'SET_CART':
            return { ...state, items: action.items };
        case 'SET_LOADING':
            return { ...state, loading: action.loading };
        default:
            return state;
    }
}

type CartContextType = {
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
    addToCartAndSync: (item: CartItem) => Promise<boolean>;
    removeFromCartAndSync: (id: string) => Promise<void>;
    updateQuantityAndSync: (id: string, quantity: number) => Promise<boolean>;
    fetchCartFromBackend: () => Promise<void>;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { token } = useAuth();

    // إضافة للسلة - التحقق من الباك اند أولاً
    const addToCartAndSync = async (item: CartItem): Promise<boolean> => {
        if (!token) {
            // إذا لم يكن هناك token، أضف محلياً فقط
            dispatch({ type: 'ADD_ITEM', item });
            return true;
        }

        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            
            // إرسال الطلب للباك اند أولاً
            const response = await apiAddToCart({ productId: item.id, quantity: item.quantity }, token);
            
            // إذا نجح الباك اند، تحديث السلة المحلية بالبيانات المحدثة من الباك اند
            if (response && response.items) {
                const updatedItems = response.items.map((i: any) => ({
                    id: typeof i.productId === 'string' ? i.productId : i.productId._id,
                    name: i.productId.name || '',
                    price: i.productId.price || 0,
                    quantity: i.quantity,
                    stock: i.productId.stock || 0,
                }));
                dispatch({ type: 'SET_CART', items: updatedItems });
            }
            
            return true;
        } catch (error: any) {
            console.error('Error adding item to backend:', error);
            
            // إذا كان الخطأ يتعلق بالمخزون، لا نضيف للسلة المحلية
            if (error.response?.status === 400) {
                throw new Error(error.response?.data?.message || 'خطأ في إضافة المنتج');
            }
            
            // لأخطاء أخرى، أضف محلياً
            dispatch({ type: 'ADD_ITEM', item });
            return true;
        } finally {
            dispatch({ type: 'SET_LOADING', loading: false });
        }
    };

    // حذف من السلة
    const removeFromCartAndSync = async (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', id });
        if (token) {
            try {
                await apiRemoveFromCart(id, token);
                // إعادة جلب السلة المحدثة من الباك اند
                await fetchCartFromBackend();
            } catch (error) {
                console.error('Error removing item from backend:', error);
            }
        }
    };

    // تحديث الكمية - التحقق من الباك اند أولاً
    const updateQuantityAndSync = async (id: string, quantity: number): Promise<boolean> => {
        if (!token) {
            dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
            return true;
        }

        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            
            // إرسال الطلب للباك اند أولاً
            const response = await apiUpdateQuantity(id, { quantity }, token);
            
            // إذا نجح الباك اند، تحديث السلة المحلية بالبيانات المحدثة
            if (response && response.items) {
                const updatedItems = response.items.map((i: any) => ({
                    id: typeof i.productId === 'string' ? i.productId : i.productId._id,
                    name: i.productId.name || '',
                    price: i.productId.price || 0,
                    quantity: i.quantity,
                    stock: i.productId.stock || 0,
                }));
                dispatch({ type: 'SET_CART', items: updatedItems });
            }
            
            return true;
        } catch (error: any) {
            console.error('Error updating quantity in backend:', error);
            
            // إذا كان الخطأ يتعلق بالمخزون، لا نحدث السلة المحلية
            if (error.response?.status === 400) {
                throw new Error(error.response?.data?.message || 'خطأ في تحديث الكمية');
            }
            
            // لأخطاء أخرى، حدث محلياً
            dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
            return true;
        } finally {
            dispatch({ type: 'SET_LOADING', loading: false });
        }
    };

    // جلب السلة من الباك اند وتحديث الحالة
    const fetchCartFromBackend = async () => {
        if (token) {
            try {
                dispatch({ type: 'SET_LOADING', loading: true });
                const data = await getCart(token);
                console.log('Cart data from backend:', data);
                
                if (data && data.items && Array.isArray(data.items)) {
                    const items = data.items.map((i: any) => ({
                        id: typeof i.productId === 'string' ? i.productId : i.productId._id,
                        name: i.productId.name || '',
                        price: i.productId.price || 0,
                        quantity: i.quantity,
                        stock: i.productId.stock || 0,
                    }));
                    dispatch({ type: 'SET_CART', items });
                } else {
                    console.log('No items in cart or invalid data structure');
                    dispatch({ type: 'SET_CART', items: [] });
                }
            } catch (error) {
                console.error('Error fetching cart:', error);
                dispatch({ type: 'SET_CART', items: [] });
            } finally {
                dispatch({ type: 'SET_LOADING', loading: false });
            }
        }
    };

    // مسح السلة
    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    return (
        <CartContext.Provider value={{ 
            state, 
            dispatch, 
            addToCartAndSync, 
            removeFromCartAndSync, 
            updateQuantityAndSync,
            fetchCartFromBackend,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};