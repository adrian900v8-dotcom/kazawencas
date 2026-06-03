const URL_BACKEND = 'https://kazawencas.onrender.com/api';

// ==========================================
// 1. FUNCIÓN PARA CARGAR TARIFAS
// ==========================================
async function cargarTarifas() {
    try {
        const respuesta = await fetch(`${URL_BACKEND}/tarifas`);
        const tarifas = await respuesta.json();
        
        const contenedor = document.getElementById('contenedor-tarifas');
        if(!contenedor) return; 
        
        contenedor.innerHTML = ''; 

        tarifas.forEach(tarifa => {
            const col = document.createElement('div');
            col.className = 'col-md-6';
            
            col.innerHTML = `
                <div class="card h-100 shadow-sm border-primary">
                    <div class="card-body text-center d-flex flex-column justify-content-center">
                        <h4 class="card-title text-primary text-uppercase fw-bold mb-3">${tarifa.tipoTemporada}</h4>
                        <h2 class="card-text text-dark mb-0">$${tarifa.precioPorNoche.toLocaleString('es-CO')}</h2>
                        <small class="text-muted">COP / noche</small>
                    </div>
                </div>
            `;
            contenedor.appendChild(col);
        });
    } catch (error) {
        console.error("Error al cargar tarifas:", error);
    }
}

// ==========================================
// 2. FUNCIÓN PARA CARGAR MULTIMEDIA (CARRUSEL ESTILO APPLE)
// ==========================================
async function cargarFotos() {
    try {
        const respuesta = await fetch(`${URL_BACKEND}/multimedia`);
        const fotos = await respuesta.json();
        
        const contenedor = document.getElementById('contenedor-fotos');
        if (!contenedor) return;

        if (fotos.length === 0) {
            contenedor.innerHTML = '<p class="text-muted text-center w-100">Aún no hay fotos en la galería.</p>';
            return;
        }

        contenedor.innerHTML = fotos.map(foto => `
            <div class="swiper-slide">
                <div class="card">
                    <img src="${foto.urlArchivo}" class="card-img-top" alt="${foto.descripcion || 'Instalaciones Finca'}">
                    <div class="card-body">
                        <h5>${foto.descripcion || 'Instalaciones'}</h5>
                    </div>
                </div>
            </div>
        `).join('');

        new Swiper(".mySwiper", {
    effect: "slide",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 1.15,
    spaceBetween: 12,         // ← separación entre fotos
    rewind: true,
    speed: 600,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },
    pagination: {
        el: ".gallery__pagination",
        clickable: true,
    },
    breakpoints: {
        768: {
            slidesPerView: 1.2,
            spaceBetween: 16, // ← un poco más en tablet
        },
        1200: {
            slidesPerView: 1.25,
            spaceBetween: 20, // ← un poco más en desktop
        }
    },
    observer: true,
    observeParents: true,
});

    } catch (error) {
        console.error("Error al cargar fotos:", error);
    }
}

// ==========================================
// 3. FUNCIÓN PARA RESEÑAS
// ==========================================
function generarEstrellas(calificacion) {
    let estrellasHTML = '';
    for (let i = 0; i < 5; i++) {
        estrellasHTML += i < calificacion 
            ? '<i class="bi bi-star-fill" style="color: #ffc107;"></i>' 
            : '<i class="bi bi-star-fill" style="color: #e4e5e9;"></i>';
    }
    return estrellasHTML;
}

async function cargarResenas() {
    try {
        const respuesta = await fetch(`${URL_BACKEND}/resenas`);
        const resenas = await respuesta.json();
        
        const contenedor = document.getElementById('contenedor-resenas');
        if(!contenedor) return; 
        
        const spinner = document.getElementById('spinner-resenas');
        if (spinner) spinner.remove();
        contenedor.innerHTML = ''; 

        resenas.forEach(resena => {
            const col = document.createElement('div');
            col.className = 'col-md-4'; 
            col.innerHTML = `
                <div class="card h-100 p-4 shadow-sm border-0" style="background-color: #ffffff; border-radius: 15px;">
                    <div class="mb-3 text-center">${generarEstrellas(resena.calificacion)}</div>
                    <p class="fst-italic text-muted text-center mb-4">"${resena.comentario}"</p>
                    <hr class="text-success">
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <small class="text-success fw-bold text-uppercase">
                            <i class="bi bi-person-circle me-1"></i> ${resena.nombre || 'Cliente'}
                        </small>
                    </div>
                </div>
            `;
            contenedor.appendChild(col);
        });
    } catch (error) { console.error("Error reseñas:", error); }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarTarifas();
    cargarFotos();
    cargarResenas(); 
});