document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. MENÚ MÓVIL RESPONSIVE
       ========================================================================== */
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const navigationMenu = document.getElementById('navigation-menu');

    if (menuToggleBtn && navigationMenu) {
        menuToggleBtn.addEventListener('click', () => {
            navigationMenu.classList.toggle('active');
            menuToggleBtn.classList.toggle('active');
            
            // Animación del botón hamburguesa
            const bars = menuToggleBtn.querySelectorAll('.bar');
            if (navigationMenu.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });

        // Cerrar menú al hacer clic en un enlace
        const navLinks = navigationMenu.querySelectorAll('.nav-link, .nav-btn');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navigationMenu.classList.remove('active');
                const bars = menuToggleBtn.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            });
        });
    }


    /* ==========================================================================
       4. FORMULARIO DE CONTACTO INTERACTIVO
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const contactSuccessMsg = document.getElementById('contact-success-msg');

    if (contactForm && contactSuccessMsg) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('form-submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            try {
                const response = await fetch('https://formspree.io/f/xgoboobk', {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    contactForm.style.display = 'none';
                    contactSuccessMsg.style.display = 'block';
                } else {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Enviar Mensaje';
                    alert('Hubo un error al enviar. Por favor intenta de nuevo.');
                }
            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Mensaje';
                alert('Error de conexión. Por favor intenta de nuevo.');
            }
        });
    }

});
