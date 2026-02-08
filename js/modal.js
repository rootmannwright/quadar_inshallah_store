document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("productModal");
    const modalImage = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const modalPrice = document.getElementById("modalPrice");
    const modalStock = document.getElementById("modalStock");
    const quantityValue = document.getElementById("quantityValue");

    const btnAddToCart = document.getElementById("addToCartBtn");
    const btnIncrease = document.getElementById("increase");
    const btnDecrease = document.getElementById("decrease");
    const btnClose = document.getElementById("closeModal");

    let selectedProduct = null;
    let quantity = 1;

    // Função para abrir o modal
    function openModal(product) {
        selectedProduct = product;
        quantity = 1;

        modalImage.src = product.image;
        modalTitle.textContent = product.name;
        modalDescription.textContent = product.description;
        modalPrice.textContent = product.price.toFixed(2);
        modalStock.textContent = product.stock;
        quantityValue.textContent = quantity;

        modal.classList.add("active");
    }

    // Fecha o modal ao clicar no X
    btnClose.addEventListener("click", () => modal.classList.remove("active"));

    // Fecha o modal ao clicar fora do conteúdo
    modal.addEventListener("click", e => {
        if (e.target === modal) modal.classList.remove("active");
    });

    // Botões de quantidade
    btnIncrease.addEventListener("click", () => {
        if (selectedProduct && quantity < selectedProduct.stock) {
            quantity++;
            quantityValue.textContent = quantity;
        }
    });
    btnDecrease.addEventListener("click", () => {
        if (selectedProduct && quantity > 1) {
            quantity--;
            quantityValue.textContent = quantity;
        }
    });

    // Adiciona ao carrinho
    btnAddToCart.addEventListener("click", () => {
        if (!selectedProduct) return;

        const qty = Number(quantity);
        if (qty <= 0) return;

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existing = cart.find(item => item.id === selectedProduct._id);

        if (existing) {
            // segurança de estoque
            if (existing.quantity + qty > selectedProduct.stock) {
                alert("Quantidade excede o estoque disponível.");
                return;
            }
            existing.quantity += qty;
        } else {
            if (qty > selectedProduct.stock) {
                alert("Quantidade excede o estoque disponível.");
                return;
            }

            cart.push({
                id: selectedProduct._id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                description: selectedProduct.description,
                image: selectedProduct.image,
                quantity: qty,
                stock: selectedProduct.stock
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        //reset de estado
        quantity = 1;
        quantityValue.textContent = quantity;
        selectedProduct = null;
        modal.classList.remove("active");
    });

    // Torna global para products.js
    window.openModal = openModal;
});
