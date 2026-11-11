import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Search,
  Heart,
  ShoppingBag,
  UserRound,
  Menu,
  X,
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Plus,
  Minus,
  Check,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Package,
  Mail,
  Instagram,
  LayoutDashboard,
  Monitor,
  Laptop,
  MapPin,
  Plug,
  Zap,
} from "lucide-react";
import { StoreContext, useStore } from "./context";
import { company, storeConfig } from "./config";
import { seed } from "./seed";
import { money } from "./domain";
import type { CartItem, Product, StoreData } from "./types";
import CustomerPages from "./CustomerPages";
import Admin from "./Admin";

function readLocal<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function useHash() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/");
  useEffect(() => {
    const fn = () => {
      setRoute(location.hash.slice(1) || "/");
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return route;
}
export default function App() {
  const [data, setData] = useState<StoreData>(() => {
    const d = readLocal<StoreData>(storeConfig.storageKey, seed);
    return d.version === 1 &&
      Array.isArray(d.products) &&
      Array.isArray(d.orders) &&
      d.settings
      ? d
      : seed;
  });
  const [cart, setCart] = useState<CartItem[]>(() =>
    readLocal(storeConfig.storageKey + "-cart", []),
  );
  const [favorites, setFavorites] = useState<string[]>(() =>
    readLocal(storeConfig.storageKey + "-favorites", []),
  );
  const [customerId, setCustomerId] = useState<string | null>(() =>
    readLocal(storeConfig.storageKey + "-customer", "demo"),
  );
  const [couponCode, setCouponCode] = useState<string>(() =>
    readLocal(storeConfig.storageKey + "-coupon", ""),
  );
  const [toast, setToast] = useState("");
  const path = useHash();
  const customer = data.customers.find((c) => c.id === customerId) ?? null;
  useEffect(() => {
    try {
      localStorage.setItem(storeConfig.storageKey, JSON.stringify(data));
      localStorage.setItem(
        storeConfig.storageKey + "-cart",
        JSON.stringify(cart),
      );
      localStorage.setItem(
        storeConfig.storageKey + "-favorites",
        JSON.stringify(favorites),
      );
      localStorage.setItem(
        storeConfig.storageKey + "-customer",
        JSON.stringify(customerId),
      );
      localStorage.setItem(
        storeConfig.storageKey + "-coupon",
        JSON.stringify(couponCode),
      );
    } catch {
      setToast(
        "O navegador não conseguiu salvar os dados. Mantenha esta aba aberta.",
      );
    }
  }, [data, cart, favorites, customerId, couponCode]);
  useEffect(() => {
    if (toast) {
      const id = window.setTimeout(() => setToast(""), 4500);
      return () => window.clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--accent",
      data.settings.primaryColor,
    );
    document.title = `${data.settings.name} — ${path.startsWith("/admin") ? "Painel da loja" : data.settings.tagline}`;
  }, [path, data.settings]);
  function addToCart(id: string, variant?: string, quantity = 1) {
    const p = data.products.find((p) => p.id === id);
    if (!p) return;
    const option = variant ?? p.variants[0];
    if (
      !p.variants.includes(option) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    )
      return;
    const current = cart
      .filter((i) => i.productId === id)
      .reduce((n, i) => n + i.quantity, 0);
    if (current + quantity > p.stock) {
      setToast("Quantidade maior que o estoque disponível.");
      return;
    }
    setCart((old) => {
      const found = old.find((i) => i.productId === id && i.variant === option);
      return found
        ? old.map((i) =>
            i === found ? { ...i, quantity: i.quantity + quantity } : i,
          )
        : [...old, { productId: id, variant: option, quantity }];
    });
    setToast(`${p.name} adicionado à sacola.`);
  }
  const context = {
    data,
    setData,
    cart,
    setCart,
    couponCode,
    setCouponCode,
    favorites,
    toggleFavorite: (id: string) =>
      setFavorites((old) =>
        old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
      ),
    addToCart,
    customer,
    setCustomerId,
    notify: setToast,
  };
  return (
    <StoreContext.Provider value={context}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById("main-content");
          main?.focus();
          main?.scrollIntoView();
        }}
      >
        Pular para o conteúdo
      </a>
      {path.startsWith("/admin") ? (
        <Admin path={path} />
      ) : (
        <>
          <Header />
          <main id="main-content" tabIndex={-1}>
            {path === "/" ? (
              <Home />
            ) : path.startsWith("/catalogo") ? (
              <Catalog path={path} />
            ) : path.startsWith("/produto/") ? (
              <ProductPage id={path.split("/")[2]} />
            ) : path.startsWith("/conta") ||
              path.startsWith("/carrinho") ||
              path.startsWith("/checkout") ||
              path.startsWith("/pedido/") ? (
              <CustomerPages path={path} />
            ) : (
              <InfoPage path={path} />
            )}
          </main>
          <Footer />
        </>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button aria-label="Fechar aviso" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </StoreContext.Provider>
  );
}
function Brand() {
  const { data } = useStore();
  return (
    <a
      href="#/"
      className="brand"
      aria-label={`${data.settings.name}, página inicial`}
    >
      <img src="/images/latina-logo.png" alt={data.settings.name} />
    </a>
  );
}
function Header() {
  const { data, cart, favorites, customer } = useStore();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const close = () => setMenu(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);
  return (
    <>
      <div className="demo-bar">
        <span>PROTÓTIPO DA LOJA · CATÁLOGO E PEDIDOS FICTÍCIOS</span>
        <a href="#/admin">
          Explorar painel <ArrowUpRight size={12} />
        </a>
      </div>
      <div className="announcement">
        <span>{data.settings.announcement}</span>
        <a href="#/catalogo?ofertas=1">
          Aproveite <ArrowRight size={13} />
        </a>
      </div>
      <header className={`header ${menu ? "menu-open" : ""}`}>
        <div className="container header-main">
          <button
            className="icon-btn menu-toggle"
            aria-expanded={menu}
            aria-label="Abrir menu"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <Brand />
          <form
            className="header-search"
            onSubmit={(e) => {
              e.preventDefault();
              location.hash = "/catalogo?q=" + encodeURIComponent(search);
            }}
          >
            <Search size={19} />
            <input
              aria-label="Buscar produtos"
              placeholder="O que você está procurando?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button aria-label="Pesquisar">
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="header-actions">
            <a href="#/conta" className="account-link">
              <UserRound size={22} />
              <span>
                Olá, {customer ? customer.name.split(" ")[0] : "visitante"}
                <strong>Minha conta</strong>
              </span>
            </a>
            <a
              href="#/conta/favoritos"
              className="icon-btn"
              aria-label={`Favoritos (${favorites.length})`}
            >
              <Heart size={22} />
              {favorites.length > 0 && <b>{favorites.length}</b>}
            </a>
            <a
              href="#/carrinho"
              className="bag-link"
              aria-label={`Sacola (${cart.reduce((s, i) => s + i.quantity, 0)})`}
            >
              <ShoppingBag size={22} />
              <span>Sacola</span>
              <b>{cart.reduce((s, i) => s + i.quantity, 0)}</b>
            </a>
          </div>
        </div>
        <nav
          className={`container category-nav ${menu ? "is-open" : ""}`}
          aria-label="Categorias"
        >
          <a href="#/catalogo" className="all-categories">
            <Menu size={16} /> Todos os produtos
          </a>
          {data.categories.map((c) => (
            <a key={c.id} href={`#/catalogo?categoria=${c.id}`}>
              {c.name}
            </a>
          ))}
          <a href="#/catalogo?ofertas=1" className="nav-offer">
            <Zap size={15} /> Ofertas da semana
          </a>
          <a href="#/sobre" className="nav-about">
            A {data.settings.name}
          </a>
          <a href="#/conta" className="mobile-account">
            Minha conta
          </a>
        </nav>
      </header>
    </>
  );
}
function ProductCard({ product: p }: { product: Product }) {
  const { data, addToCart, favorites, toggleFavorite } = useStore();
  return (
    <article className="product-card">
      <div className="product-photo">
        <a href={`#/produto/${p.id}`} tabIndex={-1}>
          <img src={p.image} alt={p.name} loading="lazy" />
        </a>
        {p.badge && (
          <span
            className={`product-badge ${p.badge === "Novidade" ? "badge-dark" : ""}`}
          >
            {p.badge}
          </span>
        )}
        <button
          className={`favorite-btn ${favorites.includes(p.id) ? "active" : ""}`}
          aria-label={`${favorites.includes(p.id) ? "Remover" : "Adicionar"} ${p.name} ${favorites.includes(p.id) ? "dos" : "aos"} favoritos`}
          aria-pressed={favorites.includes(p.id)}
          onClick={() => toggleFavorite(p.id)}
        >
          <Heart
            size={18}
            fill={favorites.includes(p.id) ? "currentColor" : "none"}
          />
        </button>
        <button
          className="quick-add"
          disabled={!p.stock}
          onClick={() => addToCart(p.id)}
          aria-label={`Adicionar ${p.name} à sacola`}
        >
          <Plus size={16} />
          {p.stock ? "Adicionar à sacola" : "Indisponível"}
        </button>
      </div>
      <div className="product-meta">
        <span>{data.categories.find((c) => c.id === p.category)?.name}</span>
        <span>
          <Star size={11} fill="currentColor" /> {p.rating.toFixed(1)}
        </span>
      </div>
      <h3>
        <a href={`#/produto/${p.id}`}>{p.name}</a>
      </h3>
      <div className="product-prices">
        {p.oldPrice && p.oldPrice > p.price && <del>{money(p.oldPrice)}</del>}
        <strong>{money(p.price)}</strong>
      </div>
      <p className="installments">em até 6x sem juros</p>
    </article>
  );
}
function Home() {
  const { data } = useStore();
  const [category, setCategory] = useState("todos");
  const icons = [Laptop, Monitor, Headphones, Plug];
  const products = data.products
    .filter(
      (p) => p.featured && (category === "todos" || p.category === category),
    )
    .slice(0, 8);
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span /> LATINA INFORMÁTICA · NOVO HAMBURGO
            </div>
            <h1>
              Seu dia merece
              <br />
              um <em>upgrade.</em>
            </h1>
            <p>
              Informática, acessórios e assistência técnica.
              <br />
              Conheça uma nova experiência para a Latina.
            </p>
            <a href="#/catalogo" className="btn btn-dark">
              Explore os produtos <ArrowUpRight size={19} />
            </a>
            <div className="hero-foot">
              <span className="hero-line" /> ESCOLHAS INTELIGENTES. TODOS OS
              DIAS.
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="/images/hero.jpg"
              alt="Headphone preto em uma composição de design com pedestal terracota"
              fetchPriority="high"
            />
            <a className="hero-product" href="#/produto/air-one">
              <span className="circle-arrow">
                <ArrowUpRight size={22} />
              </span>
              <span>
                <small>SEU MUNDO, SEU SOM</small>
                <strong>Headphone Bluetooth</strong>
              </span>
              <span className="hero-product-price">
                {money(
                  data.products.find((p) => p.id === "air-one")?.price ?? 39990,
                )}
              </span>
            </a>
            <span className="hero-edition">CATÁLOGO ILUSTRATIVO · LATINA</span>
          </div>
        </div>
      </section>
      <section className="benefits container" aria-label="Vantagens da loja">
        <div>
          <Truck />
          <span>
            <strong>Entrega do seu jeito</strong>
            <small>
              Frete simulado grátis acima de{" "}
              {money(data.settings.freeShippingThreshold)}
            </small>
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            <strong>Explore cada etapa</strong>
            <small>Checkout simulado, sem cobrança</small>
          </span>
        </div>
        <div>
          <RefreshCw />
          <span>
            <strong>Trocas e atendimento</strong>
            <small>Conheça o fluxo da demonstração</small>
          </span>
        </div>
        <div>
          <Headphones />
          <span>
            <strong>Fale com a Latina</strong>
            <small>WhatsApp: {data.settings.phone}</small>
          </span>
        </div>
      </section>
      <section className="container category-section">
        <div className="section-top">
          <div>
            <span className="eyebrow">UM ESSENCIAL PARA CADA MOMENTO</span>
            <h2>Encontre o seu universo.</h2>
          </div>
          <a href="#/catalogo" className="text-link">
            Ver tudo <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="category-grid">
          {data.categories.map((c, i) => {
            const Icon = icons[i % icons.length];
            return (
              <a
                className="category-tile"
                href={`#/catalogo?categoria=${c.id}`}
                key={c.id}
              >
                <div className="category-icon">
                  <Icon size={28} strokeWidth={1.3} />
                </div>
                <span>
                  {c.name}
                  <small>
                    {
                      [
                        "Para estudar e trabalhar",
                        "Seu espaço, suas ideias",
                        "Para ouvir e sentir",
                        "Pequenos grandes upgrades",
                      ][i % 4]
                    }
                  </small>
                </span>
                <ArrowUpRight size={19} />
              </a>
            );
          })}
        </div>
      </section>
      <section className="container featured-section">
        <div className="section-top">
          <div>
            <span className="eyebrow">SELECIONADOS PARA VOCÊ</span>
            <h2>O próximo favorito é seu.</h2>
          </div>
          <a href="#/catalogo" className="text-link">
            Explorar produtos <ArrowUpRight size={17} />
          </a>
        </div>
        <div
          className="product-tabs"
          role="group"
          aria-label="Filtrar destaques"
        >
          <button
            onClick={() => setCategory("todos")}
            className={category === "todos" ? "active" : ""}
          >
            Todos
          </button>
          {data.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={category === c.id ? "active" : ""}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!products.length && (
          <p className="empty-state">Novas escolhas chegam em breve.</p>
        )}
      </section>
      <section className="container editorial-grid">
        <a
          href="#/catalogo?categoria=setup"
          className="editorial-card editorial-dark"
        >
          <div>
            <span className="eyebrow">SEU ESPAÇO, MAIS VOCÊ</span>
            <h2>
              Ideias grandes.
              <br />
              Setup à altura.
            </h2>
            <span className="editorial-link">
              Monte seu setup <ArrowUpRight size={20} />
            </span>
          </div>
          <img
            src="/images/keyboard.jpg"
            loading="lazy"
            alt="Teclado para um setup criativo"
          />
        </a>
        <a
          href="#/catalogo?categoria=notebooks"
          className="editorial-card editorial-light"
        >
          <div>
            <span className="eyebrow">ESTUDE. TRABALHE. CRIE.</span>
            <h2>
              Conecte-se
              <br />
              ao que importa.
            </h2>
            <span className="editorial-link">
              Explore os notebooks <ArrowUpRight size={20} />
            </span>
          </div>
          <img
            src="/images/notebook.jpg"
            loading="lazy"
            alt="Notebook em uma composição ilustrativa"
          />
        </a>
      </section>
      <section className="container brand-note">
        <span className="brand-note-symbol">✳</span>
        <span className="eyebrow">MENOS COMPLICAÇÃO. MAIS POSSIBILIDADES.</span>
        <h2>
          Boa tecnologia faz parte da vida.
          <br />
          <span>A melhor é a que faz sentido para você.</span>
        </h2>
        <a href="#/sobre" className="text-link">
          Essa é a nossa ideia <ArrowUpRight size={18} />
        </a>
      </section>
    </>
  );
}
function Catalog({ path }: { path: string }) {
  const { data } = useStore();
  const params = new URLSearchParams(path.split("?")[1] || "");
  const [term, setTerm] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("categoria") ?? "todos");
  const [sort, setSort] = useState("destaques");
  const priceCeiling = Math.max(1000, ...data.products.map((p) => p.price));
  const [max, setMax] = useState<number | null>(null);
  const effectiveMax = max ?? priceCeiling;
  const [onlyStock, setOnlyStock] = useState(false);
  const [filters, setFilters] = useState(false);
  useEffect(() => {
    setTerm(params.get("q") ?? "");
    setCategory(params.get("categoria") ?? "todos");
  }, [path]);
  const products = data.products
    .filter(
      (p) =>
        (category === "todos" || p.category === category) &&
        p.name
          .toLocaleLowerCase("pt-BR")
          .includes(term.toLocaleLowerCase("pt-BR")) &&
        p.price <= effectiveMax &&
        (!onlyStock || p.stock > 0) &&
        (!params.has("ofertas") || (p.oldPrice ?? 0) > p.price),
    )
    .sort((a, b) =>
      sort === "menor"
        ? a.price - b.price
        : sort === "maior"
          ? b.price - a.price
          : sort === "nome"
            ? a.name.localeCompare(b.name)
            : Number(b.featured) - Number(a.featured),
    );
  return (
    <div className="container catalog-page">
      <Breadcrumb items={[["Coleção", "/catalogo"]]} />
      <div className="catalog-heading">
        <div>
          <span className="eyebrow">ENCONTRE O SEU PRÓXIMO ESSENCIAL</span>
          <h1>
            {params.has("ofertas")
              ? "Boas escolhas. Melhores preços."
              : category === "todos"
                ? "Explore a coleção."
                : (data.categories.find((c) => c.id === category)?.name ??
                  "Explore a coleção.")}
          </h1>
          <p className="muted">
            Peças que combinam com você e simplificam sua rotina.
          </p>
        </div>
        <span className="collection-count">{products.length} produtos</span>
      </div>
      <div className="catalog-toolbar">
        <button
          className="filter-toggle btn btn-secondary"
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal size={16} /> Filtros
        </button>
        <form className="catalog-search" onSubmit={(e) => e.preventDefault()}>
          <Search size={17} />
          <input
            aria-label="Filtrar por nome"
            placeholder="Buscar nesta coleção"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </form>
        <label className="sort-label">
          Ordenar por{" "}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Ordenar produtos"
          >
            <option value="destaques">Destaques</option>
            <option value="menor">Menor preço</option>
            <option value="maior">Maior preço</option>
            <option value="nome">Nome A–Z</option>
          </select>
        </label>
      </div>
      <div className="catalog-layout">
        <aside className={`catalog-filters ${filters ? "filters-open" : ""}`}>
          <h3>Categorias</h3>
          {[{ id: "todos", name: "Todos os produtos" }, ...data.categories].map(
            (c) => (
              <label className="filter-option" key={c.id}>
                <input
                  type="radio"
                  name="category"
                  checked={category === c.id}
                  onChange={() => setCategory(c.id)}
                />
                {c.name}
                <span>
                  {
                    data.products.filter(
                      (p) => c.id === "todos" || p.category === c.id,
                    ).length
                  }
                </span>
              </label>
            ),
          )}
          <h3>Faixa de preço</h3>
          <input
            className="price-range"
            type="range"
            min="0"
            max={priceCeiling}
            step="1"
            value={effectiveMax}
            onChange={(e) => setMax(Number(e.target.value))}
            aria-label="Preço máximo"
          />
          <p className="muted">Até {money(effectiveMax)}</p>
          <h3>Disponibilidade</h3>
          <label className="filter-option">
            <input
              type="checkbox"
              checked={onlyStock}
              onChange={(e) => setOnlyStock(e.target.checked)}
            />{" "}
            Em estoque
          </label>
          <button
            className="text-link filter-reset"
            onClick={() => {
              setCategory("todos");
              setTerm("");
              setMax(null);
              setOnlyStock(false);
              location.hash = "/catalogo";
            }}
          >
            Limpar filtros
          </button>
          <div className="filter-help">
            <Headphones size={24} />
            <h4>Uma mãozinha na escolha?</h4>
            <p>A gente ajuda você a encontrar o seu essencial.</p>
            <a href="#/contato" className="text-link">
              Fale com a {data.settings.name} <ArrowUpRight size={15} />
            </a>
          </div>
        </aside>
        <div>
          {products.length ? (
            <div className="product-grid catalog-products">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={38} />
              <h2>Nenhum produto por aqui.</h2>
              <p>Tente outro termo ou ajuste os filtros.</p>
              <button
                className="btn btn-dark"
                onClick={() => {
                  setTerm("");
                  setCategory("todos");
                  setMax(null);
                  location.hash = "/catalogo";
                }}
              >
                Ver toda a coleção
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function Breadcrumb({ items }: { items: [string, string][] }) {
  return (
    <nav className="breadcrumb" aria-label="Navegação estrutural">
      <a href="#/">Início</a>
      {items.map(([label, path], i) => (
        <React.Fragment key={i}>
          <span>/</span>
          <a href={`#${path}`}>{label}</a>
        </React.Fragment>
      ))}
    </nav>
  );
}
function ProductPage({ id }: { id: string }) {
  const { data, addToCart, favorites, toggleFavorite, notify } = useStore();
  const p = data.products.find((p) => p.id === id);
  const [variant, setVariant] = useState("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("detalhes");
  const [cep, setCep] = useState("");
  const [shipping, setShipping] = useState(false);
  useEffect(() => {
    setVariant(p?.variants[0] ?? "");
    setQty(1);
    setShipping(false);
    setTab("detalhes");
  }, [id]);
  if (!p) return <NotFound />;
  return (
    <div className="container detail-page">
      <Breadcrumb
        items={[
          ["Coleção", "/catalogo"],
          [p.name, `/produto/${p.id}`],
        ]}
      />
      <div className="detail-grid">
        <div className="detail-image">
          <img src={p.image} alt={p.name} />
          {p.badge && <span className="product-badge">{p.badge}</span>}
          <span className="detail-image-caption">
            DESIGN PARA O SEU DIA A DIA.
          </span>
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            {data.categories.find((c) => c.id === p.category)?.name} /{" "}
            {data.settings.name}
            ESSENTIALS
          </span>
          <h1>{p.name}</h1>
          <div className="rating">
            <Star size={14} fill="currentColor" /> {p.rating}{" "}
            <span>· Avaliação ilustrativa</span>
            <span className="stock-label">
              {p.stock ? "Em estoque" : "Indisponível"}
            </span>
          </div>
          <p className="detail-description">{p.description}</p>
          <div className="detail-price">
            {p.oldPrice && p.oldPrice > p.price && (
              <del>{money(p.oldPrice)}</del>
            )}
            <strong>{money(p.price)}</strong>
            <p>em até 6x sem juros</p>
          </div>
          <div className="variant-label">
            Cor / modelo: <strong>{variant}</strong>
          </div>
          <div
            className="variants"
            role="group"
            aria-label="Selecionar cor ou modelo"
          >
            {p.variants.map((v) => (
              <button
                key={v}
                className={variant === v ? "active" : ""}
                aria-pressed={variant === v}
                onClick={() => setVariant(v)}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="buy-row">
            <div className="quantity-control">
              <button
                aria-label="Diminuir quantidade"
                disabled={qty <= 1}
                onClick={() => setQty(qty - 1)}
              >
                <Minus size={15} />
              </button>
              <span>{qty}</span>
              <button
                aria-label="Aumentar quantidade"
                disabled={qty >= p.stock}
                onClick={() => setQty(qty + 1)}
              >
                <Plus size={15} />
              </button>
            </div>
            <button
              className="btn btn-primary"
              disabled={!p.stock}
              onClick={() => addToCart(p.id, variant, qty)}
            >
              <ShoppingBag size={18} /> Adicionar à sacola
            </button>
            <button
              className="icon-btn detail-favorite"
              aria-label="Favoritar produto"
              aria-pressed={favorites.includes(p.id)}
              onClick={() => toggleFavorite(p.id)}
            >
              <Heart
                fill={favorites.includes(p.id) ? "currentColor" : "none"}
              />
            </button>
          </div>
          <button
            className="btn btn-secondary buy-now"
            disabled={!p.stock}
            onClick={() => {
              const current = data.products.find((x) => x.id === id);
              if (!current || current.stock < qty) {
                notify("Produto indisponível para esta quantidade.");
                return;
              }
              addToCart(p.id, variant, qty);
              location.hash = "/carrinho";
            }}
          >
            Comprar agora <ArrowRight size={17} />
          </button>
          <form
            className="shipping-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (cep.replace(/\D/g, "").length !== 8) {
                notify("Informe um CEP com 8 dígitos.");
                return;
              }
              setShipping(true);
            }}
          >
            <label htmlFor="product-cep">
              <Truck size={17} /> Calcule o frete e o prazo
            </label>
            <div>
              <input
                id="product-cep"
                inputMode="numeric"
                maxLength={9}
                placeholder="Seu CEP"
                value={cep}
                onChange={(e) => {
                  setCep(e.target.value);
                  setShipping(false);
                }}
              />
              <button type="submit">Calcular</button>
            </div>
            {shipping && (
              <p className="shipping-result">
                Entrega padrão:{" "}
                {p.price * qty >= data.settings.freeShippingThreshold
                  ? "grátis"
                  : money(1990)}{" "}
                · 5 a 8 dias úteis. Simulação de frete.
              </p>
            )}
          </form>
          <div className="detail-assurance">
            <ShieldCheck size={16} /> Garantia e suporte <span>·</span>{" "}
            <RefreshCw size={16} /> Troca descomplicada
          </div>
        </div>
      </div>
      <section className="product-information">
        <div className="information-tabs">
          <button
            onClick={() => setTab("detalhes")}
            className={tab === "detalhes" ? "active" : ""}
          >
            Sobre o produto
          </button>
          <button
            onClick={() => setTab("specs")}
            className={tab === "specs" ? "active" : ""}
          >
            Especificações
          </button>
          <button
            onClick={() => setTab("entrega")}
            className={tab === "entrega" ? "active" : ""}
          >
            Entrega e trocas
          </button>
        </div>
        {tab === "detalhes" ? (
          <div className="information-copy">
            <h2>Um essencial que acompanha você.</h2>
            <p>{p.description}</p>
            <p>
              Este é um item ilustrativo do protótipo da Latina Informática.
              Fotos, características e avaliações ilustram a experiência de
              compra e podem ser substituídas na sua loja.
            </p>
          </div>
        ) : tab === "specs" ? (
          <dl className="spec-list">
            {Object.entries(p.specs).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="information-copy">
            <h2>Do clique ao seu dia a dia.</h2>
            <p>
              Escolha entre entrega padrão ou expressa no checkout. Os prazos e
              valores desta demonstração são simulados, sem consulta a
              transportadoras.
            </p>
            <a href="#/politica/trocas" className="text-link">
              Conhecer a política de trocas <ArrowUpRight size={16} />
            </a>
          </div>
        )}
      </section>
      <section className="related-section">
        <div className="section-top">
          <div>
            <span className="eyebrow">FAZEM UMA BOA DUPLA</span>
            <h2>Complete o seu upgrade.</h2>
          </div>
        </div>
        <div className="product-grid">
          {data.products
            .filter((x) => x.id !== id)
            .sort(
              (a, b) =>
                Number(b.category === p.category) -
                Number(a.category === p.category),
            )
            .slice(0, 4)
            .map((x) => (
              <ProductCard key={x.id} product={x} />
            ))}
        </div>
      </section>
    </div>
  );
}
const faq = [
  [
    "Como funciona esta demonstração?",
    "Você pode escolher produtos, concluir uma compra simulada e acompanhar o pedido na conta e no painel. Os dados ficam somente neste navegador. Nenhuma cobrança ou entrega é realizada.",
  ],
  [
    "Como calculo o frete?",
    "Informe um CEP de 8 dígitos no produto, na sacola ou no checkout. Exibimos modalidades e prazos fictícios para demonstrar o fluxo completo.",
  ],
  [
    "Quais são as formas de pagamento?",
    "O checkout demonstra Pix, cartão e boleto. Não informe dados bancários reais: o pagamento é simulado e não se conecta a um provedor.",
  ],
  [
    "Posso trocar ou cancelar um pedido?",
    "Na área Minha conta, você pode cancelar um pedido antes do envio. Após o envio, a solicitação de atendimento pode ser registrada de forma simulada no contato.",
  ],
  [
    "Como falar com a Latina Informática?",
    "Use o WhatsApp (51) 92006-6826 ou o Instagram @latinainformatica para consultar produtos e assistência técnica. O formulário desta prévia apenas simula o atendimento.",
  ],
];
function InfoPage({ path }: { path: string }) {
  const { notify, data } = useStore();
  if (path === "/sobre")
    return (
      <div className="about-page">
        <div className="container about-hero">
          <span className="eyebrow">OLÁ. SOMOS A {data.settings.name}.</span>
          <h1>
            Tecnologia perto
            <br />
            de <em>você.</em>
          </h1>
          <p>
            A Latina Informática atende em Canudos, Novo Hamburgo/RS, com
            equipamentos, acessórios e assistência técnica para a sua rotina.
          </p>
          <a href="#/catalogo" className="btn btn-dark">
            Explore o catálogo ilustrativo <ArrowUpRight size={19} />
          </a>
        </div>
        <div className="container about-values">
          {[
            [
              "01",
              "Equipamentos e acessórios.",
              "Consulte a loja sobre notebooks, armazenamento, componentes, periféricos e acessórios disponíveis.",
            ],
            [
              "02",
              "Assistência técnica.",
              "Atendimento para computadores, notebooks, celulares, TVs e impressoras, além de formatação, redes e CFTV.",
            ],
            [
              "03",
              "Em Novo Hamburgo.",
              "Rua Bartolomeu de Gusmão, 645, Sala 04, no bairro Canudos. Fale com a equipe para consultar produtos e serviços.",
            ],
          ].map(([n, t, d]) => (
            <div key={n}>
              <span className="eyebrow">{n}</span>
              <h2>{t}</h2>
              <p>{d}</p>
            </div>
          ))}
        </div>
        <div className="container company-details">
          <p>
            <strong>{company.legalName}</strong> · CNPJ {company.cnpj}
          </p>
          <p>
            {company.address} · CEP {company.cep}
          </p>
          <div className="company-links">
            <a
              href={company.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="btn btn-dark"
            >
              Falar no WhatsApp <ArrowUpRight size={17} />
            </a>
            <a
              href={company.maps}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Ver no mapa <MapPin size={17} />
            </a>
          </div>
        </div>
        <p className="container demo-note">
          Esta é uma proposta de loja virtual para a Latina Informática.
          Produtos, preços, estoques, avaliações e pedidos são fictícios;
          nenhuma compra é realizada nesta prévia.
        </p>
      </div>
    );
  if (path === "/ajuda")
    return (
      <div className="container info-page">
        <span className="eyebrow">A GENTE DESCOMPLICA</span>
        <h1>Como podemos ajudar?</h1>
        <div className="help-links">
          <a href="#/conta/pedidos">
            <Package /> Acompanhar pedido <ArrowUpRight size={17} />
          </a>
          <a href="#/politica/trocas">
            <RefreshCw /> Trocas e devoluções <ArrowUpRight size={17} />
          </a>
          <a href="#/contato">
            <Headphones /> Falar com a loja <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="faq-list">
          {faq.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={18} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    );
  if (path === "/contato")
    return (
      <div className="container info-page">
        <span className="eyebrow">VAMOS CONVERSAR</span>
        <h1>
          Uma boa experiência
          <br />
          começa com uma conversa.
        </h1>
        <div className="contact-grid">
          <div>
            <h3>Atendimento {data.settings.name}</h3>
            <p className="muted">
              Consulte os horários diretamente com a equipe.
            </p>
            {data.settings.email && (
              <p>
                <a href={`mailto:${data.settings.email}`}>
                  <Mail size={17} /> {data.settings.email}
                </a>
              </p>
            )}
            <p>
              <a
                href={company.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="contact-link"
              >
                <Headphones size={17} /> WhatsApp {data.settings.phone}{" "}
                <ArrowUpRight size={15} />
              </a>
            </p>
            <p>
              <a
                href={company.instagram}
                target="_blank"
                rel="noreferrer"
                className="contact-link"
              >
                <Instagram size={17} /> {company.instagramHandle}{" "}
                <ArrowUpRight size={15} />
              </a>
            </p>
            <p>
              <a
                href={company.maps}
                target="_blank"
                rel="noreferrer"
                className="contact-link"
              >
                <MapPin size={17} /> {company.address} · CEP {company.cep}
              </a>
            </p>
            <p className="muted">
              {company.legalName} · CNPJ {company.cnpj}
            </p>
            <div className="demo-note">
              Os links acima abrem os canais da empresa. O formulário ao lado
              apenas demonstra o atendimento; nenhuma mensagem é enviada
              automaticamente.
            </div>
          </div>
          <form
            className="panel"
            onSubmit={(e) => {
              e.preventDefault();
              notify(
                "Fluxo de atendimento demonstrado. Nenhuma mensagem foi enviada.",
              );
              e.currentTarget.reset();
            }}
          >
            <label className="form-field">
              Seu nome
              <input required name="name" minLength={2} autoComplete="name" />
            </label>
            <label className="form-field">
              E-mail
              <input required type="email" name="email" autoComplete="email" />
            </label>
            <label className="form-field">
              Assunto
              <select name="subject">
                <option>Dúvida sobre um produto</option>
                <option>Assistência técnica</option>
                <option>Meu pedido</option>
                <option>Troca ou devolução</option>
                <option>Outro assunto</option>
              </select>
            </label>
            <label className="form-field">
              Mensagem
              <textarea required name="message" rows={4} minLength={10} />
            </label>
            <button className="btn btn-dark">
              Simular envio da solicitação <ArrowRight size={17} />
            </button>
          </form>
        </div>
      </div>
    );
  if (path.startsWith("/politica/")) {
    const key = path.split("/")[2];
    const pages: Record<string, { title: string; paragraphs: string[] }> = {
      privacidade: {
        title: "Privacidade, com clareza.",
        paragraphs: [
          "Esta demonstração armazena catálogo, favoritos, carrinho, perfis e pedidos fictícios no armazenamento local do seu navegador. Não há banco de dados remoto nem integração com pagamentos ou transportadoras.",
          "Use somente informações fictícias. Dados inseridos neste navegador podem ser visualizados pelo painel de demonstração, que tem acesso livre.",
          "Ao usar outro navegador ou limpar os dados deste site, as alterações não estarão disponíveis. Fontes podem ser carregadas do Google Fonts; não incluímos ferramentas de análise ou publicidade.",
          "Antes de operar uma loja real, substitua esta página por uma política adequada ao negócio e implemente os controles de privacidade necessários.",
        ],
      },
      trocas: {
        title: "Cada escolha merece cuidado.",
        paragraphs: [
          "Esta página apresenta o espaço para a política de trocas e devoluções da loja. Não existem vendas, remessas ou devoluções reais nesta demonstração.",
          "Pedidos simulados podem ser cancelados antes do envio pela área Minha conta. A quantidade do produto retorna ao estoque de demonstração.",
          "Para simular uma solicitação após o envio, use o formulário de contato e selecione Troca ou devolução. Nenhum atendimento externo é acionado.",
          "Ao personalizar esta base para uma loja real, configure condições, prazos, canais de atendimento e processo de logística reversa conforme o negócio.",
        ],
      },
      entrega: {
        title: "Seu upgrade, a caminho.",
        paragraphs: [
          "O cálculo de frete desta demonstração utiliza regras locais, sem consultar transportadoras. Não é uma cotação real.",
          "Entrega padrão: 5 a 8 dias úteis por R$ 19,90, com gratuidade a partir do valor configurado pela loja. Entrega expressa: 2 a 3 dias úteis por R$ 34,90.",
          "O checkout exige um CEP de 8 dígitos e endereço completo fictício. O rastreamento representa a evolução do status no painel administrativo.",
          "Em uma loja real, esses campos devem ser conectados à operação de expedição e às transportadoras.",
        ],
      },
      termos: {
        title: "Uma demonstração para explorar.",
        paragraphs: [
          "Este é um protótipo de loja virtual para a Latina Informática Ltda., CNPJ 08.365.152/0001-08. A empresa é real; o catálogo, fotos de produtos, descrições, preços, estoques, avaliações e pedidos desta apresentação são ilustrativos.",
          "As compras são simulações sem cobrança, emissão fiscal, reserva de estoque real ou entrega. Não informe senhas, documentos ou dados bancários reais.",
          "O painel administrativo é aberto nesta demonstração para permitir explorar o fluxo completo. Uma loja operacional precisa de autenticação e autorização no servidor.",
          "Cada clone tem sua configuração e seus dados de demonstração independentes. Esta base não oferece hospedagem de várias lojas em uma única conta.",
        ],
      },
    };
    const page = pages[key];
    if (!page) return <NotFound />;
    return (
      <div className="container info-page policy-page">
        <span className="eyebrow">INFORMAÇÃO SEM COMPLICAÇÃO</span>
        <h1>{page.title}</h1>
        <span className="pill">Conteúdo de demonstração</span>
        {page.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <a className="text-link" href="#/ajuda">
          Central de ajuda <ArrowUpRight size={17} />
        </a>
      </div>
    );
  }
  return <NotFound />;
}
function NotFound() {
  return (
    <div className="container empty-state">
      <span className="eyebrow">404</span>
      <h1>Essa página saiu da coleção.</h1>
      <p>Vamos encontrar outra boa escolha?</p>
      <a href="#/catalogo" className="btn btn-dark">
        Explorar a loja <ArrowRight size={17} />
      </a>
    </div>
  );
}
function Footer() {
  const { data, notify } = useStore();
  return (
    <>
      <section className="newsletter">
        <div className="container newsletter-inner">
          <div>
            <span className="eyebrow">FIQUE POR DENTRO</span>
            <h2>Seu próximo upgrade começa aqui.</h2>
            <p>Novidades, boas escolhas e um pouco de inspiração.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              notify(
                "Inscrição demonstrada! Nenhum e-mail foi enviado ou cadastrado em um serviço externo.",
              );
              e.currentTarget.reset();
            }}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Seu e-mail
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Seu melhor e-mail"
            />
            <button aria-label="Inscrever e-mail">
              <ArrowRight size={23} />
            </button>
            <small>Cadastro ilustrativo · sem envio de mensagens.</small>
          </form>
        </div>
      </section>
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>
              {data.settings.tagline}
              <br />
              Informática e assistência técnica em Novo Hamburgo.
            </p>
            <a
              href={company.instagram}
              target="_blank"
              rel="noreferrer"
              className="footer-social"
              aria-label="Instagram da Latina Informática"
            >
              <Instagram size={20} />
            </a>
          </div>
          <div>
            <h3>Explore</h3>
            <a href="#/catalogo">Todos os produtos</a>
            {data.categories.map((c) => (
              <a key={c.id} href={`#/catalogo?categoria=${c.id}`}>
                {c.name}
              </a>
            ))}
          </div>
          <div>
            <h3>Podemos ajudar?</h3>
            <a href="#/ajuda">Central de ajuda</a>
            <a href="#/conta/pedidos">Meus pedidos</a>
            <a href="#/politica/entrega">Entrega e frete</a>
            <a href="#/politica/trocas">Trocas e devoluções</a>
            <a href="#/contato">Fale com a gente</a>
            <a href={company.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp {data.settings.phone} <ArrowUpRight size={13} />
            </a>
          </div>
          <div>
            <h3>Sobre a {data.settings.name}</h3>
            <a href="#/sobre">A empresa</a>
            <a href="#/politica/privacidade">Privacidade</a>
            <a href="#/politica/termos">Termos de uso</a>
            <a href="#/admin">
              Painel da demonstração <ArrowUpRight size={13} />
            </a>
            <div className="payment-methods">
              <span>PIX</span>
              <span>VISA</span>
              <span>mastercard</span>
              <span>boleto</span>
            </div>
          </div>
        </div>
        <div className="container footer-company">
          <strong>
            {company.legalName} · CNPJ {company.cnpj}
          </strong>
          <a href={company.maps} target="_blank" rel="noreferrer">
            {company.address} · CEP {company.cep} <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} {data.settings.name}. Protótipo para
            apresentação.
          </span>
          <span>
            <ShieldCheck size={14} /> Catálogo fictício. Nenhuma compra real.
          </span>
        </div>
      </footer>
    </>
  );
}
