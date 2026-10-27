// AURELLA JAVASCRIPT
const intro = document.getElementById("intro");
const skipIntro = document.getElementById("skipIntro");
const enterSite = document.getElementById("enterSite");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

let introTimer;

function dismissIntro() {
  if (!intro) return;

  intro.classList.add("done");
  document.body.style.overflow = "";

  if (introTimer) {
    clearTimeout(introTimer);
  }
}

if (intro) {
  if (reducedMotion.matches) {
    dismissIntro();
  } else {
    document.body.style.overflow = "hidden";

    introTimer = setTimeout(dismissIntro, 12000);
  }
}

skipIntro?.addEventListener("click", dismissIntro);
enterSite?.addEventListener("click", dismissIntro);


const menuToggle = document.getElementById("menuToggle");
const navlinks = document.getElementById("navlinks");

function closeMenu() {
  if (!navlinks || !menuToggle) return;

  navlinks.classList.remove("open");

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");

  document.body.classList.remove("menu-open");

  menuToggle.innerHTML =
    '<span class="menu-symbol" aria-hidden="true">☰</span>';
}

menuToggle?.addEventListener("click", () => {
  if (!navlinks) return;

  const isOpen = navlinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));

  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );

  document.body.classList.toggle("menu-open", isOpen);

  menuToggle.innerHTML = isOpen
    ? '<span class="menu-symbol" aria-hidden="true">×</span>'
    : '<span class="menu-symbol" aria-hidden="true">☰</span>';
});

navlinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 800) {
    closeMenu();
  }
});


const PRODUCTS = {
  "Dew Concentrate": {
    price: 38
  },

  "Cloud Cleanser": {
    price: 24
  },

  "Petal Moisture": {
    price: 32
  }
};


const CART_STORAGE_KEY = "aurelle-demo-cart-v1";

const bagCountEl = document.getElementById("bagCount");
const bagButton = document.getElementById("bagButton");

const cartModal = document.getElementById("cartModal");
const cartItemsEl = document.getElementById("cartItems");

const cartEmpty = document.getElementById("cartEmpty");
const cartSummary = document.getElementById("cartSummary");

const cartSubtotalEl = document.getElementById("cartSubtotal");
const checkoutSubtotalEl = document.getElementById("checkoutSubtotal");

const cartView = document.getElementById("cartView");
const checkoutView = document.getElementById("checkoutView");

const checkoutForm = document.getElementById("checkoutForm");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CART_STORAGE_KEY) || "{}"
    );

    const cleanCart = {};

    Object.entries(saved).forEach(([name, item]) => {
      if (
        PRODUCTS[name] &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      ) {
        cleanCart[name] = {
          price: PRODUCTS[name].price,
          quantity: Math.min(item.quantity, 99)
        };
      }
    });

    return cleanCart;
  } catch (error) {
    console.warn("Could not load the saved shopping bag.", error);
    return {};
  }
}

let cart = loadCart();


function saveCart() {
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );
  } catch (error) {
    console.warn("Could not save the shopping bag.", error);
  }
}


function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(amount);
}

function getCartCount() {
  return Object.values(cart).reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}

function getCartTotal() {
  return Object.values(cart).reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}


function showToast(message) {
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.add("show");

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}


function updateBagCount() {
  const count = getCartCount();

  if (bagCountEl) {
    bagCountEl.textContent = count;
  }

  if (bagButton) {
    bagButton.setAttribute(
      "aria-label",
      `Shopping bag, ${count} ${count === 1 ? "item" : "items"}`
    );
  }
}


function addToCart(name) {
  if (!PRODUCTS[name]) {
    console.error("Product not found:", name);
    return;
  }

  if (!cart[name]) {
    cart[name] = {
      price: PRODUCTS[name].price,
      quantity: 0
    };
  }

  if (cart[name].quantity >= 99) {
    showToast("You've reached the maximum quantity.");
    return;
  }

  cart[name].quantity += 1;

  saveCart();
  updateBagCount();
  renderCart();

  showToast(`${name} added to your bag.`);
}


function changeQuantity(name, change) {
  if (!cart[name]) return;

  const newQuantity = cart[name].quantity + change;

  if (newQuantity <= 0) {
    delete cart[name];
  } else if (newQuantity <= 99) {
    cart[name].quantity = newQuantity;
  }

  saveCart();
  updateBagCount();
  renderCart();
}

function removeFromCart(name) {
  if (!cart[name]) return;

  delete cart[name];

  saveCart();
  updateBagCount();
  renderCart();

  showToast(`${name} removed from your bag.`);
}

