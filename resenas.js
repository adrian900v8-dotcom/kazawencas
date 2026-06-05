const URL_BACKEND = 'https://kazawencas.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. LÓGICA DE LAS ESTRELLAS INTERACTIVAS
    // ==========================================
    const estrellas = document.querySelectorAll('.star-interactive');
    const inputCalificacion = document.getElementById('calificacion');
    const errorCalificacion = document.getElementById('error-calificacion');

    estrellas.forEach(estrella => {
        estrella.addEventListener('mouseover', function() {
            const valor = this.getAttribute('data-value');
            pintarEstrellas(valor, 'hover');
        });

        estrella.addEventListener('mouseout', function() {
            pintarEstrellas(inputCalificacion.value, 'activa');
        });

        estrella.addEventListener('click', function() {
            const valor = this.getAttribute('data-value');
            inputCalificacion.value = valor;
            pintarEstrellas(valor, 'activa');
            if(errorCalificacion) errorCalificacion.classList.add('d-none'); 
        });
    });

    function pintarEstrellas(valorLimite, clase) {
        estrellas.forEach(estrella => {
            estrella.classList.remove('bi-star-fill', 'bi-star', 'hover', 'activa');
            if (estrella.getAttribute('data-value') <= (valorLimite || 0)) {
                estrella.classList.add('bi-star-fill', clase);
            } else {
                estrella.classList.add('bi-star');
                estrella.style.color = ''; 
            }
        });
    }

    // ==========================================
    // 2. LÓGICA DE ENVÍO AL BACKEND (CREAR)
    // ==========================================
    const formResena = document.getElementById('form-resena');
    const alertaResena = document.getElementById('alerta-resena');
    const btnEnviar = document.getElementById('btn-enviar-resena');

    if (formResena) {
        formResena.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const calificacion = inputCalificacion.value;
            const comentario = document.getElementById('comentario').value;
            
            if (!calificacion) {
                if(errorCalificacion) errorCalificacion.classList.remove('d-none');
                return; 
            }
            
            const idUsuario = localStorage.getItem('id_usuario_finca'); 
            const token = localStorage.getItem('token_finca');

            if (!idUsuario || !token) {
                mostrarAlerta('Debes iniciar sesión para dejar una reseña.', 'danger');
                return;
            }

            const nuevaResena = {
                idUsuario: parseInt(idUsuario), 
                calificacion: parseInt(calificacion),
                comentario: comentario
            };

            try {
                btnEnviar.disabled = true;
                btnEnviar.textContent = 'Enviando...';

                const respuesta = await fetch(`${URL_BACKEND}/resenas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevaResena)
                });

                if (respuesta.ok) {
                    mostrarAlerta('¡Gracias por tu opinión! Tu reseña ha sido publicada.', 'success');
                    
                    formResena.reset(); 
                    inputCalificacion.value = '';
                    pintarEstrellas(0, '');
                    
                    cargarResenas();
                    
                    setTimeout(() => {
                        const modalElement = document.getElementById('modalResena');
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) modal.hide();
                        alertaResena.classList.add('d-none');
                    }, 2000);
                } else {
                    const error = await respuesta.json();
                    mostrarAlerta(`Error: ${error.mensaje || 'No se pudo guardar la reseña'}`, 'danger');
                }
            } catch (error) {
                console.error('Error al enviar la reseña:', error);
                mostrarAlerta('Error de conexión con el servidor.', 'danger');
            } finally {
                btnEnviar.disabled = false;
                btnEnviar.textContent = 'Enviar Reseña';
            }
        });
    }

    function mostrarAlerta(mensaje, tipo) {
        if(alertaResena) {
            alertaResena.textContent = mensaje;
            alertaResena.className = `alert alert-${tipo} mt-3`; 
        }
    }

    cargarResenas();
});

// ==========================================
// NUEVO: SISTEMA DE CONFIRMACIÓN MODERNO (MODAL)
// ==========================================
window.mostrarConfirmacion = function(mensaje, callbackAceptar) {
    let modalEl = document.getElementById('modal-confirmacion');
    if (!modalEl) {
        const modalHtml = `
        <div class="modal fade" id="modal-confirmacion" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered px-3">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 1rem;">
              <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold text-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>Confirmar Acción
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body fs-6 text-secondary pb-4 pt-3" id="modal-confirmacion-mensaje" style="white-space: pre-wrap;">
                ${mensaje}
              </div>
              <div class="modal-footer border-0 pt-0 flex-nowrap">
                <button type="button" class="btn btn-light rounded-pill w-50 fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger rounded-pill w-50 fw-bold shadow-sm" id="btn-confirmar-accion">Sí, Eliminar</button>
              </div>
            </div>
          </div>
        </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = modalHtml;
        document.body.appendChild(div.firstElementChild);
        modalEl = document.getElementById('modal-confirmacion');
    }

    document.getElementById('modal-confirmacion-mensaje').innerText = mensaje;

    const btnAceptar = document.getElementById('btn-confirmar-accion');
    const nuevoBtnAceptar = btnAceptar.cloneNode(true);
    btnAceptar.parentNode.replaceChild(nuevoBtnAceptar, btnAceptar);

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    nuevoBtnAceptar.addEventListener('click', () => {
        bsModal.hide();
        callbackAceptar(); 
    });
};

// ==========================================
// 3. LÓGICA PARA CARGAR Y PINTAR RESEÑAS
// ==========================================
async function cargarResenas() {
    // Buscamos si estamos en la página de reseñas o en el index
    const contenedorResenasPagina = document.getElementById('contenedor-resenas');
    const contenedorResenasIndex = document.getElementById('slider-resenas-index');
    
    // Si no hay ninguno, no hacemos nada
    if (!contenedorResenasPagina && !contenedorResenasIndex) return;

    try {
        const respuesta = await fetch(`${URL_BACKEND}/resenas`);
        if (!respuesta.ok) throw new Error("Error al obtener reseñas");

        const resenas = await respuesta.json();
        const rolUsuario = localStorage.getItem('rol_finca');

        const mensajeVacio = '<div class="w-100 text-center text-muted">Aún no hay reseñas. ¡Sé el primero en dejar una!</div>';

        // Si estamos en el index y no hay reseñas
        if (resenas.length === 0 && contenedorResenasIndex) {
            contenedorResenasIndex.innerHTML = mensajeVacio;
            return;
        }

        // Si estamos en la página de reseñas y no hay
        if (resenas.length === 0 && contenedorResenasPagina) {
            contenedorResenasPagina.innerHTML = mensajeVacio;
            return;
        }

        // Lógica para pintar en la PÁGINA DE RESEÑAS (resenas.html) - Estilo Cuadrícula Bootstrap
        if (contenedorResenasPagina) {
             contenedorResenasPagina.innerHTML = resenas.map(resena => {
                let estrellasHTML = '';
                for (let i = 1; i <= 5; i++) {
                    estrellasHTML += `<i class="bi ${i <= resena.calificacion ? 'bi-star-fill' : 'bi-star'}"></i>`;
                }

                let botonEliminarHTML = '';
                if (rolUsuario && rolUsuario.toLowerCase() === 'admin') {
                    botonEliminarHTML = `
                        <div class="mt-4 pt-3 border-top">
                            <button class="btn btn-sm btn-outline-danger fw-bold w-100" onclick="eliminarResena(${resena.idResena})">
                                <i class="bi bi-trash3-fill"></i> Eliminar
                            </button>
                        </div>
                    `;
                }

                return `
                    <div class="col-md-4">
                        <div class="resena-card h-100 d-flex flex-column">
                            <div class="stars-color mb-3">${estrellasHTML}</div>
                            <p class="resena-texto flex-grow-1">"${resena.comentario}"</p>
                            <strong class="resena-autor">${resena.nombreUsuario || 'Cliente KAZAWENCA'}</strong>
                            ${botonEliminarHTML}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Lógica para pintar en el INDEX (index.html) - Estilo Slider Horizontal
        if (contenedorResenasIndex) {
            // Quitamos el spinner
            const spinnerIndex = document.getElementById('spinner-resenas-index');
            if(spinnerIndex) spinnerIndex.remove();

            contenedorResenasIndex.innerHTML = resenas.map(resena => {
                let estrellasHTML = '';
                for (let i = 1; i <= 5; i++) {
                    estrellasHTML += `<i class="bi ${i <= resena.calificacion ? 'bi-star-fill' : 'bi-star'}"></i>`;
                }

                return `
                    <div class="card testimonial-card">
                        <div class="card-body d-flex flex-column">
                            <div class="stars-color mb-3">
                                ${estrellasHTML}
                            </div>
                            <p class="testimonial-card__text flex-grow-1">"${resena.comentario}"</p>
                            <div class="mt-4">
                                <strong class="d-block text-dark" style="font-size: 0.95rem;">${resena.nombreUsuario || 'Cliente KAZAWENCA'}</strong>
                                <span class="small text-accent text-uppercase mt-1 d-block" style="font-size: 0.7rem; letter-spacing: 1px;">HUÉSPED CONFIRMADO</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

    } catch (error) {
        console.error("Error cargando reseñas:", error);
        if(contenedorResenasPagina) contenedorResenasPagina.innerHTML = '<div class="col-12 text-center text-danger">Error al cargar las experiencias.</div>';
        if(contenedorResenasIndex) contenedorResenasIndex.innerHTML = '<div class="w-100 text-center text-danger">Error al cargar las experiencias.</div>';
    }
}

// ==========================================
// 4. LÓGICA PARA ELIMINAR RESEÑA (ACTUALIZADA)
// ==========================================
window.eliminarResena = function(idResena) {
    const mensaje = "¿Estás seguro de que deseas eliminar esta reseña de forma permanente?";
    
    // Usamos el nuevo modal
    mostrarConfirmacion(mensaje, async () => {
        const token = localStorage.getItem('token_finca');

        try {
            const respuesta = await fetch(`${URL_BACKEND}/resenas/${idResena}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (respuesta.ok) {
                if(window.mostrarNotificacion) mostrarNotificacion("Reseña eliminada con éxito.", "success");
                cargarResenas(); 
            } else {
                if(window.mostrarNotificacion) mostrarNotificacion("Error al intentar eliminar la reseña. Verifica tus permisos.", "danger");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
            if(window.mostrarNotificacion) mostrarNotificacion("Fallo de conexión con el servidor.", "danger");
        }
    });
};