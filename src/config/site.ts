// Configuração central do site — edite contatos, textos e categorias aqui.
// PENDENTE: horários de funcionamento ainda não confirmados com o proprietário.
// Quando confirmados, adicionar em `site.hours` e exibir na seção de contato.

import notebooks from "@/assets/cat-notebooks.jpg";
import ssd from "@/assets/cat-ssd.jpg";
import gpu from "@/assets/cat-gpu.jpg";
import gamer from "@/assets/cat-gamer.jpg";
import audio from "@/assets/cat-audio.jpg";
import mobile from "@/assets/cat-mobile.jpg";

export const site = {
  name: "Latina Informática",
  previewUrl: "https://latina-informatica.vercel.app/",
  legalName: "Latina Informática Ltda.",
  slogan: "A qualidade que você merece",
  cnpj: "08.365.152/0001-08",
  phoneDisplay: "(51) 92006-6826",
  whatsappNumber: "5551920066826",
  instagram: "https://www.instagram.com/latinainformatica/",
  instagramHandle: "@latinainformatica",
  address: {
    street: "Rua Bartolomeu de Gusmão, 645, Sala 04",
    district: "Canudos",
    city: "Novo Hamburgo/RS",
    cep: "93542-000",
  },
  hours: null as string | null,
};

export const fullAddress = `${site.address.street} – ${site.address.district}, ${site.address.city}, CEP ${site.address.cep}`;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `Latina Informática, Rua Bartolomeu de Gusmão, 645, Canudos, Novo Hamburgo - RS, 93542-000`,
)}`;

export const messages = {
  general: "Olá! Encontrei a Latina Informática pelo site e gostaria de atendimento.",
  support: "Olá! Encontrei a Latina Informática pelo site e preciso de assistência técnica.",
  purchase:
    "Olá! Encontrei a Latina Informática pelo site e gostaria de consultar equipamentos e acessórios.",
  category: (name: string) =>
    `Olá! Vi a categoria ${name} no site da Latina Informática e gostaria de consultar as opções disponíveis.`,
};

export const waLink = (message: string) =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const nav = [
  { href: "#servicos", label: "Serviços" },
  { href: "#produtos", label: "Produtos" },
  { href: "#a-loja", label: "A loja" },
  { href: "#contato", label: "Contato" },
];

export const services = [
  {
    icon: "laptop",
    title: "Computadores e notebooks",
    text: "Assistência técnica para computadores e notebooks que apresentam problemas de funcionamento.",
  },
  {
    icon: "devices",
    title: "Celulares, TVs e impressoras",
    text: "Atendimento técnico para os aparelhos que fazem parte da sua rotina em casa e no trabalho.",
  },
  {
    icon: "format",
    title: "Formatação",
    text: "Formatação de computadores para deixar o sistema pronto para uso novamente.",
  },
  {
    icon: "network",
    title: "Redes e CFTV",
    text: "Serviços de redes e sistemas de câmeras de segurança para residências e empresas.",
  },
] as const;

export const categories = [
  { name: "Notebooks", text: "Modelos para trabalhar, estudar e o uso do dia a dia.", image: notebooks },
  { name: "SSD e armazenamento M.2", text: "Mais velocidade e espaço para o seu computador.", image: ssd },
  { name: "Placas de vídeo e componentes", text: "Peças para montar ou atualizar a sua máquina.", image: gpu },
  { name: "Periféricos e acessórios gamer", text: "Teclados, mouses e itens para o seu setup.", image: gamer },
  { name: "Fones e caixas de som", text: "Áudio para chamadas, música, filmes e jogos.", image: audio },
  { name: "Acessórios para celular", text: "Carregadores, cabos, capas e outros itens úteis.", image: mobile },
];
