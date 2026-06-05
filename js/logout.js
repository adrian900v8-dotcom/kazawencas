// Esperamos a que la página cargue para buscar el botón
document.addEventListener('DOMContentLoaded', () => {
    const btnLogout = document.getElementById('btn-logout');
    
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            // 1. Vaciamos la mochila (eliminamos el token y el rol)
            localStorage.removeItem('token_finca');
            localStorage.removeItem('rol_usuario');
            
            // 2. Avisamos al usuario
            alert("Has cerrado sesión correctamente.");
            
            // 3. Lo mandamos de vuelta al Login
            window.location.href = 'login.html';
        });
    }
});