// eslint-disable-next-line no-undef
const form = document.getElementById("loginForm");
// eslint-disable-next-line no-undef
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
// eslint-disable-next-line no-undef
  const email = document.getElementById("email").value;
  // eslint-disable-next-line no-undef
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:5500/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro no login");
    }
 
    localStorage.setItem("token", data.token);
    // eslint-disable-next-line no-undef
    window.location.href = "index.html";

  } catch (error) {
    errorMsg.innerText = error.message;
  }
});
