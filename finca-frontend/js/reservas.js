const URL_BACKEND = 'https://kazawencas.onrender.com/api';
const tokenGuardado = localStorage.getItem('token_finca');
const NUMERO_WHATSAPP = '573184643996'; // Tu número de WhatsApp configurado

if (!tokenGuardado) {
    window.location.href = 'login.html';
}

// Elementos del DOM
const inputLlegada = document.getElementById('fechaInicio');
const inputSalida  = document.getElementById('fechaFin');
const selectTarifa = document.getElementById('idTarifa');
const displayResumen = document.getElementById('resumen-reserva');
const btnConfirmar = document.querySelector('button[type="submit"]');
const colSalida    = inputSalida.closest('.col-md-6');

// ==========================================
// 1. CONTROLAR VISIBILIDAD SEGÚN TIPO
// ==========================================
function actualizarTipoReserva() {
    const esPasadia = selectTarifa.value === "1";

    if (esPasadia) {
        colSalida.style.display = 'none';
        inputSalida.removeAttribute('required');
        inputSalida.value = '';
    } else {
        colSalida.style.display = '';
        inputSalida.setAttribute('required', '');
    }

    calcularPrecio();
}

selectTarifa.addEventListener('change', actualizarTipoReserva);

// ==========================================
// 2. BLOQUEAR FECHAS PASADAS Y OCUPADAS
// ==========================================
async function configurarFechas() {
    const hoy = new Date().toISOString().split('T')[0];

    // Bloqueamos fechas del pasado desde el inicio
    inputLlegada.min = hoy;
    inputSalida.min  = hoy;

    try {
        const res = await fetch(`${URL_BACKEND}/reservas/ocupadas`);
        if (!res.ok) return;
        const ocupadas = await res.json();

        inputLlegada.addEventListener('change', () => {
            const llegada = inputLlegada.value;

            if (selectTarifa.value === "1") {
                inputSalida.value = llegada;
                calcularPrecio();
                return;
            }

            // La fecha mínima de salida debe ser al menos el día siguiente a la llegada
            const minSalida = new Date(llegada);
            minSalida.setDate(minSalida.getDate() + 1);
            const minSalidaStr = minSalida.toISOString().split('T')[0];
            
            inputSalida.min = minSalidaStr;

            // FIX: Auto-ajustar salida si quedó inválida
            if (inputSalida.value && inputSalida.value <= llegada) {
                inputSalida.value = minSalidaStr;
                if(window.mostrarNotificacion) {
                    mostrarNotificacion("La fecha de salida fue ajustada automáticamente.", "info");
                }
            }
            calcularPrecio();
        });

        inputSalida.addEventListener('change', () => {
            const llegada = new Date(inputLlegada.value);
            const salida  = new Date(inputSalida.value);

            const cruzaFechaOcupada = ocupadas.some(fechaStr => {
                const ocupada = new Date(fechaStr);
                return ocupada >= llegada && ocupada < salida;
            });

            if (cruzaFechaOcupada) {
                if(window.mostrarNotificacion) mostrarNotificacion('El rango seleccionado incluye fechas no disponibles.', 'warning');
                inputSalida.value = '';
                displayResumen.classList.add('d-none');
                return;
            }
            calcularPrecio();
        });

    } catch (error) {
        console.error("No se pudieron cargar fechas ocupadas:", error);

        inputLlegada.addEventListener('change', () => {
            if (selectTarifa.value === "1") {
                inputSalida.value = inputLlegada.value;
                calcularPrecio();
                return;
            }
            const minSalida = new Date(inputLlegada.value);
            minSalida.setDate(minSalida.getDate() + 1);
            const minSalidaStr = minSalida.toISOString().split('T')[0];
            
            inputSalida.min = minSalidaStr;
            
            if (inputSalida.value && inputSalida.value <= inputLlegada.value) {
                inputSalida.value = minSalidaStr;
                if(window.mostrarNotificacion) mostrarNotificacion("La fecha de salida fue ajustada automáticamente.", "info");
            }
            
            calcularPrecio();
        });

        inputSalida.addEventListener('change', calcularPrecio);
    }
}

// ==========================================
// 3. CALCULAR PRECIO EN TIEMPO REAL
// ==========================================
function calcularPrecio() {
    const tarifaId  = selectTarifa.value;
    const esPasadia = tarifaId === "1";

    if (esPasadia && inputLlegada.value) {
        const precioUnitario = 500000;
        displayResumen.classList.remove('d-none');
        document.getElementById('num-noches').innerText    = '1';
        document.getElementById('precio-unidad').innerText = formatCOP(precioUnitario);
        document.getElementById('precio-total').innerText  = formatCOP(precioUnitario);
        return precioUnitario;
    }

    const inicio = new Date(inputLlegada.value);
    const fin    = new Date(inputSalida.value);

    if (inputLlegada.value && inputSalida.value && tarifaId && fin > inicio) {
        const precioUnitario = 800000;
        const diffTime = Math.abs(fin - inicio);
        let diffDays   = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) diffDays = 1;

        const total = diffDays * precioUnitario;

        displayResumen.classList.remove('d-none');
        document.getElementById('num-noches').innerText    = diffDays;
        document.getElementById('precio-unidad').innerText = formatCOP(precioUnitario);
        document.getElementById('precio-total').innerText  = formatCOP(total);
        return total;
    }

    displayResumen.classList.add('d-none');
    return 0;
}

