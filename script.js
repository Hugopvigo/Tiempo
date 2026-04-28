document.addEventListener('DOMContentLoaded', () => {
    // Slideshow del mockup
    const slides = document.querySelectorAll('.screen .slide');
    const dots = document.querySelectorAll('.mockup-dots .dot');
    let current = 0;
    let timer;

    const goToSlide = (index) => {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = index;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    };

    const nextSlide = () => goToSlide((current + 1) % slides.length);

    const resetTimer = () => {
        clearInterval(timer);
        timer = setInterval(nextSlide, 3500);
    };

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { goToSlide(i); resetTimer(); });
    });

    resetTimer();

    // Efecto sutil de movimiento en los Blobs del fondo al mover el ratón
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        document.querySelectorAll('.blob').forEach((blob, index) => {
            const speed = (index + 1) * 20;
            blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });

    console.log("✨ Tiempo Landing: Versión Refinada cargada.");
});
