import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Box,
  Check,
  ChevronRight,
  CircleHelp,
  Edit3,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useStore } from "./context";
import { money } from "./domain";
import type {
  Category,
  Coupon,
  Order,
  OrderStatus,
  Product,
  Settings,
} from "./types";
import "./admin.css";

const navigation = [
  { id: "", label: "Visão geral", icon: LayoutDashboard },
  { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
  { id: "produtos", label: "Produtos", icon: Package },
  { id: "categorias", label: "Categorias", icon: FolderTree },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "cupons", label: "Cupons", icon: Tag },
  { id: "configuracoes", label: "Configurações", icon: Settings2 },
];
const statuses: OrderStatus[] = [
  "Pagamento pendente",
  "Confirmado",
  "Em preparação",
  "Enviado",
  "Entregue",
];
const id = () => crypto.randomUUID();
const date = (value: string) =>
  new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const shortOrder = (value: string) =>
  value.length > 15 ? `${value.slice(0, 12)}…` : value;
const cents = (value: string) =>
  Math.round(Number(value.replace(",", ".")) * 100);
const amount = (value: number) => (value / 100).toFixed(2);
const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
function safeImage(value: string) {
  if (/^\/(?!\/)/.test(value) && !value.includes("\\")) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname))
    );
  } catch {
    return false;
  }
}
function Status({ value }: { value: OrderStatus }) {
  return (
    <span
      className={`admin-status admin-status-${value === "Cancelado" ? "cancelled" : value === "Entregue" ? "delivered" : value === "Pagamento pendente" ? "pending" : "active"}`}
    >
      <span />
      {value}
    </span>
  );
}
function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="admin-empty">
      <Box size={34} strokeWidth={1.3} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
