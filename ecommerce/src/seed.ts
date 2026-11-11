import { storeConfig } from "./config";
import type { StoreData, Product, Order } from "./types";
const product = (
  id: string,
  name: string,
  category: string,
  price: number,
  oldPrice: number,
  image: string,
  description: string,
  stock: number,
  variants: string[],
  badge?: string,
): Product => ({
  id,
  name,
  category,
  price,
  oldPrice,
  image: `/images/${image}.jpg`,
  description,
  stock,
  variants,
  featured: true,
  badge,
  rating: 4.8,
  specs: {
    Garantia: "12 meses (demonstração)",
    Conexão:
      category === "audio" ? "Bluetooth 5.3" : "Veja as opções do produto",
    Conteúdo: "Produto, acessórios e manual",
    Catálogo:
      "Exemplo para apresentação — consulte a loja sobre produtos reais",
  },
});
export const seed: StoreData = {
  version: 1,
  settings: {
    name: storeConfig.name,
    tagline: storeConfig.tagline,
    email: storeConfig.email,
    phone: storeConfig.phone,
    primaryColor: storeConfig.primaryColor,
    freeShippingThreshold: storeConfig.freeShippingThreshold,
    announcement: storeConfig.announcement,
  },
  categories: [
    { id: "notebooks", name: "Notebooks" },
    { id: "setup", name: "Periféricos" },
    { id: "audio", name: "Áudio" },
    { id: "acessorios", name: "Acessórios" },
  ],
  coupons: [{ code: "BEMVINDO10", percent: 10, active: true }],
  customers: [
    {
      id: "demo",
      name: "Alex Silva",
      email: "alex@exemplo.com",
      phone: "(11) 99999-0000",
      addresses: [
        {
          id: "home",
          label: "Casa",
          recipient: "Alex Silva",
          cep: "01310100",
          street: "Avenida Exemplo",
          number: "120",
          complement: "Apto 42",
          district: "Bela Vista",
          city: "São Paulo",
          state: "SP",
        },
      ],
    },
  ],
  orders: [],
  products: [
    product(
      "notebook-dia-a-dia",
      "Notebook para o dia a dia",
      "notebooks",
      289990,
      319990,
      "notebook",
      "Exemplo de notebook para estudo e trabalho. Imagem, especificações, preço e disponibilidade são ilustrativos; consulte a Latina sobre as opções reais.",
      6,
      ["Grafite"],
      "Demonstração",
    ),
    product(
      "air-one",
      "Headphone Bluetooth",
      "audio",
      39990,
      49990,
      "headphones",
      "Seu espaço, seu som. Áudio envolvente, design leve e até 40 horas de bateria para acompanhar o seu ritmo.",
      24,
      ["Preto", "Areia"],
      "Mais vendido",
    ),
    product(
      "buds-mini",
      "Fone sem fio com estojo",
      "audio",
      18990,
      24990,
      "earbuds",
      "Música em todos os momentos. Fones compactos com estojo de recarga e encaixe confortável.",
      32,
      ["Branco", "Preto"],
      "-24%",
    ),
    product(
      "keys-pro",
      "Teclado mecânico compacto",
      "setup",
      32990,
      39990,
      "keyboard",
      "Um novo ritmo para suas ideias. Teclado mecânico compacto com conexão sem fio e toque preciso.",
      18,
      ["Grafite", "Branco"],
      "Para o seu setup",
    ),
    product(
      "mouse-flow",
      "Mouse sem fio ergonômico",
      "setup",
      14990,
      19990,
      "mouse",
      "Precisão sem esforço. Mouse sem fio silencioso com formato ergonômico para todos os dias.",
      40,
      ["Preto", "Branco"],
    ),
    product(
      "watch-move",
      "Relógio inteligente",
      "acessorios",
      44990,
      54990,
      "smartwatch",
      "Mais conexão com o seu dia. Acompanhe atividades, notificações e sua rotina em uma tela vibrante.",
      14,
      ["Preto", "Prata"],
      "Novidade",
    ),
    product(
      "sound-go",
      "Caixa de som portátil",
      "audio",
      25990,
      32990,
      "speaker",
      "Som que vai junto. Caixa portátil com graves marcantes e resistência a respingos.",
      20,
      ["Preto", "Cinza"],
    ),
    product(
      "charge-duo",
      "Carregador de duas portas",
      "acessorios",
      11990,
      15990,
      "charger",
      "Energia para continuar. Carregador compacto com duas portas para organizar sua rotina.",
      50,
      ["Branco"],
    ),
    product(
      "cam-focus",
      "Webcam para videochamadas",
      "setup",
      21990,
      27990,
      "webcam",
      "Mais presença em cada conversa. Imagem nítida e microfone integrado para reuniões e criação.",
      12,
      ["Preto"],
    ),
    product(
      "pack-daily",
      "Mochila para notebook",
      "acessorios",
      22990,
      28990,
      "backpack",
      "Leve o essencial. Compartimentos inteligentes e espaço protegido para o seu notebook.",
      16,
      ["Preto", "Areia"],
    ),
    product(
      "view-27",
      "Monitor de 27 polegadas",
      "setup",
      129990,
      149990,
      "monitor",
      "Amplie suas possibilidades. Tela de 27 polegadas para trabalhar, criar e se divertir.",
      8,
      ["Preto"],
      "Frete grátis",
    ),
  ],
};