function renderCart() {
  if (
    !cartItemsEl ||
    !cartEmpty ||
    !cartSummary ||
    !cartSubtotalEl ||
    !checkoutSubtotalEl
  ) {
    return;
  }

  const entries = Object.entries(cart);

  cartItemsEl.innerHTML = "";

  cartEmpty.hidden = entries.length > 0;
  cartSummary.hidden = entries.length === 0;

  const checkoutButton = document.getElementById("goCheckout");

  if (checkoutButton) {
    checkoutButton.disabled = entries.length === 0;
  }

  entries.forEach(([name, item]) => {
    const row = document.createElement("article");
    row.className = "cart-item";

    // Product information
    const details = document.createElement("div");
    details.className = "cart-item-details";

    const title = document.createElement("h3");
    title.textContent = name;

    const price = document.createElement("p");
    price.textContent = `${formatMoney(item.price)} each`;

    details.append(title, price);

    // Quantity controls
    const controls = document.createElement("div");
    controls.className = "cart-item-controls";

    const minus = document.createElement("button");

    minus.type = "button";
    minus.className = "quantity-control";
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Remove one ${name}`);

    minus.addEventListener("click", () => {
      changeQuantity(name, -1);
    });

    const quantity = document.createElement("span");
    quantity.className = "cart-item-quantity";
    quantity.textContent = item.quantity;

    const plus = document.createElement("button");

    plus.type = "button";
    plus.className = "quantity-control";
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Add one ${name}`);

    plus.addEventListener("click", () => {
      changeQuantity(name, 1);
    });

    controls.append(minus, quantity, plus);

    // Product total
    const lineTotal = document.createElement("strong");

    lineTotal.className = "cart-line-total";
    lineTotal.textContent = formatMoney(
      item.price * item.quantity
    );

    // Remove button
    const remove = document.createElement("button");

    remove.type = "button";
    remove.className = "cart-remove";
    remove.textContent = "Remove";

    remove.addEventListener("click", () => {
      removeFromCart(name);
    });

    // Group the controls
    const side = document.createElement("div");

    side.className = "cart-item-side";

    side.append(lineTotal, controls, remove);

    row.append(details, side);

    cartItemsEl.appendChild(row);
  });

  const total = formatMoney(getCartTotal());

  cartSubtotalEl.textContent = total;
  checkoutSubtotalEl.textContent = total;
}

function openCart() {
  if (!cartModal || !cartView || !checkoutView) {
    console.error("Shopping bag HTML elements are missing.");
    return;
  }

  cartView.hidden = false;
  checkoutView.hidden = true;

  renderCart();

  cartModal.hidden = false;

  document.body.classList.add("modal-open");

  document.getElementById("closeCart")?.focus();
}

function closeCart() {
  if (!cartModal) return;

  cartModal.hidden = true;

  document.body.classList.remove("modal-open");

  bagButton?.focus();
}

document.querySelectorAll(".product-add").forEach((button) => {
  button.addEventListener("click", () => {
    const productName = button.dataset.name;

    addToCart(productName);
  });
});


bagButton?.addEventListener("click", openCart);


document.getElementById("closeCart")?.addEventListener(
  "click",
  closeCart
);

cartModal?.addEventListener("click", (event) => {
  if (event.target === cartModal) {
    closeCart();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartModal && !cartModal.hidden) {
    closeCart();
  }
});

document.getElementById("continueShopping")?.addEventListener(
  "click",
  closeCart
);


document.getElementById("goCheckout")?.addEventListener(
  "click",
  () => {
    if (getCartCount() === 0) {
      showToast("Your bag is empty.");
      return;
    }

    if (!cartView || !checkoutView) return;

    cartView.hidden = true;
    checkoutView.hidden = false;

    renderCart();

    document.getElementById("checkoutName")?.focus();
  }
);


document.getElementById("backToCart")?.addEventListener(
  "click",
  () => {
    if (!cartView || !checkoutView) return;

    checkoutView.hidden = true;
    cartView.hidden = false;

    renderCart();
  }
);


checkoutForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!checkoutForm.reportValidity()) {
    return;
  }

  if (getCartCount() === 0) {
    showToast("Your shopping bag is empty.");
    return;
  }

  const nameInput = document.getElementById("checkoutName");
  const paymentNotice = document.getElementById("paymentNotice");

  const customerName = nameInput?.value.trim() || "there";
  const firstName = customerName.split(/\s+/)[0];

  if (paymentNotice) {
    paymentNotice.hidden = false;
  }

  showToast(
    `Thank you, ${firstName}! Your details have been validated.`
  );
});


document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");

    if (!item) return;

    const isOpen = item.classList.toggle("open");

    button.setAttribute("aria-expanded", String(isOpen));
  });
});

updateBagCount();
renderCart();

console.log("AURELLE JavaScript loaded successfully.");