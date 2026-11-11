export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  description: string;
  stock: number;
  variants: string[];
  featured: boolean;
  badge?: string;
  rating: number;
  specs: Record<string, string>;
};
export type Category = { id: string; name: string };
export type Coupon = { code: string; percent: number; active: boolean };
export type CartItem = { productId: string; variant: string; quantity: number };
export type Address = {
  id: string;
  label: string;
  recipient: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
};
export type OrderStatus =
  | "Pagamento pendente"
  | "Confirmado"
  | "Em preparação"
  | "Enviado"
  | "Entregue"
  | "Cancelado";
export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  createdAt: string;
  items: {
    productId: string;
    name: string;
    image: string;
    variant: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  payment: "Pix" | "Cartão" | "Boleto";
  status: OrderStatus;
  address: Address;
  delivery: string;
  coupon?: string;
};
export type Settings = {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  primaryColor: string;
  freeShippingThreshold: number;
  announcement: string;
};
export type StoreData = {
  version: 1;
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  customers: Customer[];
  orders: Order[];
  settings: Settings;
};
export type CommerceContext = {
  data: StoreData;
  setData: React.Dispatch<React.SetStateAction<StoreData>>;
  couponCode: string;
  setCouponCode: React.Dispatch<React.SetStateAction<string>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  addToCart: (id: string, variant?: string, quantity?: number) => void;
  customer: Customer | null;
  setCustomerId: (id: string | null) => void;
  notify: (message: string) => void;
};
