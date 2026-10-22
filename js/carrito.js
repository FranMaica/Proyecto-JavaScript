
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Adaptar los productos que ya estaban guardados
carrito = carrito.map(juego => ({
    ...juego,
    cantidad: Math.max(1, Number(juego.cantidad) || 1),
    precio: Number(juego.precio)
}));

guardarCarrito();

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Agregar un juego o aumentar su cantidad



function agregarAlCarrito(nombre, img, genero, precio) {
    if (!nombre || !img || !genero || precio === undefined) {
        console.error('Datos incompletos para agregar al carrito');
        return;
    }

    const juegoExistente = carrito.find(
        juego => juego.nombre === nombre
    );

    // Limitar a 5 unidades de cada juego
    if (juegoExistente && juegoExistente.cantidad >= 5) {
        mostrarAlertaCarrito();
        return;
    }

    if (juegoExistente) {
        juegoExistente.cantidad++;
    } else {
        carrito.push({
            nombre,
            img,
            genero,
            precio: Number(precio),
            cantidad: 1
        });
    }

    guardarCarrito();
    mostrarCarrito();
    actualizarContadorCarrito();
}




// Guardar y mostrar todos los productos
function mostrarCarrito() {
    const contenedor = document.getElementById('cart-container');

    if (!contenedor) return;

    // En index.html la tabla ya existe.
    // En carrito.html hay que crearla.
    let tbody = contenedor.querySelector('tbody');

    if (!tbody) {
        contenedor.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;

        tbody = contenedor.querySelector('tbody');
    }

    tbody.innerHTML = '';

    let total = 0;

    carrito.forEach((juego, index) => {
        const fila = document.createElement('tr');

        const subtotal = juego.precio * juego.cantidad;
        total += subtotal;

        fila.innerHTML = `
            <td>
                <img class="img-cart"
                     src="${juego.img}"
                     alt="${juego.nombre}">
            </td>
            <td>${juego.nombre}</td>
            <td>$${subtotal.toFixed(2)}</td>
            <td>${juego.cantidad}</td>
            <td>
                <div class="cart-actions">
                    <button type="button"
                            data-accion="restar"
                            data-index="${index}"
                            aria-label="Restar una unidad">−</button>

                    <button type="button"
                            data-accion="sumar"
                            data-index="${index}"
                            aria-label="Sumar una unidad">+</button>

                    <button type="button"
                            data-accion="eliminar"
                            data-index="${index}"
                            aria-label="Eliminar producto">🗑️</button>
                </div>
            </td>
        `;

        tbody.appendChild(fila);
    });

    // Mostrar el total en carrito.html
    const totalElement = document.getElementById('total-price');

    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Mostrar el total también en el desplegable de Inicio
    let totalDropdown = contenedor.querySelector('.cart-total');

    if (!totalDropdown) {
        totalDropdown = document.createElement('p');
        totalDropdown.className = 'cart-total';
        contenedor.appendChild(totalDropdown);
    }

    totalDropdown.textContent = `Total: $${total.toFixed(2)}`;
}

// Sumar, restar o eliminar productos

function modificarCantidad(index, accion) {
    const juego = carrito[index];

    if (!juego) return;

    if (accion === 'sumar') {
        // No permitir más de 5 unidades del mismo juego
        if (juego.cantidad >= 5) {
            mostrarAlertaCarrito();
            return;
        }

        juego.cantidad++;

    } else if (accion === 'restar') {
        juego.cantidad--;

        if (juego.cantidad <= 0) {
            carrito.splice(index, 1);
        }

    } else if (accion === 'eliminar') {
        carrito.splice(index, 1);
    }

    guardarCarrito();
    mostrarCarrito();
    actualizarContadorCarrito();
}


// Escuchar los botones de cada producto
document.addEventListener('click', event => {
    const boton = event.target.closest('[data-accion]');

    if (!boton) return;

    event.stopPropagation();

    const index = Number(boton.dataset.index);
    const accion = boton.dataset.accion;

    modificarCantidad(index, accion);
});

// Contar unidades, no solamente tipos de juegos
function actualizarContadorCarrito() {
    const contador = document.querySelector('.cart-count');

    if (!contador) return;

    const cantidadTotal = carrito.reduce(
        (total, juego) => total + juego.cantidad,
        0
    );

    contador.textContent = cantidadTotal > 0
        ? cantidadTotal
        : '';

    contador.style.display = cantidadTotal > 0
        ? 'inline-block'
        : 'none';
}

// Aviso al agregar un juego
function mostrarAlertaCarrito() {
    const alerta = document.getElementById('alert-cart');

    if (!alerta) return;

    alerta.classList.remove('d-none');
    alerta.classList.add('d-flex');

    clearTimeout(mostrarAlertaCarrito.temporizador);

    mostrarAlertaCarrito.temporizador = setTimeout(() => {
        alerta.classList.remove('d-flex');
        alerta.classList.add('d-none');
    }, 2000);
}

// Abrir y cerrar el carrito desplegable
document.addEventListener('DOMContentLoaded', () => {
    mostrarCarrito();
    actualizarContadorCarrito();

    const botonCarrito = document.getElementById('cart-button');
    const dropdownCart = document.getElementById('cart-container');

    if (botonCarrito && dropdownCart) {
        botonCarrito.addEventListener('click', event => {
            // No cerrar el carrito al interactuar con sus productos
            if (event.target.closest('#cart-container')) return;

            dropdownCart.classList.toggle('d-none');
            dropdownCart.classList.toggle('d-block');
        });
    }
});
