document.addEventListener("DOMContentLoaded", () => {
    // Buscamos el contenedor del menú
    const menuContenedor = document.getElementById("menu-contenedor") || document.getElementById("navbar-container");

    if (menuContenedor) {
        // Inyectamos el menú
        fetch("navbar.html")
            .then(respuesta => {
                if (!respuesta.ok) throw new Error("Error al cargar el navbar");
                return respuesta.text();
            })
            .then(codigoHtml => {
                menuContenedor.innerHTML = codigoHtml;
                
                // ==========================================
                // FIX 1: CONTROL DE VISIBILIDAD DEL PANEL ADMIN
                // ==========================================
                const navAdmin = document.getElementById('nav-admin');
                const rolUsuario = localStorage.getItem('rol_finca'); // Leemos el rol guardado en el login
                
                if (navAdmin) {
                    // Solo mostramos el panel si el rol existe y es 'admin'
                    if (rolUsuario && rolUsuario.toLowerCase() === 'admin') {
                        navAdmin.style.display = 'block'; 
                    } else {
                        navAdmin.style.display = 'none';
                    }
                }

                // ==========================================
                // FIX OPCIONAL: CAMBIAR TEXTO SI NO HAY SESIÓN
                // ==========================================
                const btnLogout = document.getElementById('btn-logout');
                const token = localStorage.getItem('token_finca');
                
                if (btnLogout && !token) {
                    // Si no hay sesión iniciada, cambiamos el texto a "Iniciar Sesión"
                    btnLogout.textContent = 'Iniciar Sesión';
                }
            })
            .catch(error => console.error("Error inyectando el navbar:", error));
    }
});

// ==========================================
// SISTEMA GLOBAL DE NOTIFICACIONES (TOASTS)
// ==========================================
window.mostrarNotificacion = function(mensaje, tipo = 'success') {
    // 1. Verificamos si ya existe el contenedor de notificaciones, si no, lo creamos
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        container.style.marginTop = '80px'; // Para que aparezca debajo del navbar
        document.body.appendChild(container);
    }
    
    // 2. Configuramos colores e iconos según el tipo
    const bgClass = tipo === 'success' ? 'bg-success' : (tipo === 'danger' ? 'bg-danger' : 'bg-primary');
    const iconClass = tipo === 'success' ? 'bi-check-circle-fill' : (tipo === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill');

    // 3. Creamos el HTML de la notificación
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
    
    // 4. Lo inyectamos y lo mostramos
    const div = document.createElement('div');
    div.innerHTML = toastHtml;
    const toastEl = div.firstElementChild;
    container.appendChild(toastEl);
    
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 }); // Desaparece en 4 segundos
    toast.show();
    
    // Lo borramos del HTML cuando termine la animación
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
};

// ==========================================
// DELEGACIÓN DE EVENTOS PARA EL BOTÓN LOGOUT/LOGIN
// ==========================================
document.addEventListener('click', (evento) => {
    if (evento.target && evento.target.id === 'btn-logout') {
        evento.preventDefault();
        
        const token = localStorage.getItem('token_finca');
        
        // BORRADO REAL DE LA SESIÓN
        if (token) {
            console.log("Cerrando sesión de verdad...");
            
            // Borramos TODOS los datos que creamos en login.js
            localStorage.removeItem('token_finca');
            localStorage.removeItem('rol_finca');
            localStorage.removeItem('id_usuario_finca');
            localStorage.removeItem('nombre_usuario_finca');
            
            // Llamamos a la nueva notificación en lugar del alert
            mostrarNotificacion("Has cerrado sesión correctamente.", "success");
            
            // Redirigir al login después de 1.5 segundos para que alcance a leer el mensaje
            setTimeout(() => {
                window.location.href = "login.html"; 
            }, 1500);
            
        } else {
            // Si no había token, simplemente lo mandamos al login
            window.location.href = "login.html"; 
        }
    }
});
