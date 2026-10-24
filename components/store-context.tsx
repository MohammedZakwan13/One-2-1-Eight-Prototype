'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Category, HeroSlide, INITIAL_CATEGORIES, INITIAL_HERO, INITIAL_ORDERS, INITIAL_PRODUCTS,
  INITIAL_REVIEWS, INITIAL_SETTINGS, Product, StoreSettings,
} from '@/lib/data';

export type CartItem = { productId: string; size: string; quantity: number };
export type Lead = { id: string; name: string; email: string; phone: string; type: string; quantity: string; message: string; createdAt: string; status: string };
export type Order = { id: string; customer: string; date: string; amount: number; status: string; items: number };
export type Review = { id: string; product: string; customer: string; rating: number; title?: string; text: string; date: string; status: string };

type StoreContextType = {
  hydrated: boolean;
  products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  heroSlides: HeroSlide[]; setHeroSlides: React.Dispatch<React.SetStateAction<HeroSlide[]>>;
  categories: Category[]; setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  settings: StoreSettings; setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  wishlist: string[]; setWishlist: React.Dispatch<React.SetStateAction<string[]>>;
  leads: Lead[]; setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  reviews: Review[]; setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  adminAuthed: boolean; setAdminAuthed: React.Dispatch<React.SetStateAction<boolean>>;
  addToCart: (productId: string, size: string, quantity?: number) => void;
  toggleWishlist: (productId: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  cartCount: number;
  cartSubtotal: number;
};

const StoreContext = createContext<StoreContextType | null>(null);
const STORAGE_KEY = 'one218-prototype-v3';

type PersistedStore = {
  products: Product[]; heroSlides: HeroSlide[]; categories: Category[]; settings: StoreSettings;
  cart: CartItem[]; wishlist: string[]; leads: Lead[]; orders: Order[]; reviews: Review[]; adminAuthed: boolean;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(INITIAL_HERO);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS as Order[]);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS as Review[]);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedStore>;
        if (parsed.products?.length) setProducts(parsed.products);
        if (parsed.heroSlides?.length) setHeroSlides(parsed.heroSlides);
        if (parsed.categories?.length) setCategories(parsed.categories);
        if (parsed.settings) setSettings({ ...INITIAL_SETTINGS, ...parsed.settings });
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.wishlist) setWishlist(parsed.wishlist);
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.reviews) setReviews(parsed.reviews);
        setAdminAuthed(Boolean(parsed.adminAuthed));
      }
    } catch (error) {
      console.warn('Prototype state could not be restored.', error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedStore = { products, heroSlides, categories, settings, cart, wishlist, leads, orders, reviews, adminAuthed };
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { console.warn('Prototype state could not be saved.', error); }
  }, [hydrated, products, heroSlides, categories, settings, cart, wishlist, leads, orders, reviews, adminAuthed]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as Partial<PersistedStore>;
        if (parsed.products) setProducts(parsed.products);
        if (parsed.heroSlides) setHeroSlides(parsed.heroSlides);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.settings) setSettings({ ...INITIAL_SETTINGS, ...parsed.settings });
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.wishlist) setWishlist(parsed.wishlist);
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.reviews) setReviews(parsed.reviews);
        setAdminAuthed(Boolean(parsed.adminAuthed));
      } catch { /* Ignore corrupt cross-tab updates. */ }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const addToCart = useCallback((productId: string, size: string, quantity = 1) => {
    setCart(current => {
      const found = current.find(item => item.productId === productId && item.size === size);
      return found
        ? current.map(item => item.productId === productId && item.size === size ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current, { productId, size, quantity }];
    });
  }, []);
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(current => current.includes(productId) ? current.filter(id => id !== productId) : [...current, productId]);
  }, []);
  const removeFromCart = useCallback((productId: string, size: string) => {
    setCart(current => current.filter(item => !(item.productId === productId && item.size === size)));
  }, []);
  const updateCartQuantity = useCallback((productId: string, size: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId, size); return; }
    setCart(current => current.map(item => item.productId === productId && item.size === size ? { ...item, quantity } : item));
  }, [removeFromCart]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0), [cart, products]);

  const value = useMemo<StoreContextType>(() => ({
    hydrated, products, setProducts, heroSlides, setHeroSlides, categories, setCategories,
    settings, setSettings, cart, setCart, wishlist, setWishlist, leads, setLeads, orders, setOrders,
    reviews, setReviews, adminAuthed, setAdminAuthed, addToCart, toggleWishlist, removeFromCart,
    updateCartQuantity, cartCount, cartSubtotal,
  }), [hydrated, products, heroSlides, categories, settings, cart, wishlist, leads, orders, reviews, adminAuthed,
    addToCart, toggleWishlist, removeFromCart, updateCartQuantity, cartCount, cartSubtotal]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
