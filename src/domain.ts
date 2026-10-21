import type { CartItem, Coupon, Customer, Product } from "./types.ts";
export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value / 100,
  );
export function cartSubtotal(cart: CartItem[], products: Product[]) {
  return cart.reduce(
    (sum, item) =>
      sum +
      (products.find((p) => p.id === item.productId)?.price ?? 0) *
        item.quantity,
    0,
  );
}
export function discountAmount(subtotal: number, coupon?: Coupon) {
  return coupon?.active
    ? Math.round((subtotal * Math.min(100, Math.max(0, coupon.percent))) / 100)
    : 0;
}
export function shippingOptions(
  cep: string,
  subtotal: number,
  threshold: number,
) {
  if (!/^\d{8}$/.test(cep.replace(/\D/g, ""))) return [];
  return [
    {
      id: "standard",
      name: "Entrega padrão",
      days: "5 a 8 dias úteis",
      price: subtotal >= threshold ? 0 : 1990,
    },
    {
      id: "express",
      name: "Entrega expressa",
      days: "2 a 3 dias úteis",
      price: 3490,
    },
  ];
}
export function cartError(cart: CartItem[], products: Product[]) {
  if (!cart.length) return "Seu carrinho está vazio.";
  for (const item of cart) {
    const p = products.find((p) => p.id === item.productId);
    if (!p) return "Um produto não está mais disponível.";
    if (!Number.isInteger(item.quantity) || item.quantity < 1)
      return "Quantidade inválida.";
    if (!p.variants.includes(item.variant))
      return `Escolha uma opção válida para ${p.name}.`;
    const total = cart
      .filter((i) => i.productId === p.id)
      .reduce((s, i) => s + i.quantity, 0);
    if (total > p.stock) return `Estoque insuficiente para ${p.name}.`;
  }
  return null;
}
export function resolveCheckoutCustomer(
  customers: Customer[],
  currentCustomer: Customer | null,
  email: string,
) {
  const matching = customers.find(
    (c) => c.email.trim().toLowerCase() === email.trim().toLowerCase(),
  );
  return {
    customer: currentCustomer ?? matching ?? null,
    conflict: !!(
      currentCustomer && matching && matching.id !== currentCustomer.id
    ),
  };
}
const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
export function validateAddress(a: {
  cep: string;
  street: string;
  number: string;
  city: string;
  state: string;
  recipient: string;
  district: string;
}) {
  return (
    /^\d{8}$/.test(a.cep.replace(/\D/g, "")) &&
    a.street.trim().length > 2 &&
    !!a.number.trim() &&
    a.city.trim().length > 1 &&
    brazilianStates.includes(a.state) &&
    a.recipient.trim().length > 2 &&
    a.district.trim().length > 1
  );
}
