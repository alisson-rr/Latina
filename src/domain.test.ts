import test from "node:test";
import assert from "node:assert/strict";
import {
  cartError,
  cartSubtotal,
  discountAmount,
  resolveCheckoutCustomer,
  shippingOptions,
  validateAddress,
} from "./domain.ts";
import type { Customer, Product } from "./types.ts";
const p: Product = {
  id: "p",
  name: "Produto",
  price: 1999,
  stock: 3,
  variants: ["Preto", "Branco"],
  category: "x",
  image: "",
  description: "",
  featured: true,
  rating: 4,
  specs: {},
};
test("soma em centavos, desconto arredondado e frete no limiar", () => {
  const subtotal = cartSubtotal(
    [{ productId: "p", variant: "Preto", quantity: 3 }],
    [p],
  );
  assert.equal(subtotal, 5997);
  assert.equal(
    discountAmount(subtotal, { code: "TEST", percent: 10, active: true }),
    600,
  );
  assert.equal(
    discountAmount(subtotal, { code: "TEST", percent: 10, active: false }),
    0,
  );
  assert.equal(shippingOptions("01310-100", 49900, 49900)[0].price, 0);
  assert.equal(shippingOptions("01310100", 49899, 49900)[0].price, 1990);
  assert.deepEqual(shippingOptions("123", 5997, 49900), []);
});
test("estoque é compartilhado entre variantes e não aceita quantidade inválida", () => {
  assert.match(
    cartError(
      [
        { productId: "p", variant: "Preto", quantity: 2 },
        { productId: "p", variant: "Branco", quantity: 2 },
      ],
      [p],
    ) ?? "",
    /Estoque/,
  );
  assert.equal(
    cartError([{ productId: "p", variant: "Preto", quantity: 3 }], [p]),
    null,
  );
  assert.ok(cartError([{ productId: "p", variant: "Azul", quantity: 1 }], [p]));
  assert.ok(
    cartError([{ productId: "p", variant: "Preto", quantity: -1 }], [p]),
  );
  assert.ok(cartError([], [p]));
});
test("endereço incompleto ou CEP inválido não segue no checkout", () => {
  const address = {
    cep: "01310100",
    street: "Avenida Exemplo",
    number: "120",
    city: "São Paulo",
    state: "SP",
    recipient: "Alex Silva",
    district: "Bela Vista",
  };
  assert.equal(validateAddress(address), true);
  assert.equal(validateAddress({ ...address, number: "" }), false);
  assert.equal(validateAddress({ ...address, cep: "12345" }), false);
  assert.equal(validateAddress({ ...address, state: "São Paulo" }), false);
  assert.equal(validateAddress({ ...address, state: "ZZ" }), false);
  for (const state of "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ")) {
    assert.equal(validateAddress({ ...address, state }), true, state);
  }
});
test("checkout de visitante reutiliza o perfil pelo e-mail normalizado", () => {
  const profile: Customer = {
    id: "alex",
    name: "Alex Silva",
    email: "alex@exemplo.com",
    phone: "11999990000",
    addresses: [{
      id: "casa", label: "Casa", recipient: "Alex Silva", cep: "01310100",
      street: "Avenida Exemplo", number: "120", complement: "",
      district: "Bela Vista", city: "São Paulo", state: "SP",
    }],
  };
  const identity = resolveCheckoutCustomer([profile], null, "  ALEX@EXEMPLO.COM  ");
  assert.equal(identity.customer, profile);
  assert.equal(identity.customer?.id, "alex");
  assert.equal(identity.customer?.addresses, profile.addresses);
  assert.equal(identity.conflict, false);
  assert.deepEqual(resolveCheckoutCustomer([profile], null, "novo@exemplo.com"), {
    customer: null, conflict: false,
  });
});
test("checkout preserva o perfil logado e bloqueia e-mail de outro perfil", () => {
  const alex: Customer = {
    id: "alex", name: "Alex Silva", email: "alex@exemplo.com",
    phone: "11999990000", addresses: [],
  };
  const bia: Customer = { ...alex, id: "bia", name: "Bia Silva", email: "bia@exemplo.com" };
  const profiles = [alex, bia];
  assert.deepEqual(resolveCheckoutCustomer(profiles, alex, " ALEX@EXEMPLO.COM "), {
    customer: alex, conflict: false,
  });
  assert.deepEqual(resolveCheckoutCustomer(profiles, alex, " BIA@EXEMPLO.COM "), {
    customer: alex, conflict: true,
  });
  assert.deepEqual(resolveCheckoutCustomer(profiles, alex, "novo@exemplo.com"), {
    customer: alex, conflict: false,
  });
});
