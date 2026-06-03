const URL_BACKEND = 'https://kazawencas.onrender.com';

// FIX: Actualizado al nuevo ID 'form-registro'
document.getElementById('form-registro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    // FIX: Actualizado al nuevo ID 'email'
    const correo = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Efecto visual: Deshabilitamos el botón mientras carga
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Registrando...';

    // Empaquetamos los datos. Forzamos el rol "cliente" por seguridad para nuevos registros.
    const nuevoUsuario = {
        nombre: nombre,
        correo: correo,
        passwordHash: password,
        rol: "cliente"
    };

    try {
        const respuesta = await fetch(`${URL_BACKEND}/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario)
        });

        // Si Javalin responde que se creó correctamente (201 o 200)
        if (respuesta.status === 201 || respuesta.status === 200) {
            // FIX: Usamos la notificación premium
            if (window.mostrarNotificacion) mostrarNotificacion("¡Cuenta creada con éxito! Redirigiendo...", "success");
            
            document.getElementById('form-registro').reset();
            
            // Esperamos 2 segundos (2000 ms) y lo mandamos al login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } else {
            // Error controlado por el backend (ej. correo duplicado)
            if (window.mostrarNotificacion) mostrarNotificacion("Ocurrió un error. Es posible que este correo ya esté registrado.", "warning");
            
            // Restauramos el botón
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
        }
    } catch (error) {
        console.error("Error al registrarse:", error);
        
        // Error grave de red o de servidor caído
        if (window.mostrarNotificacion) mostrarNotificacion("Error de conexión con el servidor.", "danger");
        
        // Restauramos el botón
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
    }
});