document.addEventListener('DOMContentLoaded', () => {
    // Buscamos el contenedor del menú
    const menuContenedor = document.getElementById("menu-contenedor") || document.getElementById("navbar-container");

    if (menuContenedor) {
        fetch("navbar.html")
            .then(respuesta => {
                if (!respuesta.ok) throw new Error("Error al cargar el navbar");
                return respuesta.text();
            })
            .then(codigoHtml => {
                menuContenedor.innerHTML = codigoHtml;
                
                // === INICIALIZACIÓN DE LÓGICA DEL MENÚ ===
                inicializarLogicaMenu();
                
                // === CONTROL DE VISIBILIDAD (Tu lógica original) ===
                const navAdmin = document.getElementById('nav-admin');
                const rolUsuario = localStorage.getItem('rol_finca');
                if (navAdmin) {
                    navAdmin.style.display = (rolUsuario && rolUsuario.toLowerCase() === 'admin') ? 'block' : 'none';
                }

                const btnLogout = document.getElementById('btn-logout');
                const token = localStorage.getItem('token_finca');
                if (btnLogout && !token) {
                    btnLogout.textContent = 'Iniciar Sesión';
                }
            })
            .catch(error => console.error("Error inyectando el navbar:", error));
    }
});

// Función para manejar la animación del botón hamburguesa y el slide-in
function inicializarLogicaMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (menuBtn && navbarCollapse) {
        // Toggle para la animación de la X
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en cualquier enlace
        document.querySelectorAll('.header-nav__link').forEach(link => {
            link.addEventListener('click', () => {
                if(navbarCollapse.classList.contains('show')) {
                    // Usamos la API de Bootstrap para cerrar el colapso
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse);
                    bsCollapse.hide();
                    menuBtn.classList.remove('active');
                }
            });
        });
    }
}

// ==========================================
// SISTEMA GLOBAL DE NOTIFICACIONES (TOASTS)
// ==========================================
window.mostrarNotificacion = function(mensaje, tipo = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        container.style.marginTop = '80px';
        document.body.appendChild(container);
    }
    
    const bgClass = tipo === 'success' ? 'bg-success' : (tipo === 'danger' ? 'bg-danger' : 'bg-primary');
    const iconClass = tipo === 'success' ? 'bi-check-circle-fill' : (tipo === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill');

    const toastHtml = `
        <div class="toast align-items-center text-white ${bgClass} border-0 shadow-lg mb-2" role="alert" aria-live="assertive" aria-atomic="true" style="border-radius: 12px;">
            <div class="d-flex">
                <div class="toast-body fs-6 d-flex align-items-center px-3 py-2">
                    <i class="bi ${iconClass} fs-4 me-3"></i> ${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-3 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    const div = document.createElement('div');
    div.innerHTML = toastHtml;
    const toastEl = div.firstElementChild;
    container.appendChild(toastEl);
    
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
};

// ==========================================
// DELEGACIÓN DE EVENTOS PARA EL LOGOUT
// ==========================================
document.addEventListener('click', (evento) => {
    if (evento.target && evento.target.id === 'btn-logout') {
        evento.preventDefault();
        const token = localStorage.getItem('token_finca');
        
        if (token) {
            localStorage.removeItem('token_finca');
            localStorage.removeItem('rol_finca');
            localStorage.removeItem('id_usuario_finca');
            localStorage.removeItem('nombre_usuario_finca');
            
            mostrarNotificacion("Has cerrado sesión correctamente.", "success");
            
            setTimeout(() => {
                window.location.href = "login.html"; 
            }, 1500);
        } else {
            window.location.href = "login.html"; 
        }
    }
});