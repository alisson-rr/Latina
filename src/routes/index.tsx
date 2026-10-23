import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Cpu, Instagram, Laptop, MapPin, Menu, MessageCircle, MonitorSmartphone,
  Navigation, Network, Phone, ShoppingBag, Store, Wrench, X, Headset, HardDrive,
} from "lucide-react";
import logo from "@/assets/latina-logo.png";
import hero from "@/assets/hero.jpg";
import {
  site, nav, services, categories, messages, waLink, mapsUrl, fullAddress,
} from "@/config/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Latina Informática | Loja e assistência técnica em Novo Hamburgo" },
      { name: "description", content: "Notebooks, componentes, acessórios e assistência técnica em Canudos, Novo Hamburgo/RS. Atendimento presencial e remoto. Fale pelo WhatsApp." },
      { property: "og:title", content: "Latina Informática | Loja e assistência técnica em Novo Hamburgo" },
      { property: "og:description", content: "Produtos para trabalhar, estudar e jogar, e assistência técnica para seus equipamentos em Canudos, Novo Hamburgo/RS." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:url", content: site.previewUrl },
      { property: "og:image", content: new URL(logo, site.previewUrl).href },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:alt", content: "Latina Informática" },
    ],
  }),
  component: Index,
});

const serviceIcons = { laptop: Laptop, devices: MonitorSmartphone, format: HardDrive, network: Network };

function WaIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.24-9.44 9.45-9.44a9.38 9.38 0 0 1 9.43 9.45c0 5.2-4.24 9.43-9.45 9.43M20.08 3.9A11.3 11.3 0 0 0 12.05.58C5.8.58.7 5.67.7 11.93c0 2 .52 3.95 1.52 5.67L.6 23.5l6.03-1.58a11.3 11.3 0 0 0 5.42 1.38h.01c6.25 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.03" />
    </svg>
  );
}

