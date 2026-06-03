const URL_BACKEND = 'https://kazawencas.onrender.com/api';

// FIX: Actualizado al nuevo ID 'form-login'
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();

    // FIX: Actualizado al nuevo ID 'email'
    const correo = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Efecto visual: Deshabilitamos el botón mientras carga
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Entrando...';

    // Preparamos los datos recordando que el backend de Java espera "passwordHash"
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
            // ¡Login exitoso! Javalin nos devolvió el JSON con el token y datos
            const datos = await respuesta.json();
            
            // Guardamos toda la información en la mochila del navegador (localStorage)
            localStorage.setItem('token_finca', datos.token);
            localStorage.setItem('rol_finca', datos.rol); 
            localStorage.setItem('id_usuario_finca', datos.id_usuario); 
            localStorage.setItem('nombre_usuario_finca', datos.nombre); 

            // Mostramos la notificación premium
            if (window.mostrarNotificacion) mostrarNotificacion("¡Bienvenido de vuelta!", "success");

            // Redirigimos al usuario a la página de reservas después de 1 segundo
            setTimeout(() => {
                window.location.href = 'reservas.html';
            }, 1000);
            
        } else {
            // El backend devolvió un 401 (No autorizado) - Usamos Toast
            if (window.mostrarNotificacion) mostrarNotificacion("Correo o contraseña incorrectos.", "danger");
            
            // Restauramos el botón
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        if (window.mostrarNotificacion) mostrarNotificacion("Error de conexión con el servidor.", "danger");
        
        // Restauramos el botón
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
    }
});