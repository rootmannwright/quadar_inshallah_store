document
  .getElementById("loginForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Login inválido");
        return res.json();
      })
      .then(data => {
        // salva token se quiser
        localStorage.setItem("token", data.token);

        // redireciona
        window.location.href = "/pages/checkout.html";
      })
      .catch(err => {
        document.getElementById("error").innerText =
          "Email ou senha incorretos";
      });
  });