function Logo({ className = "" }: { className?: string }) {
  return <img src={logo} alt="Latina Informática – Hardware & Software" width={1920} height={960} className={`h-auto object-contain ${className}`} />;
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <a href="#inicio" aria-label="Latina Informática – início" className="shrink-0">
          <Logo className="w-32 sm:w-36" />
        </a>
        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary">{n.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={waLink(messages.general)} target="_blank" rel="noopener noreferrer" className="btn btn-primary hidden !py-2.5 sm:inline-flex">
            <WaIcon /> Falar no WhatsApp
          </a>
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? "Fechar menu" : "Abrir menu"} className="grid h-11 w-11 place-items-center rounded-full bg-secondary md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="menu-mobile" aria-label="Menu mobile" className="animate-rise border-t border-border bg-card px-4 pb-6 pt-2 md:hidden">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-border py-4 text-lg font-semibold">
              {n.label} <ArrowRight className="h-4 w-4 text-primary" />
            </a>
          ))}
          <a href={waLink(messages.general)} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5 w-full">
            <WaIcon /> Falar no WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-graphite text-graphite-foreground">
      <div className="grid-lines absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div className="animate-rise">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-graphite-soft px-4 py-2 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-primary" /> Canudos · Novo Hamburgo/RS
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Informática e <span className="text-primary">assistência técnica</span> em Novo Hamburgo
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-graphite-muted">
            Produtos para trabalhar, estudar e jogar. Assistência para cuidar dos seus equipamentos, com atendimento presencial em Canudos e suporte remoto.
          </p>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 sm:max-w-xl">
            <a href={waLink(messages.support)} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl bg-primary p-5 text-primary-foreground shadow-soft transition-transform hover:-translate-y-1">
              <Wrench className="h-7 w-7 shrink-0" />
              <span className="min-w-0"><span className="block text-lg font-bold">Preciso de assistência</span><span className="text-sm opacity-90">Conte o problema pelo WhatsApp</span></span>
            </a>
            <a href={waLink(messages.purchase)} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl bg-graphite-foreground p-5 text-graphite shadow-soft transition-transform hover:-translate-y-1">
              <ShoppingBag className="h-7 w-7 shrink-0 text-primary" />
              <span className="min-w-0"><span className="block text-lg font-bold">Quero comprar</span><span className="text-sm text-muted-foreground">Consulte equipamentos e acessórios</span></span>
            </a>
          </div>
        </div>
        <div className="relative animate-rise [animation-delay:150ms]">
          <div className="absolute -inset-4 rounded-[2rem] bg-primary/20 blur-3xl" aria-hidden="true" />
          <img src={hero} alt="Notebook, teclado mecânico, mouse, headset e SSD sobre mesa escura" width={1200} height={896} className="relative w-full rounded-3xl object-cover shadow-soft" />
          <p className="relative mt-4 text-center text-sm font-semibold italic text-graphite-muted">“{site.slogan}”</p>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="servicos" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="eyebrow">Serviços</span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Assistência para os equipamentos do seu dia a dia</h2>
          <p className="mt-5 text-lg text-muted-foreground">Leve seu equipamento até a loja em Canudos ou fale com a gente para saber se o seu caso pode ser atendido de forma remota.</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-accent p-5">
              <Store className="h-6 w-6 text-primary" />
              <p className="mt-3 font-bold">Presencial</p>
              <p className="text-sm text-muted-foreground">Na loja, em Canudos</p>
            </div>
            <div className="rounded-2xl bg-secondary p-5">
              <Headset className="h-6 w-6 text-primary" />
              <p className="mt-3 font-bold">Remoto</p>
              <p className="text-sm text-muted-foreground">Quando o caso permite</p>
            </div>
          </div>
        </div>
        <div>
          <ol className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            {services.map((s, i) => {
              const Icon = serviceIcons[s.icon];
              return (
                <li key={s.title} className="flex gap-5 p-6 sm:p-8">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-graphite text-primary"><Icon className="h-6 w-6" /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary">0{i + 1}</p>
                    <h3 className="text-xl font-bold">{s.title}</h3>
                    <p className="mt-1.5 text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-6 flex flex-col items-start gap-4 rounded-3xl bg-graphite p-6 text-graphite-foreground sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="text-lg font-semibold">Explique o problema do seu equipamento pelo WhatsApp.</p>
            <a href={waLink(messages.support)} target="_blank" rel="noopener noreferrer" className="btn btn-primary shrink-0"><WaIcon /> Pedir assistência</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Products() {
  return (
    <section id="produtos" className="bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">Produtos</span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Tecnologia para o que você precisa</h2>
            <p className="mt-5 text-lg text-muted-foreground">Equipamentos e acessórios para trabalho, estudo e jogos. Consulte as opções pelo WhatsApp.</p>
          </div>
          <a href={waLink(messages.purchase)} target="_blank" rel="noopener noreferrer" className="btn btn-dark self-start md:self-auto"><Cpu className="h-5 w-5" /> Consultar equipamentos</a>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <li key={c.name} className={`group flex flex-col overflow-hidden rounded-3xl bg-card shadow-soft ${i === 0 ? "lg:row-span-2" : ""}`}>
              <div className={`overflow-hidden ${i === 0 ? "lg:flex-1" : ""}`}>
                <img src={c.image} alt={`Ilustração da categoria ${c.name}`} loading="lazy" width={944} height={704} className="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold">{c.name}</h3>
                <p className="mt-1.5 flex-1 text-muted-foreground">{c.text}</p>
                <a href={waLink(messages.category(c.name))} target="_blank" rel="noopener noreferrer" aria-label={`Consultar opções de ${c.name} pelo WhatsApp`} className="mt-5 inline-flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all">
                  Consultar opções <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="a-loja" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative rounded-[2rem] bg-card p-8 shadow-soft sm:p-12">
          <Logo className="mx-auto w-full max-w-md" />
          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-accent p-5">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="font-semibold">{fullAddress}</p>
          </div>
        </div>
        <div>
          <span className="eyebrow">A loja</span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Conheça a Latina Informática</h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>A Latina Informática fica em Canudos, Novo Hamburgo, e reúne em um só lugar a venda de equipamentos e acessórios e a assistência técnica.</p>
            <p>Você pode passar na loja para conversar, levar seu equipamento ou consultar produtos. Se preferir, fale com a gente pelo WhatsApp — também oferecemos suporte remoto quando o caso permite.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark"><Navigation className="h-5 w-5" /> Traçar rota</a>
            <a href={waLink(messages.general)} target="_blank" rel="noopener noreferrer" className="btn btn-outline text-primary"><WaIcon /> Conversar</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contato" className="px-4 pb-20 sm:px-6 lg:pb-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-graphite text-graphite-foreground">
        <div className="grid-lines absolute inset-0" aria-hidden="true" />
        <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:p-16">
          <div>
            <span className="eyebrow">Contato</span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Visite a loja ou chame no WhatsApp</h2>
            <p className="mt-5 max-w-lg text-lg text-graphite-muted">Estamos em Canudos, Novo Hamburgo. Venha conhecer a loja ou envie uma mensagem para tirar suas dúvidas.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={waLink(messages.general)} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><WaIcon /> Falar no WhatsApp</a>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-light"><Navigation className="h-5 w-5" /> Traçar rota</a>
            </div>
          </div>
          <ul className="space-y-3">
            <li>
              <a href={waLink(messages.general)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl bg-graphite-soft p-5 transition-colors hover:bg-primary/20">
                <Phone className="h-6 w-6 shrink-0 text-primary" />
                <span><span className="block text-sm text-graphite-muted">WhatsApp</span><span className="text-lg font-bold">{site.phoneDisplay}</span></span>
              </a>
            </li>
            <li>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl bg-graphite-soft p-5 transition-colors hover:bg-primary/20">
                <MapPin className="h-6 w-6 shrink-0 text-primary" />
                <span className="min-w-0"><span className="block text-sm text-graphite-muted">Endereço</span><span className="font-bold">{site.address.street}<br />{site.address.district}, {site.address.city} · CEP {site.address.cep}</span></span>
              </a>
            </li>
            <li>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl bg-graphite-soft p-5 transition-colors hover:bg-primary/20">
                <Instagram className="h-6 w-6 shrink-0 text-primary" />
                <span><span className="block text-sm text-graphite-muted">Instagram</span><span className="text-lg font-bold">{site.instagramHandle}</span></span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 pb-28 sm:px-6 md:grid-cols-3 md:pb-14">
        <div>
          <Logo className="w-44" />
          <p className="mt-4 text-sm text-muted-foreground">{site.slogan}</p>
        </div>
        <nav aria-label="Rodapé">
          <p className="font-bold">Navegação</p>
          <ul className="mt-3 space-y-2">
            {nav.map((n) => <li key={n.href}><a href={n.href} className="text-muted-foreground hover:text-primary">{n.label}</a></li>)}
            <li><a href={site.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"><Instagram className="h-4 w-4" /> Instagram</a></li>
          </ul>
        </nav>
        <div className="text-sm text-muted-foreground">
          <p className="font-bold text-foreground">{site.legalName}</p>
          <p className="mt-3">CNPJ {site.cnpj}</p>
          <p className="mt-1">{fullAddress}</p>
          <p className="mt-1">WhatsApp {site.phoneDisplay}</p>
          <p className="mt-6">© {new Date().getFullYear()} {site.name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  return (
    <a href={waLink(messages.general)} target="_blank" rel="noopener noreferrer" aria-label="Falar com a Latina Informática pelo WhatsApp" className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-soft transition-transform hover:scale-110">
      <WaIcon className="h-7 w-7" />
    </a>
  );
}

function Index() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Products />
        <About />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
