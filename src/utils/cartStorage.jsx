const KEY = "cart";

export function getCart() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function setCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex((x) => x.id === product.id);

  if (idx >= 0) {
    cart[idx].qty += qty;
  } else {
    cart.push({ ...product, qty, checked: true });
  }

  setCart(cart);
  return cart;
}

export function removeFromCart(id) {
  const cart = getCart().filter((x) => x.id !== id);
  setCart(cart);
  return cart;
}
