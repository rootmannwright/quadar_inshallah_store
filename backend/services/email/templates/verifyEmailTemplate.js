export function verifyEmailTemplate(token) {
  return `
    <h2>Verifique seu email</h2>
    <p>Seu código:</p>
    <strong>${token}</strong>
    <p>Expira em 10 minutos.</p>
  `;
}