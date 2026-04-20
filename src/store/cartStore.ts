'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartQuoteItem } from '@/types';
import toast from 'react-hot-toast';

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (id: string) => boolean;
  syncItemsFromQuote: (items: CartQuoteItem[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const existing = items.find((i) => i.id === item.id);

        if (existing) {
          if (existing.quantity >= item.stock) {
            toast.error('Stok miktarını aştınız!');
            return;
          }
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
          toast.success('Ürün miktarı güncellendi');
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
          toast.success('Ürün sepete eklendi');
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
        toast.success('Ürün sepetten çıkarıldı');
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const item = get().items.find((i) => i.id === id);
        if (item && quantity > item.stock) {
          toast.error('Stok miktarını aştınız!');
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => {
          const price = item.discountPrice ?? item.price;
          return sum + price * item.quantity;
        }, 0),

      isInCart: (id) => get().items.some((i) => i.id === id),

      syncItemsFromQuote: (quoteItems) => {
        const currentItems = get().items;
        const quoteMap = new Map(quoteItems.map((item) => [item.id, item]));

        const syncedItems = currentItems.reduce<CartItem[]>((acc, item) => {
            const quotedItem = quoteMap.get(item.id);
            if (!quotedItem) return acc;

            acc.push({
              ...item,
              name: quotedItem.name,
              slug: quotedItem.slug,
              image: quotedItem.image,
              stock: quotedItem.stock,
              quantity: quotedItem.quantity,
              price: quotedItem.price,
              discountPrice: quotedItem.discountPrice ?? null,
            });

            return acc;
          }, []);

        const hasChanged =
          syncedItems.length !== currentItems.length ||
          syncedItems.some((item, index) => {
            const current = currentItems[index];
            if (!current) return true;

            return (
              current.id !== item.id ||
              current.name !== item.name ||
              current.slug !== item.slug ||
              current.image !== item.image ||
              current.stock !== item.stock ||
              current.quantity !== item.quantity ||
              current.price !== item.price ||
              (current.discountPrice ?? null) !== (item.discountPrice ?? null)
            );
          });

        if (!hasChanged) {
          return;
        }

        set({ items: syncedItems });
      },
    }),
    {
      name: 'petshop-cart',
    }
  )
);
