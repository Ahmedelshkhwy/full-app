import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'CART_ITEMS';

export interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export const cartStorage = {
    async getCart(): Promise<CartItem[]> {
        const json = await AsyncStorage.getItem(CART_KEY);
        return json ? JSON.parse(json) : [];
    },

    async addItem(item: CartItem): Promise<void> {
        const cart = await cartStorage.getCart();
        const index = cart.findIndex(i => i.id === item.id);
        if (index > -1) {
            cart[index].quantity += item.quantity;
        } else {
            cart.push(item);
        }
        await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
    },

    async removeItem(itemId: string): Promise<void> {
        const cart = await cartStorage.getCart();
        const updatedCart = cart.filter(item => item.id !== itemId);
        await AsyncStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    },

    async clearCart(): Promise<void> {
        await AsyncStorage.removeItem(CART_KEY);
    }
};