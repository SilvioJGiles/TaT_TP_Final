document.addEventListener('DOMContentLoaded', () => {

  // Variables
  let baseDeDatos = []; // Iniciar la base de datos como un arreglo vacío

  // ******************
  // Cargar los datos del archivo JSON
  fetch('productos.json')
    .then(response => response.json())  // Convertir la respuesta a JSON
    .then(data => {
      baseDeDatos = data; // Asignar los datos cargados al array baseDeDatos
      console.log(baseDeDatos); // Para verificar si los datos se cargaron correctamente
      renderizarProductos(); // Ahora que tenemos los datos, renderizamos los productos
      renderizarCarrito(); // Si hay algo en el carrito, lo renderizamos
    })
    .catch(error => {
      console.error('Error al cargar el archivo JSON:', error);
    });

  let carrito = [];
  const divisa = '$';
  const DOMitems = document.querySelector('#items');
  const DOMcarrito = document.querySelector('#carrito');
  const DOMtotal = document.querySelector('#total');
  const DOMbotonVaciar = document.querySelector('#boton-vaciar');
  const carritoContenedor = document.querySelector('#carrito-container');
  const carritoIcono = document.querySelector('#carrito-icono');
  const carritoCantidad = document.querySelector('#carrito-cantidad');
  const miLocalStorage = window.localStorage;

  // Funciones

  /**
   * Dibuja todos los productos a partir de la base de datos. No confundir con el carrito
   */
  function renderizarProductos() {
    // Comprobamos si baseDeDatos tiene datos antes de intentar renderizar
    if (baseDeDatos.length === 0) {
      console.error('No se han cargado productos correctamente.');
      return;
    }

    baseDeDatos.forEach((info) => {
      // Estructura
      const miNodo = document.createElement('div');
      miNodo.classList.add('producto-card', 'col-sm-4');
      // Body
      const miNodoCardBody = document.createElement('div');
      miNodoCardBody.classList.add('card-body');
      // Titulo
      const miNodoTitle = document.createElement('h5');
      miNodoTitle.classList.add('card-title');
      miNodoTitle.textContent = info.nombre;
      // Imagen
      const miNodoImagen = document.createElement('img');
      miNodoImagen.classList.add('img-fluid');
      miNodoImagen.setAttribute('src', info.imagen);
      // Precio
      const miNodoPrecio = document.createElement('p');
      miNodoPrecio.classList.add('card-text');
      miNodoPrecio.textContent = `${info.precio}${divisa}`;
      // Boton
      const miNodoBoton = document.createElement('button');
      miNodoBoton.classList.add('btn', 'btn-primary');
      miNodoBoton.textContent = 'Agregar al canasto';
      miNodoBoton.setAttribute('marcador', info.id);
      miNodoBoton.addEventListener('click', anyadirProductoAlCarrito);
      // Insertamos
      miNodoCardBody.appendChild(miNodoImagen);
      miNodoCardBody.appendChild(miNodoTitle);
      miNodoCardBody.appendChild(miNodoPrecio);
      miNodoCardBody.appendChild(miNodoBoton);
      miNodo.appendChild(miNodoCardBody);
      DOMitems.appendChild(miNodo);
    });
  }

  /**
   * Evento para añadir un producto al carrito de la compra
   */
  function anyadirProductoAlCarrito(evento) {
    // Añadimos el ID del producto al carrito
    carrito.push(evento.target.getAttribute('marcador'));
    // Actualizamos el carrito
    renderizarCarrito();
    // Actualizamos el LocalStorage
    guardarCarritoEnLocalStorage();
  }

  /**
   * Dibuja todos los productos guardados en el carrito
   */
  function renderizarCarrito() {
    // Vaciamos todo el html
    DOMcarrito.textContent = '';
    // Quitamos los duplicados
    const carritoSinDuplicados = [...new Set(carrito)];
    // Generamos los Nodos a partir del carrito
    carritoSinDuplicados.forEach((item) => {
      // Obtenemos el item que necesitamos de la variable base de datos
      const miItem = baseDeDatos.filter((itemBaseDatos) => {
        return itemBaseDatos.id === parseInt(item);
      });
      // Cuenta el número de veces que se repite el producto
      const numeroUnidadesItem = carrito.reduce((total, itemId) => {
        return itemId === item ? total += 1 : total;
      }, 0);
      // Creamos el nodo del item del carrito
      const miNodo = document.createElement('li');
      miNodo.classList.add('list-group-item', 'text-right', 'mx-2');
      miNodo.textContent = `${numeroUnidadesItem} x ${miItem[0].nombre} - ${miItem[0].precio}${divisa}`;
      // Boton de borrar
      const miBoton = document.createElement('button');
      miBoton.classList.add('btn', 'btn-danger', 'mx-5');
      miBoton.textContent = 'Quitar';
      miBoton.style.marginLeft = '1rem';
      miBoton.dataset.item = item;
      miBoton.addEventListener('click', borrarItemCarrito);
      // Mezclamos nodos
      miNodo.appendChild(miBoton);
      DOMcarrito.appendChild(miNodo);
    });

    // Renderizamos el precio total en el HTML
    DOMtotal.textContent = calcularTotal();

    // Actualizamos la cantidad total de productos en el carrito (incluyendo duplicados)
    const cantidadTotalProductos = carrito.length;
    carritoCantidad.textContent = cantidadTotalProductos;
  }

  /**
   * Evento para borrar un elemento del carrito
   */
  function borrarItemCarrito(evento) {
    // Obtenemos el producto ID que hay en el botón pulsado
    const id = evento.target.dataset.item;
    // Borramos todos los productos
    carrito = carrito.filter((carritoId) => {
      return carritoId !== id;
    });
    // Volvemos a renderizar
    renderizarCarrito();
    // Actualizamos el LocalStorage
    guardarCarritoEnLocalStorage();
  }

  /**
   * Calcula el precio total teniendo en cuenta los productos repetidos
   */
  function calcularTotal() {
    return carrito.reduce((total, item) => {
      const miItem = baseDeDatos.filter((itemBaseDatos) => {
        return itemBaseDatos.id === parseInt(item);
      });
      return total + miItem[0].precio;
    }, 0).toFixed(2);
  }

  /**
   * Vacia el carrito y lo vuelve a renderizar
   */
  function vaciarCarrito() {
    carrito = [];
    renderizarCarrito();
    localStorage.clear();
  }

  function guardarCarritoEnLocalStorage() {
    miLocalStorage.setItem('carrito', JSON.stringify(carrito));
  }

  function cargarCarritoDeLocalStorage() {
    if (miLocalStorage.getItem('carrito') !== null) {
      carrito = JSON.parse(miLocalStorage.getItem('carrito'));
    }
  }

  // Función para alternar la visibilidad del carrito con un "if"
  function verCarrito() {
    console.log("Entro a la función");
    if (carritoContenedor.style.display === 'block') {
      carritoContenedor.style.display = 'none'; // Ocultar el carrito
    } else {
      carritoContenedor.style.display = 'block'; // Mostrar el carrito
    }
  }

  // Eventos
  carritoIcono.addEventListener('click', verCarrito);  // Agregar evento al icono del carrito
  DOMbotonVaciar.addEventListener('click', vaciarCarrito);

  // Inicio
  cargarCarritoDeLocalStorage();
  renderizarProductos();
  renderizarCarrito();
});
