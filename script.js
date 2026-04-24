document.addEventListener('DOMContentLoaded', () => {
    const bg = document.getElementById('app-bg');
    const weatherStates = ['bg-sunny', 'bg-cloudy', 'bg-rainy'];
    let currentState = 0;

    /**
     * Cicla suavemente entre diferentes estados climáticos para el fondo
     */
    const cycleBackground = () => {
        bg.classList.remove(...weatherStates);
        currentState = (currentState + 1) % weatherStates.length;
        bg.classList.add(weatherStates[currentState]);
    };

    // Cambiar fondo cada 8 segundos
    setInterval(cycleBackground, 8000);

    // Efecto de scroll sutil para los elementos glass
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const cards = document.querySelectorAll('.glass');
        
        cards.forEach((card, index) => {
            const speed = 0.05 + (index * 0.02);
            card.style.transform = `translateY(${scrolled * -speed}px)`;
        });
    });

    console.log("🌦️ Tiempo Landing Page cargada. Diseño en desarrollo.");
});
