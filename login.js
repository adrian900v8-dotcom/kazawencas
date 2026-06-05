const URL_BACKEND = 'https://kazawencas.onrender.com/api';

// ==========================================
// 1. LÓGICA DE INICIO DE SESIÓN TRADICIONAL
// ==========================================
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Efecto visual: Deshabilitamos el botón mientras carga
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Entrando...';

    const credenciales = {
        correo: correo,
        passwordHash: password 
    };

    try {
        const respuesta = await fetch(`${URL_BACKEND}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credenciales)
        });

        if (respuesta.status === 200) {
            const datos = await respuesta.json();
            
            localStorage.setItem('token_finca', datos.token);
            localStorage.setItem('rol_finca', datos.rol); 
            localStorage.setItem('id_usuario_finca', datos.id_usuario); 
            localStorage.setItem('nombre_usuario_finca', datos.nombre); 

            if (window.mostrarNotificacion) mostrarNotificacion("¡Bienvenido de vuelta!", "success");

            setTimeout(() => {
                window.location.href = 'reservas.html';
            }, 1000);
            
        } else if (respuesta.status === 403) {
            // AQUÍ ATRAPAMOS EL MENSAJE DE GOOGLE
            const mensajeError = await respuesta.text();
            if (window.mostrarNotificacion) mostrarNotificacion(mensajeError, "warning");
            
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
            
        } else {
            // Cualquier otro error (contraseña incorrecta normal)
            if (window.mostrarNotificacion) mostrarNotificacion("Correo o contraseña incorrectos.", "danger");
            
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        if (window.mostrarNotificacion) mostrarNotificacion("Error de conexión con el servidor.", "danger");
        
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
    }
});

// ==========================================
// 2. LÓGICA DE INICIO DE SESIÓN CON GOOGLE
// ==========================================
window.handleCredentialResponse = async (response) => {
    // response.credential contiene el token encriptado de Google
    const tokenDeGoogle = response.credential;

    try {
        // Mostramos un mensajito mientras procesa
        if (window.mostrarNotificacion) mostrarNotificacion("Validando cuenta con Google...", "info");

        const res = await fetch(`${URL_BACKEND}/login/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenDeGoogle })
        });

        if (res.ok) {
            const datos = await res.json();
            
            // Guardamos en la mochila igual que en el login tradicional
            localStorage.setItem('token_finca', datos.token);
            localStorage.setItem('rol_finca', datos.rol);
            localStorage.setItem('id_usuario_finca', datos.id_usuario);
            localStorage.setItem('nombre_usuario_finca', datos.nombre);

            if (window.mostrarNotificacion) mostrarNotificacion("¡Bienvenido con Google!", "success");
            
            setTimeout(() => {
                window.location.href = 'reservas.html';
            }, 1000);
        } else {
            if (window.mostrarNotificacion) mostrarNotificacion("Autenticación con Google fallida.", "danger");
        }
    } catch (error) {
        console.error("Error al conectar con Google:", error);
        if (window.mostrarNotificacion) mostrarNotificacion("Error de conexión con el servidor.", "danger");
    }
};