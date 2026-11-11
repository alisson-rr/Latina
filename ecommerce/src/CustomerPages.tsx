import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Heart,
  MapPin,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useStore } from "./context";
import {
  cartError,
  cartSubtotal,
  discountAmount,
  money,
  resolveCheckoutCustomer,
  shippingOptions,
  validateAddress,
} from "./domain";
import type { Address, Customer, Order } from "./types";
import "./customer.css";

const go = (path: string) => {
  window.location.hash = path;
};
const id = () => crypto.randomUUID();
const date = (value: string) =>
  new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const emptyAddress = (): Address => ({
  id: id(),
  label: "Casa",
  recipient: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
});
const cancellable = (status: Order["status"]) =>
  ["Pagamento pendente", "Confirmado", "Em preparação"].includes(status);

function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-heading customer-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {description && <p className="muted">{description}</p>}
    </div>
  );
}
function Empty({
  title,
  text,
  link = "/catalogo",
  label = "Explorar produtos",
  icon = "bag",
}: {
  title: string;
  text: string;
  link?: string;
  label?: string;
  icon?: "bag" | "heart" | "package";
}) {
  const Icon =
    icon === "heart" ? Heart : icon === "package" ? Package : ShoppingBag;
  return (
    <div className="empty-state customer-empty">
      <Icon size={40} strokeWidth={1.3} />
      <h2>{title}</h2>
      <p className="muted">{text}</p>
      <a href={`#${link}`} className="btn btn-primary">
        {label}
        <ArrowRight size={17} />
      </a>
    </div>
  );
}
function DemoNote({ children }: { children?: React.ReactNode }) {
  return (
    <div className="customer-demo">
      <ShieldCheck size={18} />
      <span>
        {children ??
          "Ambiente de demonstração. Nenhuma compra, cobrança ou entrega real será realizada."}
      </span>
    </div>
  );
}
function CartPage() {
  const { data, cart, setCart, couponCode, setCouponCode, notify } = useStore();
  const [coupon, setCoupon] = useState(couponCode);
  const [couponError, setCouponError] = useState("");
  const [cep, setCep] = useState("");
  const [estimated, setEstimated] = useState(false);
  const subtotal = cartSubtotal(cart, data.products);
  const validCoupon = data.coupons.find(
    (c) => c.active && c.code.toUpperCase() === couponCode,
  );
  const discount = discountAmount(subtotal, validCoupon);
  const threshold = data.settings.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const shipping = estimated ? shippingOptions(cep, subtotal, threshold) : [];
  const error = cartError(cart, data.products);
  function applyCoupon(e: FormEvent) {
    e.preventDefault();
    const code = coupon.trim().toUpperCase();
    if (!data.coupons.some((c) => c.active && c.code.toUpperCase() === code)) {
      setCouponError(
        "Cupom não encontrado ou inativo. Experimente BEMVINDO10.",
      );
      return;
    }
    setCouponCode(code);
    setCouponError("");
    notify("Cupom aplicado ao carrinho.");
  }
  function quantity(index: number, delta: number) {
    const line = cart[index];
    const p = data.products.find((p) => p.id === line.productId);
    if (
      delta > 0 &&
      (!p ||
        cart
          .filter((i) => i.productId === p.id)
          .reduce((s, i) => s + i.quantity, 0) >= p.stock)
    ) {
      notify("Você chegou ao estoque disponível deste produto.");
      return;
    }
    setCart((items) =>
      items.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  }
  return (
    <div className="container customer-page">
      <a className="text-link customer-back" href="#/catalogo">
        <ArrowLeft size={15} /> Continuar comprando
      </a>
      <Heading
        eyebrow="Sua seleção"
        title="Seu carrinho"
        description={`${cart.reduce((s, i) => s + i.quantity, 0)} ${cart.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "itens"}, muitas possibilidades.`}
      />
      {!cart.length ? (
        <Empty
          title="Seu próximo favorito está por aqui."
          text="Explore a coleção e encontre o que combina com a sua rotina."
        />
      ) : (
        <div className="customer-cart-layout">
          <section>
            <div className="customer-shipping-progress">
              <Truck size={20} />
              <div>
                <strong>
                  {remaining
                    ? `Faltam ${money(remaining)} para frete grátis`
                    : "Você desbloqueou o frete grátis!"}
                </strong>
                <span>Na entrega padrão desta demonstração</span>
                <div className="customer-progress">
                  <i
                    style={{
                      width: `${Math.min(100, (subtotal / Math.max(1, threshold)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="customer-cart-items">
              {cart.map((item, index) => {
                const product = data.products.find(
                  (p) => p.id === item.productId,
                );
                return (
                  <article
                    className="customer-cart-item"
                    key={`${item.productId}-${item.variant}-${index}`}
                  >
                    <a
                      href={`#/produto/${item.productId}`}
                      className="customer-cart-image"
                    >
                      {product && (
                        <img src={product.image} alt={product.name} />
                      )}
                    </a>
                    <div className="customer-cart-item-info">
                      <span className="eyebrow">
                        {data.categories.find((c) => c.id === product?.category)
                          ?.name ?? "Indisponível"}
                      </span>
                      <a href={`#/produto/${item.productId}`}>
                        <h3>{product?.name ?? "Produto indisponível"}</h3>
                      </a>
                      <p className="muted">Cor: {item.variant}</p>
                      <strong className="price">
                        {money(product?.price ?? 0)}
                      </strong>
                      <div className="customer-item-controls">
                        <div className="customer-quantity">
                          <button
                            onClick={() => quantity(index, -1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Diminuir quantidade de ${product?.name ?? "produto"}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => quantity(index, 1)}
                            aria-label={`Aumentar quantidade de ${product?.name ?? "produto"}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          className="customer-remove"
                          onClick={() => {
                            setCart((items) =>
                              items.filter((_, i) => i !== index),
                            );
                            notify("Produto removido do carrinho.");
                          }}
                          aria-label={`Remover ${product?.name ?? "produto"}`}
                        >
                          <Trash2 size={16} /> Remover
                        </button>
                      </div>
                    </div>
                    <strong className="customer-line-total">
                      {money((product?.price ?? 0) * item.quantity)}
                    </strong>
                  </article>
                );
              })}
            </div>
            <a href="#/catalogo" className="text-link customer-continue">
              <ArrowLeft size={16} /> Encontrar mais favoritos
            </a>
          </section>
          <aside className="panel customer-summary">
            <h2>Resumo do pedido</h2>
            <div className="customer-summary-row">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            {discount > 0 && (
              <div className="customer-summary-row customer-discount">
                <span>Desconto ({couponCode})</span>
                <strong>− {money(discount)}</strong>
              </div>
            )}
            <div className="customer-summary-row">
              <span>Entrega</span>
              <span>
                {shipping[0]
                  ? money(shipping[0].price)
                  : "Calculada no checkout"}
              </span>
            </div>
            <form className="customer-coupon" onSubmit={applyCoupon}>
              <label htmlFor="cart-coupon">Tem um cupom?</label>
              <div>
                <input
                  id="cart-coupon"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="BEMVINDO10"
                />
                <button className="btn btn-secondary btn-small">Aplicar</button>
              </div>
              {couponError && (
                <p className="customer-error" role="alert">
                  {couponError}
                </p>
              )}
              {validCoupon && (
                <p className="customer-success">
                  <Check size={14} /> {validCoupon.percent}% de desconto
                  aplicado{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setCouponCode("");
                      setCoupon("");
                    }}
                  >
                    Remover
                  </button>
                </p>
              )}
            </form>
            <form
              className="customer-cep"
              onSubmit={(e) => {
                e.preventDefault();
                setEstimated(true);
              }}
            >
              <label htmlFor="cart-cep">Simular entrega</label>
              <div>
                <input
                  id="cart-cep"
                  inputMode="numeric"
                  pattern="[0-9]{5}-?[0-9]{3}"
                  required
                  value={cep}
                  onChange={(e) => {
                    setCep(e.target.value);
                    setEstimated(false);
                  }}
                  placeholder="00000-000"
                  aria-label="CEP para simular entrega"
                />
                <button className="text-link">Calcular</button>
              </div>
              {shipping[0] && (
                <p className="customer-success">
                  Padrão: {shipping[0].days} ·{" "}
                  {shipping[0].price ? money(shipping[0].price) : "Grátis"}
                </p>
              )}
            </form>
            <div className="customer-summary-total">
              <span>Total estimado</span>
              <strong>
                {money(subtotal - discount + (shipping[0]?.price ?? 0))}
              </strong>
            </div>
            {error && (
              <p className="customer-error" role="alert">
                {error}
              </p>
            )}
            <a
              className={`btn btn-primary customer-full ${error ? "customer-disabled" : ""}`}
              href={error ? undefined : "#/checkout"}
              aria-disabled={!!error}
            >
              Ir para o checkout
              <ArrowRight size={17} />
            </a>
            <p className="customer-checkout-safe">
              <ShieldCheck size={14} /> Checkout demonstrativo, sem cobrança
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function AddressFields({
  address,
  onChange,
}: {
  address: Address;
  onChange: (a: Address) => void;
}) {
  const field = (
    name: keyof Address,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label className={`form-field customer-field-${name}`}>
      {label}
      <input
        value={address[name]}
        onChange={(e) =>
          onChange({
            ...address,
            [name]:
              name === "state" ? e.target.value.toUpperCase() : e.target.value,
          })
        }
        required={name !== "complement" && name !== "label"}
        {...props}
      />
    </label>
  );
  return (
    <div className="customer-address-fields">
      {field("recipient", "Nome de quem recebe", {
        autoComplete: "shipping name",
        minLength: 3,
      })}
      {field("cep", "CEP", {
        inputMode: "numeric",
        pattern: "[0-9]{5}-?[0-9]{3}",
        placeholder: "00000-000",
        autoComplete: "shipping postal-code",
      })}
      {field("street", "Rua / Avenida", {
        autoComplete: "shipping address-line1",
        minLength: 3,
      })}
      {field("number", "Número", { autoComplete: "off" })}
      {field("complement", "Complemento (opcional)", {
        autoComplete: "shipping address-line2",
      })}
      {field("district", "Bairro", { minLength: 2 })}
      {field("city", "Cidade", {
        autoComplete: "shipping address-level2",
        minLength: 2,
      })}
      {field("state", "UF", {
        maxLength: 2,
        pattern: "[A-Za-z]{2}",
        placeholder: "SP",
        autoComplete: "shipping address-level1",
      })}
    </div>
  );
}
function CheckoutPage() {
  const {
    data,
    setData,
    cart,
    setCart,
    couponCode,
    setCouponCode,
    customer,
    setCustomerId,
    notify,
  } = useStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [address, setAddress] = useState<Address>(
    customer?.addresses[0] ?? emptyAddress(),
  );
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState<Order["payment"]>("Pix");
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone);
      if (customer.addresses[0]) setAddress(customer.addresses[0]);
    }
  }, [customer?.id]);
  const subtotal = cartSubtotal(cart, data.products);
  const coupon = data.coupons.find(
    (c) => c.active && c.code.toUpperCase() === couponCode,
  );
  const discount = discountAmount(subtotal, coupon);
  const options = shippingOptions(
    address.cep,
    subtotal,
    data.settings.freeShippingThreshold,
  );
  const selected = options.find((o) => o.id === delivery);
  const total = subtotal - discount + (selected?.price ?? 0);
  const validContact = () =>
    name.trim().length >= 3 &&
    /^\S+@\S+\.\S+$/.test(email.trim()) &&
    phone.replace(/\D/g, "").length >= 10;
  const identity = resolveCheckoutCustomer(data.customers, customer, email);
  function next(e: FormEvent) {
    e.preventDefault();
    if (step === 1 && (!validateAddress(address) || !validContact())) {
      setError("Confira nome, e-mail, telefone e todos os dados do endereço.");
      return;
    }
    if (step === 1 && identity.conflict) {
      setError("Este e-mail pertence a outro perfil de teste. Use outro e-mail.");
      return;
    }
    if (step === 2 && !selected) {
      setError("Selecione uma opção de entrega.");
      return;
    }
    setError("");
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function finish(e: FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    const stockError = cartError(cart, data.products);
    if (stockError) {
      setError(stockError);
      return;
    }
    if (!validContact()) {
      setError("Confira nome, e-mail e telefone antes de concluir.");
      setStep(1);
      return;
    }
    if (identity.conflict) {
      setError("Este e-mail pertence a outro perfil de teste. Use outro e-mail.");
      setStep(1);
      return;
    }
    if (!validateAddress(address) || !selected || !accepted) {
      setError("Revise o endereço, a entrega e a confirmação da demonstração.");
      return;
    }
    if (
      ![
        subtotal,
        discount,
        selected.price,
        total,
        ...cart.map(
          (item) => data.products.find((p) => p.id === item.productId)!.price,
        ),
      ].every((value) => Number.isSafeInteger(value) && value >= 0) ||
      discount > subtotal
    ) {
      setError(
        "Os valores deste pedido precisam ser revisados. Volte ao carrinho.",
      );
      return;
    }
    submitting.current = true;
    const checkoutCustomer = identity.customer;
    const customerId = checkoutCustomer?.id ?? id();
    const finalAddress = {
      ...address,
      recipient: address.recipient.trim(),
      cep: address.cep.replace(/\D/g, ""),
    };
    const order: Order = {
      id: `PED-${Date.now().toString().slice(-8)}`,
      customerId,
      customerName: name.trim(),
      email: email.trim(),
      createdAt: new Date().toISOString(),
      items: cart.map((item) => {
        const p = data.products.find((p) => p.id === item.productId)!;
        return {
          productId: p.id,
          name: p.name,
          image: p.image,
          variant: item.variant,
          quantity: item.quantity,
          price: p.price,
        };
      }),
      subtotal,
      discount,
      shipping: selected.price,
      total,
      payment,
      status: payment === "Cartão" ? "Confirmado" : "Pagamento pendente",
      address: finalAddress,
      delivery: `${selected.name} · ${selected.days}`,
      ...(coupon ? { coupon: coupon.code } : {}),
    };
    const profile: Customer = {
      id: customerId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      addresses: checkoutCustomer?.addresses.some((a) => a.id === finalAddress.id)
        ? checkoutCustomer.addresses.map((a) =>
            a.id === finalAddress.id ? finalAddress : a,
          )
        : [...(checkoutCustomer?.addresses ?? []), finalAddress],
    };
    setData((current) => ({
      ...current,
      products: current.products.map((p) => ({
        ...p,
        stock:
          p.stock -
          cart
            .filter((i) => i.productId === p.id)
            .reduce((s, i) => s + i.quantity, 0),
      })),
      customers: current.customers.some((c) => c.id === customerId)
        ? current.customers.map((c) => (c.id === customerId ? profile : c))
        : [...current.customers, profile],
      orders: [order, ...current.orders],
    }));
    setCustomerId(customerId);
    setCart([]);
    setCouponCode("");
    notify("Pedido de demonstração criado. Nenhuma cobrança foi realizada.");
    go(`/pedido/${order.id}`);
  }
  if (!cart.length)
    return (
      <div className="container customer-page">
        <Heading eyebrow="Checkout" title="Vamos escolher algo primeiro?" />
        <Empty
          title="Seu carrinho está vazio."
          text="Adicione um produto para experimentar todas as etapas da compra."
        />
      </div>
    );
  return (
    <div className="container customer-page checkout-page">
      <a className="text-link customer-back" href="#/carrinho">
        <ArrowLeft size={15} /> Voltar ao carrinho
      </a>
      <div className="checkout-title">
        <Heading eyebrow="Quase seu" title="O próximo passo é simples." />
        <span className="checkout-lock">
          <ShieldCheck size={18} /> Compra simulada
        </span>
      </div>
      <ol className="checkout-steps">
        {["Seus dados", "Entrega", "Pagamento"].map((label, i) => (
          <li
            key={label}
            className={
              step === i + 1 ? "current" : step > i + 1 ? "complete" : ""
            }
          >
            <button
              onClick={() => {
                if (i + 1 < step) {
                  setStep(i + 1);
                  setError("");
                }
              }}
              disabled={i + 1 >= step}
            >
              <span>{step > i + 1 ? <Check size={15} /> : i + 1}</span>
              {label}
            </button>
          </li>
        ))}
      </ol>
      <DemoNote />
      <div className="checkout-layout">
        <section className="panel checkout-form">
          <form onSubmit={step === 3 ? finish : next}>
            {step === 1 && (
              <>
                <div className="checkout-section-heading">
                  <span>01</span>
                  <div>
                    <h2>Para quem é o pedido?</h2>
                    <p className="muted">
                      Use dados fictícios para experimentar a loja.
                    </p>
                  </div>
                </div>
                {!customer && (
                  <button
                    type="button"
                    className="btn btn-secondary checkout-demo-login"
                    onClick={() => {
                      setCustomerId("demo");
                      notify("Perfil de demonstração Alex selecionado.");
                    }}
                  >
                    Preencher com o perfil Alex <ArrowRight size={16} />
                  </button>
                )}
                <div className="customer-fields">
                  <label className="form-field">
                    Nome completo
                    <input
                      required
                      minLength={3}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      placeholder="Alex Silva"
                    />
                  </label>
                  <label className="form-field">
                    E-mail de demonstração
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="alex@exemplo.com"
                    />
                  </label>
                  <label className="form-field">
                    Telefone
                    <input
                      required
                      inputMode="tel"
                      minLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      placeholder="(11) 99999-0000"
                    />
                  </label>
                </div>
                <h3 className="checkout-address-title">
                  <MapPin size={18} /> Onde vamos entregar?
                </h3>
                {customer && customer.addresses.length > 0 && (
                  <div className="customer-saved-addresses">
                    {customer.addresses.map((a) => (
                      <button
                        type="button"
                        key={a.id}
                        className={address.id === a.id ? "selected" : ""}
                        onClick={() => setAddress(a)}
                      >
                        {a.label} · {a.street}, {a.number}
                        <Check size={14} />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setAddress({ ...emptyAddress(), recipient: name })
                      }
                    >
                      <Plus size={14} /> Outro endereço
                    </button>
                  </div>
                )}
                <AddressFields address={address} onChange={setAddress} />
              </>
            )}
            {step === 2 && (
              <>
                <div className="checkout-section-heading">
                  <span>02</span>
                  <div>
                    <h2>Como prefere receber?</h2>
                    <p className="muted">
                      Prazos e valores fictícios para este CEP.
                    </p>
                  </div>
                </div>
                <div className="checkout-address-preview">
                  <MapPin size={19} />
                  <div>
                    <strong>{address.recipient}</strong>
                    <p>
                      {address.street}, {address.number}{" "}
                      {address.complement && `· ${address.complement}`}
                      <br />
                      {address.district} · {address.city}/{address.state} ·{" "}
                      {address.cep}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setStep(1)}
                  >
                    Editar
                  </button>
                </div>
                <div className="checkout-options">
                  {options.map((o) => (
                    <label
                      key={o.id}
                      className={`checkout-option ${delivery === o.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={o.id}
                        checked={delivery === o.id}
                        onChange={() => setDelivery(o.id)}
                      />
                      <Truck size={24} />
                      <span>
                        <strong>{o.name}</strong>
                        <small>{o.days}</small>
                      </span>
                      <b>{o.price ? money(o.price) : "Grátis"}</b>
                    </label>
                  ))}
                </div>
                <p className="muted customer-small">
                  A contagem de prazo começa após a aprovação do pagamento
                  simulado.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <div className="checkout-section-heading">
                  <span>03</span>
                  <div>
                    <h2>Escolha o pagamento.</h2>
                    <p className="muted">
                      Experimente o fluxo sem informar dados financeiros.
                    </p>
                  </div>
                </div>
                <div className="checkout-options">
                  {(["Pix", "Cartão", "Boleto"] as const).map((method) => (
                    <label
                      key={method}
                      className={`checkout-option ${payment === method ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={payment === method}
                        onChange={() => setPayment(method)}
                      />
                      <CreditCard size={22} />
                      <span>
                        <strong>{method}</strong>
                        <small>
                          {method === "Pix"
                            ? "Aprovação simulada após criar o pedido"
                            : method === "Cartão"
                              ? "Cartão de teste · aprovação automática"
                              : "Boleto fictício · aprovação manual na demonstração"}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="checkout-payment-demo">
                  <ShieldCheck size={22} />
                  <div>
                    <strong>
                      {payment === "Cartão"
                        ? "Cartão de demonstração •••• 4242"
                        : `${payment} de demonstração`}
                    </strong>
                    <p>
                      {payment === "Cartão"
                        ? "Não é necessário preencher número, validade ou código de segurança. O pedido será confirmado sem nenhuma cobrança."
                        : "Ao criar o pedido, você poderá simular a aprovação do pagamento na tela de acompanhamento."}
                    </p>
                  </div>
                </div>
                <label className="checkout-consent">
                  <input
                    type="checkbox"
                    required
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                  <span>
                    Entendo que esta é uma compra fictícia, sem cobrança nem
                    entrega real.
                  </span>
                </label>
                <div className="checkout-review">
                  <strong>Entrega para {name}</strong>
                  <p>
                    {address.street}, {address.number} · {address.city}/
                    {address.state}
                    <br />
                    {selected?.name} · {selected?.days}
                  </p>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setStep(1)}
                  >
                    Revisar dados
                  </button>
                </div>
              </>
            )}
            {error && (
              <p className="customer-error" role="alert">
                {error}
              </p>
            )}
            <div className="checkout-actions">
              {step > 1 && (
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setStep((s) => s - 1);
                    setError("");
                  }}
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
              )}
              <button className="btn btn-primary" type="submit">
                {step === 3 ? "Concluir pedido de teste" : "Continuar"}
                <ArrowRight size={17} />
              </button>
            </div>
          </form>
        </section>
        <aside className="panel customer-summary checkout-summary">
          <h2>
            Seu pedido{" "}
            <span>
              {cart.reduce((s, i) => s + i.quantity, 0)}{" "}
              {cart.reduce((s, i) => s + i.quantity, 0) === 1
                ? "item"
                : "itens"}
            </span>
          </h2>
          <div className="checkout-mini-items">
            {cart.map((item, index) => {
              const p = data.products.find((p) => p.id === item.productId);
              return (
                <div key={index}>
                  <img src={p?.image} alt={p?.name ?? "Produto"} />
                  <span>
                    <strong>{p?.name ?? "Produto indisponível"}</strong>
                    <small>
                      {item.variant} · Quantidade {item.quantity}
                    </small>
                  </span>
                  <b>{money((p?.price ?? 0) * item.quantity)}</b>
                </div>
              );
            })}
          </div>
          <div className="customer-summary-row">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          {discount > 0 && (
            <div className="customer-summary-row customer-discount">
              <span>Cupom {coupon?.code}</span>
              <strong>− {money(discount)}</strong>
            </div>
          )}
          <div className="customer-summary-row">
            <span>Entrega</span>
            <strong>
              {selected
                ? selected.price
                  ? money(selected.price)
                  : "Grátis"
                : "A selecionar"}
            </strong>
          </div>
          <div className="customer-summary-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          <p className="customer-checkout-safe">
            <ShieldCheck size={14} /> Nenhum dado de cartão é solicitado
          </p>
        </aside>
      </div>
    </div>
  );
}

function AccountNav({ active }: { active: string }) {
  const { data, customer, setCustomerId, notify } = useStore();
  return (
    <aside className="customer-account-nav">
      <div className="customer-avatar">{customer?.name.charAt(0) ?? "A"}</div>
      <strong>{customer?.name}</strong>
      <span className="muted">Seu espaço na {data.settings.name}</span>
      <nav>
        {[
          { path: "/conta", text: "Meu perfil", Icon: UserRound },
          { path: "/conta/pedidos", text: "Meus pedidos", Icon: Package },
          { path: "/conta/enderecos", text: "Endereços", Icon: MapPin },
          { path: "/conta/favoritos", text: "Favoritos", Icon: Heart },
        ].map(({ path, text, Icon }) => (
          <a
            key={path}
            href={`#${path}`}
            className={active === path ? "active" : ""}
          >
            <Icon size={18} />
            {text}
            <ArrowRight size={15} />
          </a>
        ))}
      </nav>
      <button
        className="text-link customer-signout"
        onClick={() => {
          setCustomerId(null);
          notify("Você saiu do perfil de demonstração.");
          go("/conta/entrar");
        }}
      >
        Sair da conta
      </button>
    </aside>
  );
}
function AuthPage({ mode }: { mode: "login" | "register" | "recover" }) {
  const { data, setData, setCustomerId, notify } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const register = mode === "register";
  const recover = mode === "recover";
  function submit(e: FormEvent) {
    e.preventDefault();
    if (recover) {
      setSent(true);
      return;
    }
    if (register) {
      if (name.trim().length < 3 || phone.replace(/\D/g, "").length < 10) {
        setError("Informe um nome completo e um telefone válido.");
        return;
      }
      if (
        data.customers.some(
          (c) => c.email.toLowerCase() === email.trim().toLowerCase(),
        )
      ) {
        setError(
          "Este e-mail já tem um perfil de teste. Use a opção de entrar.",
        );
        return;
      }
      const customer: Customer = {
        id: id(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        addresses: [],
      };
      setData((d) => ({ ...d, customers: [...d.customers, customer] }));
      setCustomerId(customer.id);
      notify("Perfil de demonstração criado neste navegador.");
      go("/conta");
      return;
    }
    const profile = data.customers.find(
      (c) => c.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!profile) {
      setError(
        "Nenhum perfil de teste encontrado com este e-mail. Crie um perfil ou entre como Alex.",
      );
      return;
    }
    setCustomerId(profile.id);
    notify("Você entrou no perfil local de demonstração.");
    go("/conta");
  }
  return (
    <div className="container customer-auth-page">
      <div className="customer-auth-story">
        <span className="eyebrow">Seu universo {data.settings.name}</span>
        <h1>
          Boas escolhas.
          <br />
          Novas possibilidades.
        </h1>
        <p>Seus favoritos, pedidos e detalhes em um só lugar.</p>
        <div className="customer-auth-benefits">
          <span>
            <Heart size={20} /> Salve o que combina com você
          </span>
          <span>
            <Package size={20} /> Acompanhe cada pedido
          </span>
          <span>
            <MapPin size={20} /> Simplifique a próxima compra
          </span>
        </div>
        <span className="customer-auth-mark">
          {data.settings.name}
          <span>®</span>
        </span>
      </div>
      <section className="panel customer-auth-panel">
        <a
          className="text-link customer-back"
          href={recover ? "#/conta/entrar" : "#/"}
        >
          <ArrowLeft size={15} />{" "}
          {recover ? "Voltar para entrar" : "Voltar à loja"}
        </a>
        <h2>
          {recover
            ? "Recuperar acesso"
            : register
              ? "Que bom ter você aqui."
              : "Bem-vindo de volta."}
        </h2>
        <p className="muted">
          {recover
            ? "Veja como seria a recuperação de acesso."
            : register
              ? "Crie um perfil fictício para explorar a experiência."
              : "Entre em um perfil de teste salvo neste navegador."}
        </p>
        <DemoNote>
          {recover
            ? "Esta recuperação é simulada. Nenhum e-mail será enviado."
            : "Conta demonstrativa, sem autenticação real. Não use dados pessoais ou senhas."}
        </DemoNote>
        {sent ? (
          <div className="customer-recovery-result">
            <CheckCircle2 size={36} />
            <h3>Fluxo de recuperação demonstrado.</h3>
            <p>
              Numa loja real, um link seguro seria enviado para {email}. Nesta
              prévia não há envio de e-mail ou senha a recuperar.
            </p>
            <a href="#/conta/entrar" className="btn btn-primary">
              Voltar para entrar
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="customer-auth-form">
            {register && (
              <label className="form-field">
                Nome completo
                <input
                  required
                  minLength={3}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Silva"
                  autoComplete="off"
                />
              </label>
            )}
            <label className="form-field">
              E-mail de demonstração
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@exemplo.com"
                autoComplete="off"
              />
            </label>
            {register && (
              <label className="form-field">
                Telefone de demonstração
                <input
                  required
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-0000"
                  autoComplete="off"
                />
              </label>
            )}
            {error && (
              <p className="customer-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn btn-primary customer-full">
              {recover
                ? "Simular recuperação"
                : register
                  ? "Criar perfil de teste"
                  : "Entrar no perfil"}
              <ArrowRight size={17} />
            </button>
          </form>
        )}
        {!recover && (
          <>
            <div className="customer-auth-divider">
              <span>ou experimente agora</span>
            </div>
            <button
              className="btn btn-secondary customer-full"
              onClick={() => {
                setCustomerId("demo");
                notify("Você entrou como Alex, o perfil de demonstração.");
                go("/conta");
              }}
            >
              <UserRound size={18} /> Entrar como Alex
            </button>
            <p className="customer-auth-switch">
              {register ? "Já tem um perfil?" : "Primeira vez por aqui?"}{" "}
              <a
                className="text-link"
                href={register ? "#/conta/entrar" : "#/conta/cadastro"}
              >
                {register ? "Entrar" : "Criar perfil"}
              </a>
            </p>
            {!register && (
              <a
                href="#/conta/recuperar"
                className="text-link customer-recover-link"
              >
                Como funciona recuperar o acesso?
              </a>
            )}
          </>
        )}
      </section>
    </div>
  );
}
function ProfilePage() {
  const { customer, data, setData, notify } = useStore();
  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [error, setError] = useState("");
  if (!customer) return null;
  function save(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 3 || phone.replace(/\D/g, "").length < 10) {
      setError("Confira seu nome e telefone.");
      return;
    }
    if (
      data.customers.some(
        (c) =>
          c.id !== customer!.id &&
          c.email.toLowerCase() === email.trim().toLowerCase(),
      )
    ) {
      setError("Este e-mail pertence a outro perfil de teste.");
      return;
    }
    setData((d) => ({
      ...d,
      customers: d.customers.map((c) =>
        c.id === customer!.id
          ? {
              ...c,
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
            }
          : c,
      ),
    }));
    setError("");
    notify("Perfil atualizado neste navegador.");
  }
  return (
    <>
      <div className="customer-content-heading">
        <h2>Meu perfil</h2>
        <p className="muted">Tudo do seu jeito, até nos detalhes.</p>
      </div>
      <div className="customer-account-stats">
        <a href="#/conta/pedidos">
          <Package size={22} />
          <strong>
            {data.orders.filter((o) => o.customerId === customer.id).length}
          </strong>
          <span>Pedidos</span>
          <ArrowRight size={17} />
        </a>
        <a href="#/conta/enderecos">
          <MapPin size={22} />
          <strong>{customer.addresses.length}</strong>
          <span>Endereços salvos</span>
          <ArrowRight size={17} />
        </a>
      </div>
      <form className="panel customer-profile-form" onSubmit={save}>
        <h3>Informações pessoais</h3>
        <div className="customer-fields">
          <label className="form-field">
            Nome completo
            <input
              required
              minLength={3}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="form-field">
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="form-field">
            Telefone
            <input
              required
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
        </div>
        {error && (
          <p className="customer-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-dark">
          Salvar alterações
          <Check size={16} />
        </button>
      </form>
      <DemoNote>
        Seus dados são locais e fictícios. A demonstração não tem senha,
        verificação de e-mail ou autenticação segura.
      </DemoNote>
    </>
  );
}
function AddressesPage() {
  const { customer, setData, notify } = useStore();
  const [editing, setEditing] = useState<Address | null>(null);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  if (!customer) return null;
  function save(e: FormEvent) {
    e.preventDefault();
    if (!editing || !validateAddress(editing)) {
      setError(
        "Revise o endereço: preencha os campos obrigatórios, CEP com 8 dígitos e uma UF brasileira válida.",
      );
      return;
    }
    const a = { ...editing, cep: editing.cep.replace(/\D/g, "") };
    setData((d) => ({
      ...d,
      customers: d.customers.map((c) =>
        c.id === customer!.id
          ? {
              ...c,
              addresses: c.addresses.some((x) => x.id === a.id)
                ? c.addresses.map((x) => (x.id === a.id ? a : x))
                : [...c.addresses, a],
            }
          : c,
      ),
    }));
    setEditing(null);
    setError("");
    notify("Endereço salvo.");
  }
  function remove(addressId: string) {
    setData((d) => ({
      ...d,
      customers: d.customers.map((c) =>
        c.id === customer!.id
          ? { ...c, addresses: c.addresses.filter((a) => a.id !== addressId) }
          : c,
      ),
    }));
    setRemoving(null);
    notify("Endereço removido.");
  }
  return (
    <>
      <div className="customer-content-heading customer-heading-action">
        <div>
          <h2>Meus endereços</h2>
          <p className="muted">
            Seus lugares favoritos para receber novidades.
          </p>
        </div>
        <button
          className="btn btn-dark btn-small"
          onClick={() => {
            setEditing({ ...emptyAddress(), recipient: customer.name });
            setError("");
          }}
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>
      {editing ? (
        <form className="panel customer-address-form" onSubmit={save}>
          <div className="customer-heading-action">
            <h3>
              {customer.addresses.some((a) => a.id === editing.id)
                ? "Editar endereço"
                : "Novo endereço"}
            </h3>
            <button
              type="button"
              className="customer-icon-button"
              aria-label="Fechar edição de endereço"
              onClick={() => setEditing(null)}
            >
              <X size={20} />
            </button>
          </div>
          <label className="form-field customer-address-label">
            Apelido do endereço
            <input
              value={editing.label}
              onChange={(e) =>
                setEditing({ ...editing, label: e.target.value })
              }
              placeholder="Casa, trabalho…"
              required
            />
          </label>
          <AddressFields address={editing} onChange={setEditing} />
          {error && (
            <p className="customer-error" role="alert">
              {error}
            </p>
          )}
          <div className="customer-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditing(null)}
            >
              Cancelar
            </button>
            <button className="btn btn-primary">
              Salvar endereço
              <Check size={16} />
            </button>
          </div>
        </form>
      ) : customer.addresses.length ? (
        <div className="customer-address-grid">
          {customer.addresses.map((a) => (
            <article className="panel customer-address-card" key={a.id}>
              <MapPin size={23} />
              <h3>{a.label}</h3>
              <strong>{a.recipient}</strong>
              <p>
                {a.street}, {a.number}
                {a.complement && ` · ${a.complement}`}
                <br />
                {a.district}
                <br />
                {a.city}/{a.state} · {a.cep}
              </p>
              {removing === a.id ? (
                <div className="customer-address-confirm">
                  <p>Excluir este endereço?</p>
                  <button className="text-link" onClick={() => remove(a.id)}>
                    Sim, excluir
                  </button>
                  <button
                    className="text-link"
                    onClick={() => setRemoving(null)}
                  >
                    Manter
                  </button>
                </div>
              ) : (
                <div className="customer-address-card-actions">
                  <button
                    className="text-link"
                    onClick={() => {
                      setEditing(a);
                      setError("");
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="customer-remove"
                    onClick={() => setRemoving(a.id)}
                  >
                    <Trash2 size={15} /> Excluir
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state customer-empty">
          <MapPin size={36} />
          <h3>Nenhum endereço salvo.</h3>
          <p className="muted">
            Adicione um endereço fictício para testar a próxima compra.
          </p>
          <button
            className="btn btn-primary"
            onClick={() =>
              setEditing({ ...emptyAddress(), recipient: customer.name })
            }
          >
            <Plus size={16} /> Adicionar endereço
          </button>
        </div>
      )}
    </>
  );
}
function FavoritesPage() {
  const { data, favorites, toggleFavorite, addToCart } = useStore();
  const products = data.products.filter((p) => favorites.includes(p.id));
  return (
    <>
      <div className="customer-content-heading">
        <h2>Meus favoritos</h2>
        <p className="muted">
          Aquilo que chamou sua atenção merece um lugar especial.
        </p>
      </div>
      {!products.length ? (
        <Empty
          title="Sua coleção começa com um coração."
          text="Toque no coração de um produto para guardar seus favoritos aqui."
          icon="heart"
        />
      ) : (
        <div className="customer-favorites-grid">
          {products.map((p) => (
            <article className="panel customer-favorite-card" key={p.id}>
              <button
                className="customer-favorite-remove"
                aria-label={`Remover ${p.name} dos favoritos`}
                onClick={() => toggleFavorite(p.id)}
              >
                <Heart size={19} fill="currentColor" />
              </button>
              <a href={`#/produto/${p.id}`}>
                <img src={p.image} alt={p.name} />
                <h3>{p.name}</h3>
              </a>
              <span className="muted">{p.variants.length} opções de cor</span>
              <strong className="price">{money(p.price)}</strong>
              <button
                className="btn btn-dark btn-small customer-full"
                disabled={p.stock < 1}
                onClick={() => addToCart(p.id, p.variants[0], 1)}
              >
                {p.stock < 1 ? "Indisponível" : "Adicionar ao carrinho"}
                <Plus size={16} />
              </button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
function OrdersPage() {
  const { data, customer } = useStore();
  const orders = data.orders.filter((o) => o.customerId === customer?.id);
  return (
    <>
      <div className="customer-content-heading">
        <h2>Meus pedidos</h2>
        <p className="muted">
          Cada novidade tem uma história. Acompanhe a sua.
        </p>
      </div>
      {!orders.length ? (
        <Empty
          title="O primeiro pedido a gente não esquece."
          text="Faça uma compra fictícia para experimentar o acompanhamento completo."
          icon="package"
        />
      ) : (
        <div className="customer-orders">
          {orders.map((o) => (
            <article className="panel customer-order-card" key={o.id}>
              <div className="customer-order-top">
                <div>
                  <span className="eyebrow">Pedido {o.id}</span>
                  <p className="muted">Realizado em {date(o.createdAt)}</p>
                </div>
                <span
                  className={`pill customer-status ${o.status === "Cancelado" ? "cancelled" : o.status === "Entregue" ? "delivered" : ""}`}
                >
                  {o.status}
                </span>
              </div>
              <div className="customer-order-body">
                <div className="customer-order-thumbnails">
                  {o.items.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name} />
                  ))}
                </div>
                <div>
                  <strong>
                    {o.items.reduce((s, i) => s + i.quantity, 0)}{" "}
                    {o.items.reduce((s, i) => s + i.quantity, 0) === 1
                      ? "item"
                      : "itens"}{" "}
                    · {money(o.total)}
                  </strong>
                  <p className="muted">
                    {o.payment} · {o.delivery}
                  </p>
                </div>
                <a
                  href={`#/pedido/${o.id}`}
                  className="btn btn-secondary btn-small"
                >
                  Ver pedido
                  <ArrowRight size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
function OrderPage({ orderId }: { orderId: string }) {
  const { data, setData, customer, notify } = useStore();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const order = data.orders.find(
    (o) => o.id === orderId && o.customerId === customer?.id,
  );
  useEffect(() => setConfirmCancel(false), [orderId]);
  if (!order)
    return (
      <div className="container customer-page">
        <Heading eyebrow="Pedidos" title="Pedido não encontrado." />
        <Empty
          title="Este pedido não está neste perfil."
          text="Entre no perfil usado na compra para ver seus pedidos locais."
          link="/conta/pedidos"
          label="Ir para meus pedidos"
          icon="package"
        />
      </div>
    );
  function cancel() {
    if (!order || !cancellable(order.status)) return;
    setData((d) => {
      const current = d.orders.find((o) => o.id === order.id);
      if (!current || !cancellable(current.status)) return d;
      return {
        ...d,
        orders: d.orders.map((o) =>
          o.id === order.id ? { ...o, status: "Cancelado" } : o,
        ),
        products: d.products.map((p) => ({
          ...p,
          stock:
            p.stock +
            current.items
              .filter((i) => i.productId === p.id)
              .reduce((s, i) => s + i.quantity, 0),
        })),
      };
    });
    setConfirmCancel(false);
    notify("Pedido cancelado e estoque devolvido na demonstração.");
  }
  const tracking = ["Confirmado", "Em preparação", "Enviado", "Entregue"];
  const currentIndex = tracking.indexOf(order.status);
  return (
    <div className="container customer-page">
      <a href="#/conta/pedidos" className="text-link customer-back">
        <ArrowLeft size={15} /> Meus pedidos
      </a>
      <div className="customer-order-hero">
        <div className="customer-order-check">
          <CheckCircle2 size={34} />
        </div>
        <div>
          <span className="eyebrow">
            {order.status === "Cancelado"
              ? "Demonstração encerrada"
              : "Pedido de demonstração"}
          </span>
          <h1>
            {order.status === "Cancelado"
              ? "Pedido cancelado."
              : "Boa escolha. Pedido recebido!"}
          </h1>
          <p className="muted">
            {order.id} · {date(order.createdAt)} · {order.customerName}
          </p>
        </div>
        <span
          className={`pill customer-status ${order.status === "Cancelado" ? "cancelled" : ""}`}
        >
          {order.status}
        </span>
      </div>
      <DemoNote />
      {order.status === "Pagamento pendente" && (
        <section className="panel customer-payment-pending">
          <CreditCard size={30} />
          <div>
            <h2>{order.payment} aguardando aprovação</h2>
            <p>
              Este é um pagamento fictício. Use o botão para testar a
              confirmação do pedido.
            </p>
            <small>
              Nenhum código de pagamento real é gerado e nenhum valor será
              cobrado.
            </small>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setData((d) => ({
                ...d,
                orders: d.orders.map((o) =>
                  o.id === order.id && o.status === "Pagamento pendente"
                    ? { ...o, status: "Confirmado" }
                    : o,
                ),
              }));
              notify("Pagamento fictício aprovado.");
            }}
          >
            Simular pagamento aprovado
            <Check size={17} />
          </button>
        </section>
      )}
      {order.status !== "Cancelado" && (
        <section className="panel customer-tracking">
          <h2>Acompanhe sua novidade</h2>
          <ol>
            {tracking.map((status, i) => (
              <li key={status} className={i <= currentIndex ? "done" : ""}>
                <span>{i <= currentIndex ? <Check size={17} /> : i + 1}</span>
                <strong>{status}</strong>
                <small>
                  {i <= currentIndex ? "Etapa registrada" : "Aguardando"}
                </small>
              </li>
            ))}
          </ol>
          <p className="muted customer-small">
            O painel de administração permite simular preparação, envio e
            entrega. Nenhuma transportadora está conectada.
          </p>
        </section>
      )}
      <div className="customer-order-details">
        <section className="panel customer-order-products">
          <h2>O que vem por aí</h2>
          {order.items.map((item, i) => (
            <div className="customer-order-product" key={i}>
              <a href={`#/produto/${item.productId}`}>
                <img src={item.image} alt={item.name} />
              </a>
              <div>
                <a href={`#/produto/${item.productId}`}>
                  <strong>{item.name}</strong>
                </a>
                <p className="muted">
                  {item.variant} · Quantidade {item.quantity}
                </p>
                <small>{money(item.price)} cada</small>
              </div>
              <strong>{money(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="customer-summary-row">
            <span>Subtotal</span>
            <strong>{money(order.subtotal)}</strong>
          </div>
          {order.discount > 0 && (
            <div className="customer-summary-row customer-discount">
              <span>Desconto {order.coupon}</span>
              <strong>− {money(order.discount)}</strong>
            </div>
          )}
          <div className="customer-summary-row">
            <span>Entrega</span>
            <strong>{order.shipping ? money(order.shipping) : "Grátis"}</strong>
          </div>
          <div className="customer-summary-total">
            <span>Total</span>
            <strong>{money(order.total)}</strong>
          </div>
        </section>
        <aside>
          <section className="panel customer-order-address">
            <h3>
              <MapPin size={19} /> Endereço de entrega
            </h3>
            <strong>{order.address.recipient}</strong>
            <p>
              {order.address.street}, {order.address.number}
              {order.address.complement && ` · ${order.address.complement}`}
              <br />
              {order.address.district}
              <br />
              {order.address.city}/{order.address.state}
              <br />
              CEP {order.address.cep}
            </p>
            <h3>
              <Truck size={19} /> Entrega escolhida
            </h3>
            <p>{order.delivery}</p>
            <h3>
              <CreditCard size={19} /> Pagamento
            </h3>
            <p>
              {order.payment} · {money(order.total)}
            </p>
          </section>
          {cancellable(order.status) && (
            <div className="panel customer-order-cancel">
              {confirmCancel ? (
                <>
                  <strong>Deseja cancelar este pedido?</strong>
                  <p className="muted">
                    O estoque dos produtos será reposto. Não existe cobrança ou
                    estorno real.
                  </p>
                  <div>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => setConfirmCancel(false)}
                    >
                      Manter pedido
                    </button>
                    <button className="btn btn-dark btn-small" onClick={cancel}>
                      Confirmar cancelamento
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>Mudou de ideia?</h3>
                  <p className="muted">Você pode cancelar antes do envio.</p>
                  <button
                    className="text-link"
                    onClick={() => setConfirmCancel(true)}
                  >
                    Cancelar pedido
                  </button>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
      <div className="customer-order-bottom">
        <a href="#/catalogo" className="btn btn-dark">
          Continuar explorando
          <ArrowRight size={17} />
        </a>
        <a href="#/ajuda" className="text-link">
          Preciso de ajuda
        </a>
      </div>
    </div>
  );
}
function AccountPage({ path }: { path: string }) {
  const { customer } = useStore();
  if (!customer) return <AuthPage mode="login" />;
  return (
    <div className="container customer-page">
      <Heading
        eyebrow="Seu espaço"
        title={`Olá, ${customer.name.split(" ")[0]}.`}
        description="Um lugar para acompanhar tudo o que é seu."
      />
      <div className="customer-account-layout">
        <AccountNav active={path} />
        <section className="customer-account-content">
          {path === "/conta/pedidos" ? (
            <OrdersPage />
          ) : path === "/conta/enderecos" ? (
            <AddressesPage />
          ) : path === "/conta/favoritos" ? (
            <FavoritesPage />
          ) : (
            <ProfilePage />
          )}
        </section>
      </div>
    </div>
  );
}
export default function CustomerPages({ path }: { path: string }) {
  if (path === "/carrinho") return <CartPage />;
  if (path === "/checkout") return <CheckoutPage />;
  if (path.startsWith("/pedido/"))
    return <OrderPage orderId={decodeURIComponent(path.slice(8))} />;
  if (path === "/conta/entrar") return <AuthPage key="login" mode="login" />;
  if (path === "/conta/cadastro")
    return <AuthPage key="register" mode="register" />;
  if (path === "/conta/recuperar")
    return <AuthPage key="recover" mode="recover" />;
  return <AccountPage path={path} />;
}
