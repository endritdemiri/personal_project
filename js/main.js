
const products = [
    {
        id: 1,
        name: "Pallto Leshi Klasike",
        category: "pallto",
        price: 65.00,
        desc: "Pallto e gjatë me prerje të drejtë dhe jakë klasike, 80% lesh natyral.",
        image: "images/pallto.jpg",
        sizes: ["S", "M", "L"]
    },
    {
        id: 2,
        name: "Këmishë Lino e Bardhë",
        category: "kemisha",
        price: 40.00,
        desc: "Këmishë e lehtë 100% lino organike, ideale për stil të përditshëm dhe zyrtar.",
        image: "images/kemishe.jpg",
        sizes: ["XS", "S", "M", "L"]
    },
    {
        id: 3,
        name: "Triko Kashmiri Krem",
        category: "triko",
        price: 50.00,
        desc: "Triko e butë me jakë të rrumbullakët në nuancë bezhë të ngrohtë.",
        image: "images/triko-krem.jpg",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 4,
        name: "Fustan Midi Minimalist",
        category: "kemisha",
        price: 60.00,
        desc: "Fustan elegant me rrip në bel dhe rënie të lirshme në ngjyrë neutrale.",
        image: "images/fustan.jpg",
        sizes: ["XS", "S", "M"]
    },
    {
        id: 5,
        name: "Xhaketë Blazer Strukturore",
        category: "pallto",
        price: 65.00,
        desc: "Blazer klasik me dy kopsa dhe xhepa anësorë për një pamje të kuruar.",
        image: "images/blazer.jpg",
        sizes: ["S", "M", "L"]
    },
    {
        id: 6,
        name: "Triko me Jakë Golf",
        category: "triko",
        price: 55.00,
        desc: "Triko e thurur imët me jakë të lartë për ditët e ftohta.",
        image: "images/triko-golf.jpg",
        sizes: ["S", "M", "L"]
    }
];

function readList(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function writeList(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

const cartKey = "classic_looks_cart";
let cart = readList(cartKey).flatMap(item => {
    const product = products.find(product => product.id === item?.id);
    if (!product || !product.sizes.includes(item.size) ||
        !Number.isSafeInteger(item.qty) || item.qty <= 0) return [];

    return [{...product, size: item.size, qty: item.qty}];
});

const selectedSizes = Object.fromEntries(
    products.map(product => [product.id, product.sizes[0]])
);
let currentCategory = "all";

function saveCart() {
    return writeList(cartKey, cart);
}

function appendRecord(key, record) {
    return writeList(key, [...readList(key), record]);
}

function renderProducts(category = "all") {
    const grid = document.getElementById("products-grid");

    if (!grid) return;

    currentCategory = category;

    const filtered = category === "all"
        ? products
        : products.filter(product => product.category === category);

    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <div class="product-img-wrap">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>

            <div class="product-body">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.desc}</p>

                <div class="product-bottom">
                    <div class="size-selector">
                        ${product.sizes.map(size => `
                            <button
                                type="button"
                                class="size-btn ${selectedSizes[product.id] === size ? "active" : ""}"
                                onclick="selectSize(${product.id}, '${size}')">
                                ${size}
                            </button>
                        `).join("")}
                    </div>

                    <div class="product-footer-row">
                        <span class="product-price">${product.price.toFixed(2)} €</span>
                        <button type="button" class="add-cart-btn" onclick="addToCart(${product.id})">
                            Shto në Shportë
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join("");
}

function selectSize(productId, size) {
    selectedSizes[productId] = size;
    renderProducts(currentCategory);
}

function filterProducts(category) {
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.category === category
        );
    });

    renderProducts(category);
}

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        filterProducts(button.dataset.category);
    });
});

document.querySelectorAll("[data-filter]").forEach(link => {
    link.addEventListener("click", () => {
        filterProducts(link.dataset.filter);
    });
});

function addToCart(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) return;

    const size = selectedSizes[productId];

    const existing = cart.find(item =>
        item.id === productId && item.size === size
    );

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            ...product,
            size: size,
            qty: 1
        });
    }

    const saved = saveCart();
    updateCartUI();
    showToast(saved
        ? `"${product.name}" (Masa ${size}) u shtua në shportë!`
        : "Produkti u shtua për këtë sesion. Ruajtja në shfletues nuk është e disponueshme.");
}

function updateQty(index, delta) {
    if (!cart[index]) return;

    cart[index].qty += delta;

    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    if (!saveCart()) showToast("Ndryshimi vlen për këtë sesion.");
    updateCartUI();
}

function updateCartUI() {
    const badge = document.getElementById("cart-badge");
    const itemsContainer = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");

    const totalCount = cart.reduce(
        (sum, item) => sum + item.qty, 0
    );

    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.qty, 0
    );

    if (badge) badge.textContent = totalCount;

    if (totalEl) {
        totalEl.textContent = `${totalPrice.toFixed(2)} €`;
    }

    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <p class="empty-cart">Shporta juaj është bosh.</p>
        `;
        return;
    }

    itemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">

            <div class="cart-item-info">
                <h4>${item.name}</h4>

                <span class="cart-item-meta">
                    Masa: ${item.size} • ${item.price.toFixed(2)} €
                </span>

                <div class="qty-controls">
                    <button onclick="updateQty(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateQty(${index}, 1)">+</button>
                </div>
            </div>
        </div>
    `).join("");
}

