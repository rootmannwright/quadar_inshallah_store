const carousel = document.querySelector('.imagem_store');
const images = carousel.children;

let currentIndex = 0;

document.querySelector('.nav_left').addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
    }
});

document.querySelector('.nav_right').addEventListener('click', () => {
    if (currentIndex < images.length - 1) {
        currentIndex++;
        updateCarousel();
    }
});

function updateCarousel() {
    const imageWidth = images[0].offsetWidth + 40;
    carousel.style.transform = `translateX(${-currentIndex * imageWidth}px)`;
}

/* swipe mobile */
let startX = 0;

carousel.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
});

carousel.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;

    if (startX - endX > 50 && currentIndex < images.length - 1) {
        currentIndex++;
    } else if (endX - startX > 50 && currentIndex > 0) {
        currentIndex--;
    }

    updateCarousel();
});
