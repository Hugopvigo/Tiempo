document.addEventListener('DOMContentLoaded', () => {
    // Animación de las barras de la gráfica en la preview
    const bars = document.querySelectorAll('.bar');
    
    const animateBars = () => {
        bars.forEach(bar => {
            const randomHeight = Math.floor(Math.random() * 60) + 20;
            bar.style.height = `${randomHeight}%`;
        });
    };

    // Animar barras cada 3 segundos
    setInterval(animateBars, 3000);

    // Efecto sutil de movimiento en los Blobs del fondo al mover el ratón
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        const blobs = document.querySelectorAll('.blob');
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 20;
            blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });

    console.log("✨ Tiempo Landing: Versión Refinada cargada.");
});