function PanelTitle({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="admin-panel-title">
      <div>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}
function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const heading = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <div className="admin-dialog-backdrop" onClick={onClose}>
      <section
        ref={ref}
        className="admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={heading}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
          if (event.key === "Tab") {
            const focusable = [
              ...(ref.current?.querySelectorAll<HTMLElement>(
                'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
              ) ?? []),
            ];
            const first = focusable[0];
            const last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="admin-dialog-heading">
          <h2 id={heading}>{title}</h2>
          <button
            className="admin-icon-button"
            aria-label="Fechar detalhes"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function Admin({ path }: { path: string }) {
  const { data } = useStore();
  const [menu, setMenu] = useState(false);
  const section = path
    .split("?")[0]
    .replace(/^\/?admin\/?/, "")
    .split("/")[0];
  const current = navigation.find((item) => item.id === section);
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menu ? "admin-sidebar-open" : ""}`}>
        <a
          href="#/admin"
          className="admin-brand"
          onClick={() => setMenu(false)}
        >
          <img
            className="admin-brand-logo"
            src="/images/latina-logo.png"
            alt={data.settings.name}
          />
          <span className="admin-brand-caption">PAINEL DA LOJA</span>
        </a>
        <div className="admin-sidebar-label">ESPAÇO DA LOJA</div>
        <nav aria-label="Administração">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#/admin${item.id ? `/${item.id}` : ""}`}
              className={section === item.id ? "admin-nav-active" : ""}
              aria-current={section === item.id ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
              {section === item.id && <ChevronRight size={15} />}
            </a>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-demo-dot" />
          <strong>Ambiente de demonstração</strong>
          <p>
            Dados salvos neste navegador. Acesso ao painel livre, sem
            autenticação.
          </p>
          <a href="#/" onClick={() => setMenu(false)}>
            Ver minha loja <ExternalLink size={15} />
          </a>
        </div>
      </aside>
      {menu && (
        <button
          className="admin-sidebar-scrim"
          aria-label="Fechar menu"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <button
              className="admin-mobile-menu admin-icon-button"
              aria-label={
                menu
                  ? "Fechar menu de administração"
                  : "Abrir menu de administração"
              }
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span>Painel da loja</span>
            <ChevronRight size={13} />
            <strong>{current?.label ?? "Página não encontrada"}</strong>
          </div>
          <a href="#/" className="admin-store-link">
            Visitar loja <ArrowUpRight size={16} />
          </a>
          <span className="admin-avatar" aria-label="Perfil de demonstração">
            D
          </span>
        </header>
        <main id="main-content" tabIndex={-1} className="admin-main">
          <div className="admin-page-heading">
            <div>
              <p className="eyebrow">SEU NEGÓCIO, EM UM SÓ LUGAR</p>
              <h1>
                {section === ""
                  ? "Vamos fazer acontecer."
                  : (current?.label ?? "Página não encontrada")}
              </h1>
              <p>
                {section === ""
                  ? "Acompanhe sua loja e cuide de cada detalhe da experiência."
                  : "Gerencie sua loja com clareza e simplicidade."}
              </p>
            </div>
            <span className="admin-demo-badge">
              <span /> Demonstração local
            </span>
          </div>
          {section === "" ? (
            <Dashboard />
          ) : section === "produtos" ? (
            <Products />
          ) : section === "pedidos" ? (
            <Orders />
          ) : section === "clientes" ? (
            <Customers />
          ) : section === "categorias" ? (
            <Categories />
          ) : section === "cupons" ? (
            <Coupons />
          ) : section === "configuracoes" ? (
            <StoreSettings />
          ) : (
            <Empty
              title="Esta página não existe"
              text="Volte para a visão geral para continuar."
              action={
                <a className="btn btn-primary" href="#/admin">
                  Ir ao painel
                </a>
              }
            />
          )}
          <footer className="admin-footer">
            <span>{data.settings.name} · Store Manager</span>
            <span>
              <CircleHelp size={14} /> Compras, pagamentos e entregas simulados.
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data } = useStore();
  const confirmed = data.orders.filter(
    (order) => !["Cancelado", "Pagamento pendente"].includes(order.status),
  );
  const revenue = confirmed.reduce((sum, order) => sum + order.total, 0);
  const lowStock = data.products.filter((product) => product.stock <= 5);
  const topProducts = data.products
    .map((product) => ({
      product,
      quantity: confirmed.reduce(
        (sum, order) =>
          sum +
          order.items
            .filter((item) => item.productId === product.id)
            .reduce((sum, item) => sum + item.quantity, 0),
        0,
      ),
    }))
    .filter((item) => item.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);
  const latest = [...data.orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);
  const stats = [
    {
      label: "Vendas confirmadas",
      value: money(revenue),
      note: "Total dos pedidos confirmados",
      icon: BarChart3,
    },
    {
      label: "Pedidos recebidos",
      value: String(data.orders.length),
      note: `${data.orders.filter((order) => order.status === "Pagamento pendente").length} aguardando confirmação`,
      icon: ShoppingBag,
    },
    {
      label: "Ticket médio",
      value: confirmed.length
        ? money(Math.round(revenue / confirmed.length))
        : money(0),
      note: "Pedidos confirmados, incluindo frete",
      icon: ArrowUpRight,
    },
    {
      label: "Produtos no catálogo",
      value: String(data.products.length),
      note: `${data.products.filter((product) => product.stock > 0).length} disponíveis para compra`,
      icon: Package,
    },
  ];
  return (
    <>
      <div className="admin-stats">
        {stats.map((stat) => (
          <article className="admin-stat" key={stat.label}>
            <div>
              <span>{stat.label}</span>
              <stat.icon size={20} />
            </div>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
          </article>
        ))}
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-orders-panel">
          <PanelTitle
            title="Últimos pedidos"
            text="Do carrinho à entrega, tudo por aqui."
            action={
              <a href="#/admin/pedidos" className="text-link">
                Ver todos <ArrowRight size={15} />
              </a>
            }
          />
          {latest.length ? (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pedido / cliente</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {latest.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <a href="#/admin/pedidos" className="admin-table-link">
                          #{shortOrder(order.id)}
                        </a>
                        <small>{order.customerName}</small>
                      </td>
                      <td>
                        <Status value={order.status} />
                      </td>
                      <td className="admin-amount">{money(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="Seu próximo pedido começa aqui"
              text="Faça uma compra simulada na loja para acompanhar o pedido e ver as métricas ganharem vida."
              action={
                <a href="#/catalogo" className="btn btn-dark btn-small">
                  Explorar a loja <ArrowUpRight size={15} />
                </a>
              }
            />
          )}
        </section>
        <section className="admin-panel">
          <PanelTitle
            title="Acesso rápido"
            text="Pequenos cuidados, grandes experiências."
          />
          <div className="admin-quick-links">
            <a href="#/admin/produtos">
              <span>
                <Package size={20} />
              </span>
              <div>
                <strong>Seu catálogo</strong>
                <small>Produtos, preços e estoque</small>
              </div>
              <ArrowUpRight size={19} />
            </a>
            <a href="#/admin/cupons">
              <span>
                <Tag size={20} />
              </span>
              <div>
                <strong>Crie um incentivo</strong>
                <small>Gerencie os cupons da loja</small>
              </div>
              <ArrowUpRight size={19} />
            </a>
            <a href="#/admin/configuracoes">
              <span>
                <Settings2 size={20} />
              </span>
              <div>
                <strong>Do seu jeito</strong>
                <small>Identidade e informações</small>
              </div>
              <ArrowUpRight size={19} />
            </a>
          </div>
          <div className="admin-note">
            <span className="admin-note-icon">
              <Check size={17} />
            </span>
            <div>
              <strong>Uma base para a sua próxima loja.</strong>
              <p>
                Personalize a marca, monte o catálogo e percorra a jornada
                completa com dados fictícios.
              </p>
            </div>
          </div>
        </section>
        <section className="admin-panel">
          <PanelTitle
            title="Produtos mais pedidos"
            text="Unidades de pedidos confirmados."
          />
          {topProducts.length ? (
            <div className="admin-ranked-list">
              {topProducts.map(({ product, quantity }, index) => (
                <div key={product.id}>
                  <span className="admin-rank">0{index + 1}</span>
                  <img src={product.image} alt="" />
                  <span>
                    <strong>{product.name}</strong>
                    <small>
                      {
                        data.categories.find(
                          (category) => category.id === product.category,
                        )?.name
                      }
                    </small>
                  </span>
                  <b>{quantity} un.</b>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="Ainda sem ranking"
              text="Ele será calculado quando os pedidos forem confirmados no painel."
            />
          )}
        </section>
        <section className="admin-panel">
          <PanelTitle
            title="Atenção ao estoque"
            text="Produtos com 5 unidades ou menos."
          />
          {lowStock.length ? (
            <div className="admin-stock-list">
              {lowStock.map((product) => (
                <a href="#/admin/produtos" key={product.id}>
                  <img src={product.image} alt="" />
                  <span>
                    <strong>{product.name}</strong>
                    <small>
                      {product.stock === 0
                        ? "Indisponível na loja"
                        : "Estoque baixo"}
                    </small>
                  </span>
                  <b>{product.stock} un.</b>
                </a>
              ))}
            </div>
          ) : (
            <div className="admin-stock-ok">
              <span>
                <Check size={25} />
              </span>
              <h3>Estoque em dia</h3>
              <p>Nenhum produto abaixo do limite de atenção.</p>
              <a className="text-link" href="#/admin/produtos">
                Gerenciar produtos <ArrowRight size={15} />
              </a>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

type ProductDraft = {
  id: string;
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  image: string;
  description: string;
  stock: string;
  variants: string;
  featured: boolean;
  badge: string;
  specs: string;
};
function Products() {
  const { data, setData, notify } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [error, setError] = useState("");
  const products = data.products.filter(
    (product) =>
      `${product.name} ${product.id}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!category || product.category === category),
  );
  function edit(product?: Product) {
    setError("");
    setDraft(
      product
        ? {
            id: product.id,
            name: product.name,
            category: product.category,
            price: amount(product.price),
            oldPrice: product.oldPrice ? amount(product.oldPrice) : "",
            image: product.image,
            description: product.description,
            stock: String(product.stock),
            variants: product.variants.join(", "),
            featured: product.featured,
            badge: product.badge ?? "",
            specs: Object.entries(product.specs)
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n"),
          }
        : {
            id: "",
            name: "",
            category: data.categories[0]?.id ?? "",
            price: "",
            oldPrice: "",
            image: "/images/headphones.jpg",
            description: "",
            stock: "0",
            variants: "Padrão",
            featured: false,
            badge: "",
            specs: "",
          },
    );
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const price = cents(draft.price);
    const oldPrice = draft.oldPrice ? cents(draft.oldPrice) : undefined;
    const variants = [
      ...new Set(
        draft.variants
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ];
    if (
      !draft.name.trim() ||
      !data.categories.some((category) => category.id === draft.category) ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(Number(draft.stock)) ||
      Number(draft.stock) < 0 ||
      !variants.length ||
      !draft.description.trim() ||
      !safeImage(draft.image)
    ) {
      setError(
        "Confira os campos. Use preço positivo, estoque inteiro, ao menos uma opção e uma imagem em /images/ ou URL HTTPS.",
      );
      return;
    }
    if (
      oldPrice !== undefined &&
      (!Number.isFinite(oldPrice) || oldPrice <= price)
    ) {
      setError("O preço anterior deve ser maior que o preço de venda.");
      return;
    }
    const specs: Record<string, string> = {};
    for (const line of draft.specs.split("\n").filter((line) => line.trim())) {
      const separator = line.indexOf(":");
      if (separator < 1 || !line.slice(separator + 1).trim()) {
        setError(
          "Nas especificações, use uma linha por item no formato Nome: valor.",
        );
        return;
      }
      specs[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
    }
    setData((previous) => {
      const existing = previous.products.find(
        (product) => product.id === draft.id,
      );
      const product: Product = {
        id: draft.id || `${slug(draft.name)}-${id().slice(0, 6)}`,
        name: draft.name.trim(),
        category: draft.category,
        price,
        oldPrice,
        image: draft.image.trim(),
        description: draft.description.trim(),
        stock: Number(draft.stock),
        variants,
        featured: draft.featured,
        badge: draft.badge.trim() || undefined,
        rating: existing?.rating ?? 0,
        specs,
      };
      return {
        ...previous,
        products: existing
          ? previous.products.map((item) =>
              item.id === product.id ? product : item,
            )
          : [...previous.products, product],
      };
    });
    notify(draft.id ? "Produto atualizado." : "Produto criado no catálogo.");
    setDraft(null);
  }
  function unavailable(product: Product) {
    if (
      !confirm(
        `Tornar ${product.name} indisponível? O estoque será definido como zero e o histórico de pedidos será preservado.`,
      )
    )
      return;
    setData((previous) => ({
      ...previous,
      products: previous.products.map((item) =>
        item.id === product.id ? { ...item, stock: 0 } : item,
      ),
    }));
    notify("Produto marcado como indisponível.");
  }
  return (
    <>
      <section className="admin-panel">
        <PanelTitle
          title="Catálogo de produtos"
          text={`${data.products.length} produtos para fazer parte da rotina de alguém.`}
          action={
            <button
              className="btn btn-primary btn-small"
              onClick={() => edit()}
            >
              <Plus size={17} /> Novo produto
            </button>
          }
        />
        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar produto ou código"
              aria-label="Buscar produtos"
            />
          </label>
          <select
            aria-label="Filtrar por categoria"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Todas as categorias</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <span className="admin-result-count">
            {products.length} resultados
          </span>
        </div>
        {products.length ? (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={product.image} alt="" />
                        <div>
                          <strong>{product.name}</strong>
                          <small>{product.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {data.categories.find(
                        (category) => category.id === product.category,
                      )?.name ?? "Sem categoria"}
                    </td>
                    <td className="admin-amount">{money(product.price)}</td>
                    <td>
                      <span
                        className={product.stock <= 5 ? "admin-low-stock" : ""}
                      >
                        {product.stock} un.
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-status admin-status-${product.stock ? "delivered" : "cancelled"}`}
                      >
                        <span />
                        {product.stock ? "Disponível" : "Indisponível"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-icon-button"
                          title={`Editar ${product.name}`}
                          aria-label={`Editar ${product.name}`}
                          onClick={() => edit(product)}
                        >
                          <Edit3 size={17} />
                        </button>
                        <button
                          className="admin-icon-button"
                          title="Tornar indisponível"
                          aria-label={`Tornar ${product.name} indisponível`}
                          disabled={!product.stock}
                          onClick={() => unavailable(product)}
                        >
                          <ArrowDownLeft size={17} />
                        </button>
                        <a
                          className="admin-icon-button"
                          title="Ver na loja"
                          aria-label={`Ver ${product.name} na loja`}
                          href={`#/produto/${product.id}`}
                        >
                          <ExternalLink size={17} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Nenhum produto encontrado"
            text="Altere a busca ou adicione um produto ao catálogo."
          />
        )}
      </section>
      {draft && (
        <Dialog
          title={draft.id ? "Editar produto" : "Novo produto"}
          onClose={() => setDraft(null)}
        >
          <form onSubmit={save} className="admin-form">
            <div className="admin-form-grid">
              <label className="form-field admin-span-2">
                Nome do produto
                <input
                  required
                  maxLength={120}
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
              </label>
              <label className="form-field">
                Categoria
                <select
                  required
                  value={draft.category}
                  onChange={(event) =>
                    setDraft({ ...draft, category: event.target.value })
                  }
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {data.categories.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                Estoque total
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={draft.stock}
                  onChange={(event) =>
                    setDraft({ ...draft, stock: event.target.value })
                  }
                />
              </label>
              <label className="form-field">
                Preço de venda (R$)
                <input
                  inputMode="decimal"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={draft.price}
                  onChange={(event) =>
                    setDraft({ ...draft, price: event.target.value })
                  }
                />
              </label>
              <label className="form-field">
                Preço anterior (R$) · opcional
                <input
                  inputMode="decimal"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draft.oldPrice}
                  onChange={(event) =>
                    setDraft({ ...draft, oldPrice: event.target.value })
                  }
                />
              </label>
              <label className="form-field admin-span-2">
                Descrição
                <textarea
                  required
                  rows={3}
                  value={draft.description}
                  onChange={(event) =>
                    setDraft({ ...draft, description: event.target.value })
                  }
                />
              </label>
              <label className="form-field admin-span-2">
                Opções do produto, separadas por vírgula
                <input
                  required
                  value={draft.variants}
                  onChange={(event) =>
                    setDraft({ ...draft, variants: event.target.value })
                  }
                  placeholder="Preto, Branco"
                />
                <small>O estoque é compartilhado entre as opções.</small>
              </label>
              <label className="form-field admin-span-2">
                Imagem · caminho local ou URL HTTPS
                <input
                  required
                  value={draft.image}
                  onChange={(event) =>
                    setDraft({ ...draft, image: event.target.value })
                  }
                  placeholder="/images/headphones.jpg"
                />
                <small>
                  Use uma imagem já disponível no projeto ou um endereço HTTPS.
                </small>
              </label>
              {safeImage(draft.image) && (
                <div className="admin-image-preview admin-span-2">
                  <img
                    src={draft.image}
                    alt="Prévia da imagem do produto"
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                    onLoad={(event) => {
                      event.currentTarget.style.visibility = "visible";
                    }}
                  />
                  <span>Prévia da imagem</span>
                </div>
              )}
              <label className="form-field">
                Selo · opcional
                <input
                  maxLength={24}
                  value={draft.badge}
                  onChange={(event) =>
                    setDraft({ ...draft, badge: event.target.value })
                  }
                  placeholder="Novidade"
                />
              </label>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(event) =>
                    setDraft({ ...draft, featured: event.target.checked })
                  }
                />{" "}
                Destaque na vitrine
              </label>
              <label className="form-field admin-span-2">
                Especificações · opcional
                <textarea
                  rows={3}
                  value={draft.specs}
                  onChange={(event) =>
                    setDraft({ ...draft, specs: event.target.value })
                  }
                  placeholder={"Garantia: 12 meses\nConexão: Bluetooth"}
                />
                <small>
                  Uma especificação por linha, no formato Nome: valor.
                </small>
              </label>
            </div>
            {error && (
              <p className="admin-form-error" role="alert">
                {error}
              </p>
            )}
            <div className="admin-form-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setDraft(null)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" type="submit">
                <Check size={17} /> Salvar produto
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
}

function Orders() {
  const { data, setData, notify } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const order = data.orders.find((order) => order.id === selected);
  const orders = [...data.orders]
    .filter(
      (order) =>
        `${order.id} ${order.customerName} ${order.email}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (!filter || order.status === filter),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  function changeStatus(order: Order, next: OrderStatus) {
    if (
      next === "Cancelado" &&
      !confirm(
        `Cancelar o pedido #${order.id}? O estoque será devolvido aos produtos.`,
      )
    )
      return;
    setData((previous) => {
      const current = previous.orders.find((item) => item.id === order.id);
      if (
        !current ||
        current.status === "Cancelado" ||
        current.status === "Entregue"
      )
        return previous;
      const index = statuses.indexOf(current.status);
      const allowed =
        next === "Cancelado" ? index < 3 : statuses[index + 1] === next;
      if (!allowed) return previous;
      return {
        ...previous,
        orders: previous.orders.map((item) =>
          item.id === order.id ? { ...item, status: next } : item,
        ),
        products:
          next === "Cancelado"
            ? previous.products.map((product) => ({
                ...product,
                stock:
                  product.stock +
                  current.items
                    .filter((item) => item.productId === product.id)
                    .reduce((sum, item) => sum + item.quantity, 0),
              }))
            : previous.products,
      };
    });
    notify(
      next === "Cancelado"
        ? "Pedido cancelado. Estoque devolvido."
        : `Pedido atualizado: ${next}.`,
    );
  }
  return (
    <>
      <section className="admin-panel">
        <PanelTitle
          title="Cada pedido, uma experiência"
          text={`${data.orders.length} ${data.orders.length === 1 ? "pedido recebido" : "pedidos recebidos"} na demonstração.`}
        />
        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={18} />
            <input
              aria-label="Buscar pedidos"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar pedido, cliente ou e-mail"
            />
          </label>
          <select
            aria-label="Filtrar status do pedido"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="">Todos os status</option>
            {[...statuses, "Cancelado"].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        {orders.length ? (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <button
                        className="admin-table-link"
                        onClick={() => setSelected(order.id)}
                      >
                        #{shortOrder(order.id)}
                      </button>
                    </td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <small>{order.email}</small>
                    </td>
                    <td>{date(order.createdAt)}</td>
                    <td>
                      <Status value={order.status} />
                    </td>
                    <td className="admin-amount">{money(order.total)}</td>
                    <td>
                      <button
                        className="admin-icon-button"
                        aria-label={`Ver pedido ${order.id}`}
                        onClick={() => setSelected(order.id)}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={
              data.orders.length
                ? "Nenhum pedido encontrado"
                : "O primeiro pedido vem aí"
            }
            text={
              data.orders.length
                ? "Tente outra busca ou outro status."
                : "Simule uma compra na loja para testar toda a jornada e administrar o pedido aqui."
            }
            action={
              !data.orders.length && (
                <a href="#/catalogo" className="btn btn-dark btn-small">
                  Ir para a loja <ArrowUpRight size={15} />
                </a>
              )
            }
          />
        )}
      </section>
      {order && (
        <Dialog title={`Pedido #${order.id}`} onClose={() => setSelected(null)}>
          <div className="admin-order-meta">
            <Status value={order.status} />
            <span>{new Date(order.createdAt).toLocaleString("pt-BR")}</span>
          </div>
          <OrderDetails order={order} />
          <div className="admin-order-actions">
            <p>
              O fluxo abaixo é uma simulação. Nenhuma cobrança ou mensagem é
              enviada.
            </p>
            <div>
              {order.status !== "Cancelado" &&
                statuses.indexOf(order.status) < 3 && (
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => changeStatus(order, "Cancelado")}
                  >
                    Cancelar pedido
                  </button>
                )}
              {statuses.indexOf(order.status) >= 0 &&
                statuses.indexOf(order.status) < statuses.length - 1 && (
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() =>
                      changeStatus(
                        order,
                        statuses[statuses.indexOf(order.status) + 1],
                      )
                    }
                  >
                    {order.status === "Pagamento pendente"
                      ? "Simular confirmação do pagamento"
                      : `Marcar como ${statuses[statuses.indexOf(order.status) + 1].toLowerCase()}`}
                    <ArrowRight size={16} />
                  </button>
                )}
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
function OrderDetails({ order }: { order: Order }) {
  return (
    <>
      <div className="admin-order-items">
        {order.items.map((item, index) => (
          <div key={`${item.productId}-${item.variant}-${index}`}>
            <img src={item.image} alt="" />
            <span>
              <strong>{item.name}</strong>
              <small>
                {item.variant} · {item.quantity} un. × {money(item.price)}
              </small>
            </span>
            <b>{money(item.price * item.quantity)}</b>
          </div>
        ))}
      </div>
      <dl className="admin-order-totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{money(order.subtotal)}</dd>
        </div>
        <div>
          <dt>Desconto {order.coupon && `(${order.coupon})`}</dt>
          <dd>− {money(order.discount)}</dd>
        </div>
        <div>
          <dt>Frete · {order.delivery}</dt>
          <dd>{money(order.shipping)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{money(order.total)}</dd>
        </div>
      </dl>
      <div className="admin-details-grid">
        <div>
          <h3>Cliente</h3>
          <p>
            {order.customerName}
            <br />
            {order.email}
          </p>
          <h3>Pagamento</h3>
          <p>{order.payment} · simulado</p>
        </div>
        <div>
          <h3>Endereço de entrega</h3>
          <p>
            {order.address.recipient}
            <br />
            {order.address.street}, {order.address.number}
            {order.address.complement && ` · ${order.address.complement}`}
            <br />
            {order.address.district}
            <br />
            {order.address.city} / {order.address.state}
            <br />
            CEP {order.address.cep}
          </p>
        </div>
      </div>
    </>
  );
}

function Customers() {
  const { data } = useStore();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const customers = data.customers.filter((customer) =>
    `${customer.name} ${customer.email}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const customer = data.customers.find((customer) => customer.id === selected);
  const orders = data.orders.filter((order) => order.customerId === selected);
  return (
    <>
      <section className="admin-panel">
        <PanelTitle
          title="Pessoas que fazem parte da loja"
          text={`${data.customers.length} cadastros fictícios neste navegador.`}
        />
        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={18} />
            <input
              aria-label="Buscar clientes"
              placeholder="Buscar por nome ou e-mail"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        {customers.length ? (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Pedidos</th>
                  <th>Total confirmado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const orders = data.orders.filter(
                    (order) => order.customerId === customer.id,
                  );
                  return (
                    <tr key={customer.id}>
                      <td>
                        <div className="admin-customer-cell">
                          <span>{customer.name.slice(0, 1)}</span>
                          <strong>{customer.name}</strong>
                        </div>
                      </td>
                      <td>
                        {customer.email}
                        <small>
                          {customer.phone || "Telefone não informado"}
                        </small>
                      </td>
                      <td>{orders.length}</td>
                      <td className="admin-amount">
                        {money(
                          orders
                            .filter(
                              (order) =>
                                !["Cancelado", "Pagamento pendente"].includes(
                                  order.status,
                                ),
                            )
                            .reduce((sum, order) => sum + order.total, 0),
                        )}
                      </td>
                      <td>
                        <button
                          className="admin-icon-button"
                          aria-label={`Ver cliente ${customer.name}`}
                          onClick={() => setSelected(customer.id)}
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Nenhum cliente encontrado"
            text="Os cadastros criados na área do cliente aparecerão aqui."
          />
        )}
      </section>
      {customer && (
        <Dialog title={customer.name} onClose={() => setSelected(null)}>
          <div className="admin-customer-detail">
            <p>
              {customer.email}
              <br />
              {customer.phone}
            </p>
            <h3>Endereços salvos</h3>
            {customer.addresses.length ? (
              customer.addresses.map((address) => (
                <div className="admin-address-card" key={address.id}>
                  <strong>
                    {address.label} · {address.recipient}
                  </strong>
                  <p>
                    {address.street}, {address.number}
                    {address.complement && ` · ${address.complement}`}
                    <br />
                    {address.district} · {address.city} / {address.state}
                    <br />
                    CEP {address.cep}
                  </p>
                </div>
              ))
            ) : (
              <p className="muted">Nenhum endereço cadastrado.</p>
            )}
            <h3>Histórico de pedidos</h3>
            {orders.length ? (
              <div className="admin-customer-orders">
                {orders.map((order) => (
                  <div key={order.id}>
                    <span>
                      <strong>#{shortOrder(order.id)}</strong>
                      <small>{date(order.createdAt)}</small>
                    </span>
                    <Status value={order.status} />
                    <b>{money(order.total)}</b>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Este cliente ainda não fez pedidos.</p>
            )}
            <a
              className="text-link"
              href="#/admin/pedidos"
              onClick={() => setSelected(null)}
            >
              Gerenciar pedidos <ArrowRight size={16} />
            </a>
          </div>
        </Dialog>
      )}
    </>
  );
}

function Categories() {
  const { data, setData, notify } = useStore();
  const [draft, setDraft] = useState<Category | null>(null);
  const [error, setError] = useState("");
  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft?.name.trim()) return;
    if (
      data.categories.some(
        (category) =>
          category.id !== draft.id &&
          category.name.toLowerCase() === draft.name.trim().toLowerCase(),
      )
    ) {
      setError("Já existe uma categoria com esse nome.");
      return;
    }
    setData((previous) => ({
      ...previous,
      categories: draft.id
        ? previous.categories.map((category) =>
            category.id === draft.id
              ? { ...category, name: draft.name.trim() }
              : category,
          )
        : [
            ...previous.categories,
            {
              id: `${slug(draft.name)}-${id().slice(0, 5)}`,
              name: draft.name.trim(),
            },
          ],
    }));
    notify(draft.id ? "Categoria atualizada." : "Categoria criada.");
    setDraft(null);
  }
  function remove(category: Category) {
    if (data.products.some((product) => product.category === category.id)) {
      notify("Mova os produtos para outra categoria antes de excluir esta.");
      return;
    }
    if (!confirm(`Excluir a categoria ${category.name}?`)) return;
    setData((previous) =>
      previous.products.some((product) => product.category === category.id)
        ? previous
        : {
            ...previous,
            categories: previous.categories.filter(
              (item) => item.id !== category.id,
            ),
          },
    );
    notify("Categoria excluída.");
  }
  return (
    <>
      <section className="admin-panel">
        <PanelTitle
          title="Tudo no seu lugar"
          text="Organize o catálogo para facilitar a descoberta."
          action={
            <button
              className="btn btn-primary btn-small"
              onClick={() => {
                setError("");
                setDraft({ id: "", name: "" });
              }}
            >
              <Plus size={17} /> Nova categoria
            </button>
          }
        />
        <div className="admin-category-grid">
          {data.categories.map((category) => (
            <article key={category.id}>
              <span className="admin-category-icon">
                <FolderTree size={25} />
              </span>
              <h3>{category.name}</h3>
              <p>
                {
                  data.products.filter(
                    (product) => product.category === category.id,
                  ).length
                }{" "}
                produtos
              </p>
              <div>
                <button
                  className="text-link"
                  onClick={() => {
                    setError("");
                    setDraft({ ...category });
                  }}
                >
                  Editar <Edit3 size={14} />
                </button>
                <button
                  className="admin-icon-button"
                  aria-label={`Excluir categoria ${category.name}`}
                  onClick={() => remove(category)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {!data.categories.length && (
          <Empty
            title="Organize seu catálogo"
            text="Crie a primeira categoria para começar a cadastrar produtos."
          />
        )}
      </section>
      {draft && (
        <Dialog
          title={draft.id ? "Editar categoria" : "Nova categoria"}
          onClose={() => setDraft(null)}
        >
          <form className="admin-form" onSubmit={save}>
            <label className="form-field">
              Nome da categoria
              <input
                required
                maxLength={50}
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </label>
            {error && (
              <p className="admin-form-error" role="alert">
                {error}
              </p>
            )}
            <div className="admin-form-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setDraft(null)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" type="submit">
                Salvar categoria
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
}

function Coupons() {
  const { data, setData, notify } = useStore();
  const [draft, setDraft] = useState<(Coupon & { original: string }) | null>(
    null,
  );
  const [error, setError] = useState("");
  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const code = draft.code.trim().toUpperCase();
    if (
      !/^[A-Z0-9_-]{3,24}$/.test(code) ||
      !Number.isInteger(draft.percent) ||
      draft.percent < 1 ||
      draft.percent > 100
    ) {
      setError(
        "Use código de 3 a 24 letras, números, hífen ou sublinhado e desconto inteiro entre 1% e 100%.",
      );
      return;
    }
    if (
      data.coupons.some(
        (coupon) => coupon.code === code && coupon.code !== draft.original,
      )
    ) {
      setError("Este código já está em uso.");
      return;
    }
    const coupon: Coupon = {
      code,
      percent: draft.percent,
      active: draft.active,
    };
    setData((previous) => ({
      ...previous,
      coupons: draft.original
        ? previous.coupons.map((item) =>
            item.code === draft.original ? coupon : item,
          )
        : [...previous.coupons, coupon],
    }));
    notify("Cupom salvo.");
    setDraft(null);
  }
  function remove(code: string) {
    if (
      !confirm(
        `Excluir o cupom ${code}? Os pedidos anteriores serão preservados.`,
      )
    )
      return;
    setData((previous) => ({
      ...previous,
      coupons: previous.coupons.filter((coupon) => coupon.code !== code),
    }));
    notify("Cupom excluído.");
  }
  return (
    <>
      <section className="admin-panel">
        <PanelTitle
          title="Um bom motivo para voltar"
          text="Cupons de desconto aplicados aos produtos, sem incluir o frete."
          action={
            <button
              className="btn btn-primary btn-small"
              onClick={() => {
                setError("");
                setDraft({ code: "", original: "", percent: 10, active: true });
              }}
            >
              <Plus size={17} /> Novo cupom
            </button>
          }
        />
        {data.coupons.length ? (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Desconto</th>
                  <th>Status</th>
                  <th>Uso em pedidos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.coupons.map((coupon) => (
                  <tr key={coupon.code}>
                    <td>
                      <span className="admin-coupon-code">
                        <Tag size={15} />
                        {coupon.code}
                      </span>
                    </td>
                    <td>
                      <strong>{coupon.percent}%</strong>
                    </td>
                    <td>
                      <span
                        className={`admin-status admin-status-${coupon.active ? "delivered" : "cancelled"}`}
                      >
                        <span />
                        {coupon.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>
                      {
                        data.orders.filter(
                          (order) => order.coupon === coupon.code,
                        ).length
                      }
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-icon-button"
                          aria-label={`Editar cupom ${coupon.code}`}
                          onClick={() => {
                            setError("");
                            setDraft({ ...coupon, original: coupon.code });
                          }}
                        >
                          <Edit3 size={17} />
                        </button>
                        <button
                          className="admin-icon-button"
                          aria-label={`Excluir cupom ${coupon.code}`}
                          onClick={() => remove(coupon.code)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Seu próximo incentivo"
            text="Crie um cupom e teste a aplicação do desconto no checkout."
          />
        )}
      </section>
      {draft && (
        <Dialog
          title={draft.original ? "Editar cupom" : "Novo cupom"}
          onClose={() => setDraft(null)}
        >
          <form className="admin-form" onSubmit={save}>
            <div className="admin-form-grid">
              <label className="form-field">
                Código
                <input
                  required
                  minLength={3}
                  maxLength={24}
                  value={draft.code}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      code: event.target.value.toUpperCase(),
                    })
                  }
                  placeholder="BEMVINDO10"
                />
              </label>
              <label className="form-field">
                Desconto (%)
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  step="1"
                  value={draft.percent}
                  onChange={(event) =>
                    setDraft({ ...draft, percent: Number(event.target.value) })
                  }
                />
              </label>
              <label className="admin-checkbox admin-span-2">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(event) =>
                    setDraft({ ...draft, active: event.target.checked })
                  }
                />{" "}
                Cupom disponível no checkout
              </label>
            </div>
            {error && (
              <p className="admin-form-error" role="alert">
                {error}
              </p>
            )}
            <div className="admin-form-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setDraft(null)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" type="submit">
                Salvar cupom
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
}

function StoreSettings() {
  const { data, setData, notify } = useStore();
  const [draft, setDraft] = useState<Settings>({ ...data.settings });
  const [threshold, setThreshold] = useState(
    amount(data.settings.freeShippingThreshold),
  );
  const [error, setError] = useState("");
  function save(event: FormEvent) {
    event.preventDefault();
    const freeShippingThreshold = cents(threshold);
    if (
      !draft.name.trim() ||
      !draft.tagline.trim() ||
      (draft.email.trim() !== "" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) ||
      !/^#[a-f0-9]{6}$/i.test(draft.primaryColor) ||
      !Number.isFinite(freeShippingThreshold) ||
      freeShippingThreshold < 0
    ) {
      setError(
        "Confira o nome, a descrição, o e-mail, a cor e o valor do frete grátis.",
      );
      return;
    }
    setData((previous) => ({
      ...previous,
      settings: {
        ...draft,
        name: draft.name.trim(),
        tagline: draft.tagline.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        freeShippingThreshold,
      },
    }));
    setError("");
    notify("Configurações salvas. A loja já foi atualizada.");
  }
  return (
    <form onSubmit={save} className="admin-settings">
      <section className="admin-panel">
        <PanelTitle
          title="A essência da sua marca"
          text="Personalize os detalhes que tornam a loja sua."
        />
        <div className="admin-settings-body">
          <div className="admin-form-grid">
            <label className="form-field">
              Nome da loja
              <input
                required
                maxLength={32}
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </label>
            <label className="form-field">
              Assinatura da marca
              <input
                required
                maxLength={100}
                value={draft.tagline}
                onChange={(event) =>
                  setDraft({ ...draft, tagline: event.target.value })
                }
              />
            </label>
            <label className="form-field">
              E-mail de contato · opcional
              <input
                type="email"
                value={draft.email}
                onChange={(event) =>
                  setDraft({ ...draft, email: event.target.value })
                }
              />
            </label>
            <label className="form-field">
              Telefone de contato
              <input
                required
                maxLength={30}
                value={draft.phone}
                onChange={(event) =>
                  setDraft({ ...draft, phone: event.target.value })
                }
              />
            </label>
            <label className="form-field admin-span-2">
              Cor principal
              <div className="admin-color-field">
                <input
                  aria-label="Escolher cor principal"
                  type="color"
                  value={draft.primaryColor}
                  onChange={(event) =>
                    setDraft({ ...draft, primaryColor: event.target.value })
                  }
                />
                <input
                  aria-label="Código da cor principal"
                  pattern="#[a-fA-F0-9]{6}"
                  required
                  value={draft.primaryColor}
                  onChange={(event) =>
                    setDraft({ ...draft, primaryColor: event.target.value })
                  }
                />
              </div>
              <small>
                Aplicada aos destaques e botões da loja. Confira o contraste
                antes de compartilhar.
              </small>
            </label>
          </div>
        </div>
      </section>
      <section className="admin-panel">
        <PanelTitle
          title="Uma boa primeira impressão"
          text="Seu anúncio no topo e a condição de frete da simulação."
        />
        <div className="admin-settings-body">
          <div className="admin-form-grid">
            <label className="form-field admin-span-2">
              Anúncio da loja
              <input
                maxLength={180}
                value={draft.announcement}
                onChange={(event) =>
                  setDraft({ ...draft, announcement: event.target.value })
                }
                placeholder="Novidades para sua rotina."
              />
              <small>Deixe vazio para ocultar o texto do anúncio.</small>
            </label>
            <label className="form-field">
              Frete grátis a partir de (R$)
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
              />
              <small>Condição para entrega padrão no cálculo simulado.</small>
            </label>
          </div>
        </div>
      </section>
      <div className="admin-note">
        <CircleHelp size={20} />
        <div>
          <strong>Uma demonstração, muitas possibilidades.</strong>
          <p>
            Estas configurações ficam neste navegador. Cada clone pode receber
            sua própria marca, catálogo e integrações reais em uma etapa
            posterior.
          </p>
        </div>
      </div>
      {error && (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      )}
      <div className="admin-form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setDraft({ ...data.settings });
            setThreshold(amount(data.settings.freeShippingThreshold));
            setError("");
          }}
        >
          Descartar alterações
        </button>
        <button className="btn btn-primary" type="submit">
          <Check size={17} /> Salvar configurações
        </button>
      </div>
    </form>
  );
}
