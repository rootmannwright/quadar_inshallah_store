async function loadProducts() {
  const response = await fetch("http://localhost/api/products");
  const products = await response.json();

  const container = document.querySelector(".imagem_store");
  container.innerHTML = "";

  products.forEach(product => {
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;

    img.addEventListener("click", () => openModal({
      _id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      stock: product.stock || 10
    }));

    container.appendChild(img);
  });
}

loadProducts();