// Fictional records make the account and administration navigable on first visit.
seed.customers.push({
  id: "demo-marina",
  name: "Marina Costa",
  email: "marina@exemplo.com",
  phone: "(51) 99999-0001",
  addresses: [
    {
      ...seed.customers[0].addresses[0],
      id: "marina-casa",
      recipient: "Marina Costa",
    },
  ],
});
function exampleOrder(
  id: string,
  customerId: string,
  lines: [string, number][],
  status: Order["status"],
  payment: Order["payment"],
  createdAt: string,
  coupon?: string,
): Order {
  const customer = seed.customers.find((c) => c.id === customerId)!;
  const items = lines.map(([productId, quantity]) => {
    const p = seed.products.find((p) => p.id === productId)!;
    return {
      productId,
      name: p.name,
      image: p.image,
      variant: p.variants[0],
      quantity,
      price: p.price,
    };
  });
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = coupon ? Math.round(subtotal / 10) : 0;
  const shipping = subtotal >= seed.settings.freeShippingThreshold ? 0 : 1990;
  return {
    id,
    customerId,
    customerName: customer.name,
    email: customer.email,
    createdAt,
    items,
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
    payment,
    status,
    address: { ...customer.addresses[0] },
    delivery: "Entrega padrão · 5 a 8 dias úteis",
    ...(coupon ? { coupon } : {}),
  };
}
seed.orders = [
  exampleOrder(
    "EX-1001",
    "demo",
    [
      ["keys-pro", 1],
      ["mouse-flow", 1],
    ],
    "Em preparação",
    "Cartão",
    "2026-10-20T15:20:00-03:00",
  ),
  exampleOrder(
    "EX-1002",
    "demo",
    [["air-one", 1]],
    "Pagamento pendente",
    "Pix",
    "2026-10-21T10:45:00-03:00",
  ),
  exampleOrder(
    "EX-1003",
    "demo-marina",
    [
      ["buds-mini", 1],
      ["sound-go", 1],
    ],
    "Entregue",
    "Cartão",
    "2026-10-15T14:10:00-03:00",
    "BEMVINDO10",
  ),
];
seed.products = seed.products.map((p) => ({
  ...p,
  stock:
    p.stock -
    seed.orders
      .flatMap((o) => o.items)
      .filter((i) => i.productId === p.id)
      .reduce((sum, i) => sum + i.quantity, 0),
}));
