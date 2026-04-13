import { useEffect, useState } from "react";

export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("/api/csrf-token", {
          credentials: "include",
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        console.error("Erro ao buscar CSRF token", err);
      }
    }

    fetchToken();
  }, []);

  return csrfToken;
}