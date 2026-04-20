export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDesc?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  viewCount?: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  brand?: string | null;
  weight?: string | null;
  sku?: string | null;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingToken?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string | null;
  paymentMethod?: string | null;
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
  couponCode?: string | null;
  shippingAddress: ShippingAddress;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId?: string | null;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface ShippingAddress {
  name: string;
  surname: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  zipCode?: string;
}

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  quantity: number;
  stock: number;
}

export interface CartQuoteItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  quantity: number;
  stock: number;
  price: number;
  discountPrice?: number | null;
  lineTotal: number;
}

export interface CartQuote {
  items: CartQuoteItem[];
  subtotal: number;
  shippingCost: number;
  freeShippingMin: number | null;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription?: string | null;
  logo?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactAddress?: string | null;
  announcementText?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  whatsapp?: string | null;
  freeShippingMin?: number | null;
  shippingCost: number;
  heroBadge?: string | null;
  heroTitle?: string | null;
  heroDescription?: string | null;
  heroPrimaryText?: string | null;
  heroPrimaryLink?: string | null;
  heroSecondaryText?: string | null;
  heroSecondaryLink?: string | null;
  categoriesTitle?: string | null;
  categoriesDescription?: string | null;
  featuredTitle?: string | null;
  featuredDescription?: string | null;
  bestsellerTitle?: string | null;
  bestsellerDescription?: string | null;
  faqTitle?: string | null;
  faqDescription?: string | null;
  faqItems?: Array<{ q: string; a: string }> | null;
  contactTitle?: string | null;
  contactDescription?: string | null;
  contactPhoneSecondary?: string | null;
  contactEmailSecondary?: string | null;
  contactAddressSecondary?: string | null;
  contactHoursWeekday?: string | null;
  contactHoursWeekend?: string | null;
  contactMapEmbedUrl?: string | null;
  footerDescription?: string | null;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Bekliyor',
  PREPARING: 'Hazırlanıyor',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Bekliyor',
  SUCCESS: 'Başarılı',
  FAILED: 'Başarısız',
  REFUNDED: 'İade Edildi',
};
