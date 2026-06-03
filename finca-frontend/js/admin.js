const URL_BACKEND = 'https://kazawencas.onrender.com';
const token = localStorage.getItem('token_finca');
const rol = localStorage.getItem('rol_finca');

// Variable global para almacenar las reservas completas y poder editarlas
let listaReservas = [];

// Seguridad: Validar que sea admin
if (!token || !rol || rol.toLowerCase() !== 'admin') {
    alert("Acceso exclusivo para administradores.");
    window.location.href = 'index.html';
}

// ==========================================
// NUEVO: SISTEMA DE CONFIRMACIÓN (BLINDADO)
// ==========================================
window.mostrarConfirmacion = function(mensaje, callbackAceptar) {
    let modalEl = document.getElementById('modal-confirmacion-admin');
    
    // 1. Si no existe en el HTML, lo inyectamos de forma segura
    if (!modalEl) {
        const modalHtml = `
        <div class="modal fade" id="modal-confirmacion-admin" tabindex="-1" aria-hidden="true" style="z-index: 1055;">
          <div class="modal-dialog modal-dialog-centered px-3">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 1rem;">
              <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold text-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>Confirmar Acción
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body fs-6 text-secondary pb-4 pt-3" id="modal-confirmacion-mensaje-admin" style="white-space: pre-wrap;">
                </div>
              <div class="modal-footer border-0 pt-0 flex-nowrap">
                <button type="button" class="btn btn-light rounded-pill w-50 fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger rounded-pill w-50 fw-bold shadow-sm" id="btn-confirmar-accion-admin">Sí, Eliminar</button>
              </div>
            </div>
          </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalEl = document.getElementById('modal-confirmacion-admin');
    }

    // 2. Actualizamos el texto
    document.getElementById('modal-confirmacion-mensaje-admin').innerText = mensaje;

    // 3. Limpiamos cualquier "clic" anterior
    const btnAceptar = document.getElementById('btn-confirmar-accion-admin');
    const nuevoBtnAceptar = btnAceptar.cloneNode(true);
    btnAceptar.parentNode.replaceChild(nuevoBtnAceptar, btnAceptar);

    // 4. Intentamos mostrar el modal con Bootstrap
    try {
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();

        // 5. Si da clic en aceptar, cerramos y ejecutamos
        nuevoBtnAceptar.addEventListener('click', () => {
            bsModal.hide();
            callbackAceptar(); 
        });
    } catch (error) {
        console.error("Error al abrir modal Bootstrap:", error);
        // SALVAVIDAS: Si Bootstrap falla, usamos el nativo pero evitamos el bloqueo total
        if(confirm(mensaje)) {
            callbackAceptar();
        }
    }
};

// ==========================================
// 1. CARGAR RESERVAS EN LA TABLA
// ==========================================
async function cargarReservas() {
    try {
        const respuesta = await fetch(`${URL_BACKEND}/reservas`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error("Error al obtener reservas");
        
        listaReservas = await respuesta.json(); 
        const tabla = document.getElementById('tabla-reservas');

        if (tabla) {
            if (listaReservas.length === 0) {
                tabla.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center py-5">
                            <i class="bi bi-calendar-x text-muted mb-3" style="font-size: 4rem; opacity: 0.5;"></i>
                            <h4 class="text-dark fw-bold">Aún no hay reservas</h4>
                            <p class="text-muted">Cuando los clientes agenden sus fechas, aparecerán aquí.</p>
                        </td>
                    </tr>
                `;
                return; 
            }

            tabla.innerHTML = listaReservas.map((r, index) => `
                <tr>
                    <td class="fw-bold text-secondary">#${r.idReserva}</td>
                    <td>${r.nombreUsuario || 'Sin nombre'}</td> 
                    <td>${r.notasAdmin ? r.notasAdmin.toUpperCase() : 'N/A'}</td> 
                    <td>${r.fechaInicio}</td>
                    <td>${r.fechaFin}</td>
                    <td class="fw-bold text-success">
                        ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(r.precioTotal)}
                    </td>
                    <td>
                        <select class="form-select form-select-sm shadow-sm border-0 fw-bold" 
                                onchange="cambiarEstado(${r.idReserva}, this.value, ${index})"
                                style="border-radius: 50rem; cursor: pointer; color: var(--color-dark); background-color: var(--color-light);">
                            <option value="pendiente" ${r.estado.toLowerCase() === 'pendiente' ? 'selected' : ''}>PENDIENTE</option>
                            <option value="confirmada" ${r.estado.toLowerCase() === 'confirmada' ? 'selected' : ''}>CONFIRMADA</option>
                            <option value="cancelada" ${r.estado.toLowerCase() === 'cancelada' ? 'selected' : ''}>CANCELADA</option>
                        </select>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger shadow-sm" onclick="eliminarReserva(${r.idReserva})" title="Eliminar Reserva">
                            <i class="bi bi-trash3-fill"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `).join('');
        }
            
    } catch (e) {
        console.error("Error al cargar reservas:", e);
        const tabla = document.getElementById('tabla-reservas');
        if (tabla) {
            tabla.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">Error al cargar datos del servidor.</td></tr>`;
        }
    }
}

// ==========================================
// 2. FUNCIÓN PARA CAMBIAR ESTADO
// ==========================================
window.cambiarEstado = async function(idReserva, nuevoEstado, index) {
    const reservaActual = listaReservas[index];
    reservaActual.estado = nuevoEstado; 

    try {
        const respuesta = await fetch(`${URL_BACKEND}/reservas/${idReserva}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaActual) 
        });

        if (respuesta.ok) {
            if (window.mostrarNotificacion) mostrarNotificacion(`Reserva #${idReserva} marcada como ${nuevoEstado.toUpperCase()}`, "success");
        } else {
            if (window.mostrarNotificacion) mostrarNotificacion("Error al actualizar el estado.", "danger");
            cargarReservas(); 
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
        cargarReservas();
    }
};

// ==========================================
// 3. FUNCIÓN PARA ELIMINAR RESERVA
// ==========================================
window.eliminarReserva = function(idReserva) {
    const mensaje = `¿Estás completamente seguro de que deseas ELIMINAR la reserva #${idReserva}?\n\nEsta acción no se puede deshacer.`;
    
    mostrarConfirmacion(mensaje, async () => {
        try {
            const respuesta = await fetch(`${URL_BACKEND}/reservas/${idReserva}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (respuesta.ok) {
                if(window.mostrarNotificacion) mostrarNotificacion("Reserva eliminada con éxito.", "success");
                cargarReservas(); 
            } else {
                const err = await respuesta.json().catch(()=>({}));
                if(window.mostrarNotificacion) mostrarNotificacion(`Error: ${err.message || 'No se pudo eliminar'}`, "danger");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
            if(window.mostrarNotificacion) mostrarNotificacion("Fallo de conexión con el servidor.", "danger");
        }
    });
};

cargarReservas();