const cartDrawer = document.getElementById("cart-drawer");
const cartBackdrop = document.getElementById("cart-backdrop");
const cartBtn = document.getElementById("cart-btn");
const closeCartBtn = document.getElementById("close-cart");
const checkoutBtn = document.getElementById("checkout-btn");

if (cartBtn) {
    cartBtn.addEventListener("click", () => {
        cartDrawer.inert = false;
        cartDrawer.classList.add("open");
        cartBackdrop.classList.remove("hidden");
        cartBtn.setAttribute("aria-expanded", "true");
        closeCartBtn.focus();
    });
}

function closeCart() {
    if (!cartDrawer?.classList.contains("open")) return;

    cartDrawer.classList.remove("open");
    cartDrawer.inert = true;
    cartBackdrop.classList.add("hidden");
    cartBtn.setAttribute("aria-expanded", "false");
    cartBtn.focus();
}

if (closeCartBtn) {
    closeCartBtn.addEventListener("click", closeCart);
}

if (cartBackdrop) {
    cartBackdrop.addEventListener("click", closeCart);
}

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            showToast("Shporta juaj është bosh!");
            return;
        }

        const order = {
            createdAt: new Date().toISOString(),
            items: cart
        };
        if (!appendRecord("classic_looks_orders", order)) {
            showToast("Porosia nuk mund të ruhet në këtë shfletues.");
            return;
        }

        cart = [];
        saveCart();
        updateCartUI();
        closeCart();
        showToast("Porosia u ruajt vetëm në këtë pajisje.");
    });
}

let toastTimeout;

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

const newsletterForm = document.getElementById("newsletter-form");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", event => {
        event.preventDefault();

        const message = document.getElementById("newsletter-msg");
        const key = "classic_looks_newsletter";
        const email = document.getElementById("newsletter-email").value.trim();
        const addresses = readList(key);
        if (addresses.includes(email)) {
            message.textContent = "Kjo adresë është ruajtur tashmë në këtë shfletues.";
            return;
        }

        const saved = writeList(key, [...addresses, email]);
        message.textContent = saved
            ? "Adresa u ruajt vetëm në këtë shfletues."
            : "Adresa nuk mund të ruhet në këtë shfletues.";
        if (saved) newsletterForm.reset();
    });
}

const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        const status = document.getElementById("contact-status");
        const message = Object.fromEntries(new FormData(contactForm));
        const saved = appendRecord("classic_looks_messages", message);
        status.textContent = saved
            ? "Message saved on this device only."
            : "This browser could not save your message.";
        if (saved) contactForm.reset();
    });
}

const modalContent = {
    sizes: {
        title: "Udhëzuesi i Masave",
        body: `
            <p><strong>XS:</strong> Gjoksi 82-86 cm | Beli 64-68 cm</p>
            <p><strong>S:</strong> Gjoksi 86-90 cm | Beli 68-72 cm</p>
            <p><strong>M:</strong> Gjoksi 90-94 cm | Beli 72-76 cm</p>
            <p><strong>L:</strong> Gjoksi 94-98 cm | Beli 76-80 cm</p>
        `
    },

    shipping: {
        title: "Dërgesat & Kthimet",
        body: `
            <p>
                Dërgesat kryhen brenda 24-48 orëve në Shqipëri
                dhe 48-72 orëve në Kosovë e Maqedoni të Veriut.
                Kthimet pranohen brenda 14 ditëve me etiketën origjinale.
            </p>
        `
    },

    care: {
        title: "Kujdesi për Rrobat",
        body: `
            <p>
                Rekomandohet larje e butë në 30°C ose pastrim kimik
                për palltot e leshit dhe trikot e kashmirit.
            </p>
        `
    },

    faq: {
        title: "Pyetje të Shpeshta",
        body: `
            <p>
                <strong>Si kryhet pagesa?</strong><br>
                Pagesa kryhet me para në dorë në momentin e pranimit
                të pakos (Cash on Delivery).
            </p>
        `
    },

    privacy: {
        title: "Politika e Privatësisë",
        body: `
            <p>
                Të dhënat tuaja përdoren vetëm për përpunimin
                e porosive dhe nuk ndahen me palë të treta.
            </p>
        `
    },

    terms: {
        title: "Kushtet e Përdorimit",
        body: `
            <p>
                Të gjitha produktet e prezantuara në Classic Looks
                Clothing janë origjinale dhe të garantuara për cilësi.
            </p>
        `
    }
};

function openInfoModal(key) {
    const data = modalContent[key];
    const modal = document.getElementById("info-modal");

    if (!data || !modal) return;

    document.getElementById("modal-title").textContent = data.title;
    document.getElementById("modal-body").innerHTML = data.body;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");
}

function closeInfoModal() {
    const modal = document.getElementById("info-modal");

    if (!modal) return;

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
}

const infoModal = document.getElementById("info-modal");

if (infoModal) {
    infoModal.addEventListener("click", event => {
        if (event.target === infoModal) {
            closeInfoModal();
        }
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeInfoModal();
        closeCart();
    }
});

function initializeWebsite() {
    const modal = document.getElementById("info-modal");

    if (modal) {
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
    }

    if (cartBackdrop) {
        cartBackdrop.classList.add("hidden");
    }

    renderProducts("all");
    updateCartUI();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWebsite);
} else {
    initializeWebsite();
}