// ==========================================
// 4. FORMATO DE MONEDA
// ==========================================
function formatCOP(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor);
}

// ==========================================
// 5. ENVÍO DEL FORMULARIO
// ==========================================
document.getElementById('formulario-reserva').addEventListener('submit', async (e) => {
    e.preventDefault();

    const esPasadia = selectTarifa.value === "1";

    if (!inputLlegada.value || !selectTarifa.value) {
        if(window.mostrarNotificacion) mostrarNotificacion('Por favor completa todos los campos principales.', 'warning');
        return;
    }

    if (!esPasadia && !inputSalida.value) {
        if(window.mostrarNotificacion) mostrarNotificacion('Selecciona una fecha de salida.', 'warning');
        return;
    }

    const fechaFin = esPasadia ? inputLlegada.value : inputSalida.value;

    if (!esPasadia && fechaFin <= inputLlegada.value) {
        if(window.mostrarNotificacion) mostrarNotificacion('La fecha de salida debe ser posterior a la de llegada.', 'danger');
        return;
    }

    const total = calcularPrecio();
    if (total === 0) {
        if(window.mostrarNotificacion) mostrarNotificacion('Las fechas seleccionadas no son válidas.', 'danger');
        return;
    }

    btnConfirmar.disabled        = true;
    btnConfirmar.innerHTML       = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Procesando...';

    try {
        const payload = JSON.parse(window.atob(tokenGuardado.split('.')[1]));
        const nombreUsuario = localStorage.getItem('nombre_usuario_finca') || 'Cliente'; // Intentamos sacar el nombre guardado

        const nuevaReserva = {
            idUsuario:   payload.id_usuario,
            fechaInicio: inputLlegada.value,
            fechaFin:    fechaFin,
            precioTotal: total,
            idTarifa:    parseInt(selectTarifa.value),
            estado:      'pendiente', // Ahora las reservas nacen en estado pendiente
            notasAdmin:  'Reserva web (Pendiente de pago)'
        };

        const res = await fetch(`${URL_BACKEND}/reservas`, {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${tokenGuardado}`
            },
            body: JSON.stringify(nuevaReserva)
        });

        if (res.ok) {
            // Reserva creada en la BD. Ahora enviamos al usuario a WhatsApp.
            if(window.mostrarNotificacion) mostrarNotificacion('¡Pre-reserva creada! Redirigiendo a WhatsApp para el pago...', 'success');
            
            // Construimos el mensaje para WhatsApp
            const tipoReservaTexto = esPasadia ? 'Pasadía' : 'Hospedaje';
            let mensajeWhatsApp = `Hola Kazawenca's 👋🏼, mi nombre es *${nombreUsuario}*.\n\n`;
            mensajeWhatsApp += `He realizado una solicitud de reserva desde la página web y quiero coordinar el abono para confirmarla:\n`;
            mensajeWhatsApp += `📌 *Tipo:* ${tipoReservaTexto}\n`;
            mensajeWhatsApp += `📅 *Llegada:* ${inputLlegada.value}\n`;
            if (!esPasadia) mensajeWhatsApp += `📅 *Salida:* ${fechaFin}\n`;
            mensajeWhatsApp += `💰 *Total estimado:* ${formatCOP(total)}\n\n`;
            mensajeWhatsApp += `Quedo atento(a) a las instrucciones de pago.`;

            // Codificamos el mensaje para que los espacios y saltos de línea funcionen en la URL
            const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensajeWhatsApp)}`;

            document.getElementById('formulario-reserva').reset();
            displayResumen.classList.add('d-none');
            colSalida.style.display = '';
            
            // Redirigir a WhatsApp después de 2.5 segundos para que alcancen a leer la notificación verde
            setTimeout(() => {
                window.location.href = urlWhatsApp;
            }, 2500);
            
        } else {
            const errorData = await res.json().catch(() => ({}));
            console.error('Error backend:', errorData);
            if(window.mostrarNotificacion) mostrarNotificacion(`Error: ${errorData.message || 'Intenta de nuevo.'}`, 'danger');
            btnConfirmar.disabled    = false;
            btnConfirmar.textContent = 'Confirmar Reserva';
        }

    } catch (err) {
        console.error('Error de red:', err);
        if(window.mostrarNotificacion) mostrarNotificacion('No se pudo conectar con el servidor.', 'danger');
        btnConfirmar.disabled    = false;
        btnConfirmar.textContent = 'Confirmar Reserva';
    } 
});

// ==========================================
// INICIALIZAR
// ==========================================
configurarFechas();
actualizarTipoReserva();