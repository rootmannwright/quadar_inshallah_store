document.addEventListener("DOMContentLoaded", () => {
  const cartItemsEl = document.querySelector(".cart-items");
  const cartTotalEl = document.querySelector(".cart-total");
  const buyButton = document.getElementById("buyButton");

// tools

  function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  //render

  function renderCart() {
    const cart = getCart();
    cartItemsEl.innerHTML = "";

    if (cart.length === 0) {
      cartItemsEl.innerHTML = `
                <p class="empty-cart">Seu carrinho está vazio.</p>
            `;
      cartTotalEl.textContent = "R$ 0,00";
      return;
    }

    let total = 0;

    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      cartItemsEl.innerHTML += `
                <article class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">

                    <div class="cart-info">
                        <h3>${item.name}</h3>
                        <p class="cart-desc">${item.description}</p>

                        <div class="cart-line">
                            <span>Qtd: ${item.quantity}</span>
                            <strong>R$ ${subtotal.toFixed(2)}</strong>
                        </div>

                        <button class="remove-item">Remover</button>
                    </div>
                </article>
            `;
    });

    cartTotalEl.textContent = `R$ ${total.toFixed(2)}`;

    attachRemoveEvents();
  }

  // remove item

  function attachRemoveEvents() {
    document.querySelectorAll(".remove-item").forEach(button => {
      button.addEventListener("click", e => {
        const itemEl = e.target.closest(".cart-item");
        const id = itemEl.dataset.id;

        let cart = getCart();
        cart = cart.filter(item => item.id !== id);

        saveCart(cart);
        renderCart();
      });
    });
  }

// buying
  buyButton.addEventListener("click", () => {
  const cart = getCart();

  if (cart.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  // 🔐 Verifica se está logado
  const token = localStorage.getItem("token");

  if (!token) {
    // salva destino pós-login
    localStorage.setItem("redirectAfterLogin", "./login.html");
    window.location.href = "./login.html";
    return;
  }

  // ✅ Usuário logado → segue para página de entrega/frete
  window.location.href = "/shipping.html";
});

  renderCart();
});


