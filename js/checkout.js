const token = localStorage.getItem("token");

fetch("http://localhost:3000/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    items: cartItems,
    total: cartTotal
  })
})
.then(async (res) => {

  // 👉 Não logado
  if (res.status === 401) {
    alert("Faça login para finalizar a compra");
    window.location.href = "/frontend/pages/login.html";
    return;
  }

  // 👉 Outro erro do servidor
  if (!res.ok) {
    const errorData = await res.json();
    alert(errorData.error || "Erro ao finalizar compra");
    return;
  }

  // 👉 Sucesso
  const data = await res.json();
  console.log("Pedido criado:", data);
  alert("Compra finalizada com sucesso!");
})
.catch(err => {
  console.error(err);
  alert("Erro ao conectar com servidor");
});
