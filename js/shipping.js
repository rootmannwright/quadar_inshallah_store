// frontend/public/js/shipping.js

const form = document.getElementById('shippingForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const shippingData = {
        fullName: document.getElementById('fullName').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        country: document.getElementById('country').value,
    };

    // Salvar no localStorage (ou enviar para backend)
    localStorage.setItem('shippingInfo', JSON.stringify(shippingData));

    // Redirecionar para a página de pagamento/checkout
    window.location.href = '/pages/public/shipping.html';
});
