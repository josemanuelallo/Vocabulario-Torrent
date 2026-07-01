let vocabulario = [];
let vocabularioMezclado = [];
let indice = 0;
let respuestaVisible = false;
let modoActual = "latin";
let modoRepaso = false;
let clasificando = false;

const CLAVE_PROGRESO = "vocabulario-latin-progreso-v1";
const progreso = cargarProgreso();

const palabra = document.getElementById("palabra");
const respuesta = document.getElementById("respuesta");
const botonAccion = document.getElementById("accion");
const selectorTema = document.getElementById("tema");
const contador = document.getElementById("contador");
const tarjeta = document.getElementById("tarjeta-palabra");
const evaluacion = document.getElementById("evaluacion");
const estado = document.getElementById("estado");
const botonRepaso = document.getElementById("alternar-repaso");
const contadorRojas = document.getElementById("contador-rojas");
const contadorAmarillas = document.getElementById("contador-amarillas");
const contadorVerdes = document.getElementById("contador-verdes");
const indicadorIzquierda = tarjeta.querySelector(".indicador-deslizar.izquierda");
const indicadorDerecha = tarjeta.querySelector(".indicador-deslizar.derecha");

function cargarProgreso() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_PROGRESO)) || {};
    } catch {
        return {};
    }
}

function guardarProgreso() {
    localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));
}

function clavePalabra(entrada) {
    return entrada[0] + "|" + entrada[1];
}

function mezclar(array) {
    const copia = [...array];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

function esProblematica(entrada) {
    const valor = progreso[clavePalabra(entrada)];
    return valor === "rojo" || valor === "amarillo";
}

function actualizarEstadisticas() {
    const totales = { rojo: 0, amarillo: 0, verde: 0 };

    vocabulario.forEach(entrada => {
        const valor = progreso[clavePalabra(entrada)];
        if (totales[valor] !== undefined) totales[valor]++;
    });

    contadorRojas.textContent = totales.rojo;
    contadorAmarillas.textContent = totales.amarillo;
    contadorVerdes.textContent = totales.verde;

    const problematicas = totales.rojo + totales.amarillo;
    botonRepaso.textContent = modoRepaso
        ? "Volver a todas"
        : "Repasar problemáticas (" + problematicas + ")";
    botonRepaso.classList.toggle("activo", modoRepaso);
}

function actualizarContador() {
    if (vocabularioMezclado.length === 0) {
        contador.textContent = "Sin palabras para repasar";
        return;
    }

    contador.textContent = "Palabra " + (indice + 1) + " de " + vocabularioMezclado.length;
}

function limpiarTarjeta() {
    tarjeta.classList.remove(
        "arrastrando",
        "sale-izquierda",
        "sale-derecha",
        "sale-centro"
    );
    tarjeta.style.transform = "";
    indicadorIzquierda.style.opacity = "0";
    indicadorDerecha.style.opacity = "0";
}

function mostrarPalabra() {
    limpiarTarjeta();
    clasificando = false;
    respuesta.textContent = "";
    respuestaVisible = false;
    evaluacion.hidden = true;
    botonAccion.hidden = false;
    botonAccion.textContent = "Mostrar respuesta";
    tarjeta.classList.remove("arrastrable");

    if (vocabularioMezclado.length === 0) {
        palabra.textContent = modoRepaso ? "No tienes palabras problemáticas" : "No hay vocabulario";
        botonAccion.hidden = true;
        actualizarContador();
        return;
    }

    const entrada = vocabularioMezclado[indice];
    palabra.textContent = modoActual === "latin" ? entrada[0] : entrada[1];
    actualizarContador();
}

function prepararSesion() {
    const seleccion = modoRepaso ? vocabulario.filter(esProblematica) : vocabulario;
    vocabularioMezclado = mezclar(seleccion);
    indice = 0;
    mostrarPalabra();
    actualizarEstadisticas();
}

async function cargarVocabulario(nombreArchivo) {
    estado.textContent = "";

    try {
        let texto;

        if (window.location.protocol === "file:") {
            texto = window.VOCABULARIO_LOCAL?.[nombreArchivo];
        } else {
            const respuestaArchivo = await fetch("Vocabulario/Torrent/" + nombreArchivo);
            if (!respuestaArchivo.ok) throw new Error("No se pudo cargar el tema");
            texto = await respuestaArchivo.text();
        }

        if (!texto) throw new Error("No se pudo cargar el tema");

        vocabulario = texto
            .split(/\r?\n/)
            .map(linea => linea.split("|").map(campo => campo.trim()))
            .filter(entrada => entrada.length >= 2 && entrada[0] && entrada[1]);

        modoRepaso = false;
        prepararSesion();
    } catch {
        vocabulario = [];
        vocabularioMezclado = [];
        estado.textContent = "No se ha podido cargar este tema.";
        mostrarPalabra();
        actualizarEstadisticas();
    }
}

function mostrarRespuesta() {
    if (vocabularioMezclado.length === 0) return;

    const entrada = vocabularioMezclado[indice];
    respuesta.textContent = modoActual === "latin" ? entrada[1] : entrada[0];
    respuestaVisible = true;
    botonAccion.hidden = true;
    evaluacion.hidden = false;
    tarjeta.classList.add("arrastrable");
}

function avanzar() {
    if (modoRepaso) {
        vocabularioMezclado = vocabularioMezclado.filter(esProblematica);
        if (vocabularioMezclado.length === 0) {
            indice = 0;
            mostrarPalabra();
            actualizarEstadisticas();
            estado.textContent = "Has resuelto todas las palabras problemáticas de este tema.";
            return;
        }
    }

    indice++;
    if (indice >= vocabularioMezclado.length) {
        vocabularioMezclado = mezclar(vocabularioMezclado);
        indice = 0;
    }

    mostrarPalabra();
}

function clasificar(estadoNuevo) {
    if (!respuestaVisible || clasificando || vocabularioMezclado.length === 0) return;

    clasificando = true;
    const entrada = vocabularioMezclado[indice];
    progreso[clavePalabra(entrada)] = estadoNuevo;
    guardarProgreso();
    actualizarEstadisticas();

    const claseSalida = estadoNuevo === "rojo"
        ? "sale-izquierda"
        : estadoNuevo === "verde" ? "sale-derecha" : "sale-centro";
    tarjeta.classList.add(claseSalida);

    window.setTimeout(avanzar, 260);
}

botonAccion.addEventListener("click", mostrarRespuesta);

selectorTema.addEventListener("change", function () {
    cargarVocabulario(selectorTema.value);
});

document.querySelectorAll(".evaluacion-btn").forEach(boton => {
    boton.addEventListener("click", function () {
        clasificar(this.dataset.estado);
    });
});

document.querySelectorAll(".modo-btn").forEach(boton => {
    boton.addEventListener("click", function () {
        document.querySelectorAll(".modo-btn").forEach(elemento => {
            elemento.classList.remove("activo");
            elemento.setAttribute("aria-pressed", "false");
        });

        this.classList.add("activo");
        this.setAttribute("aria-pressed", "true");
        modoActual = this.dataset.modo;
        mostrarPalabra();
    });
});

botonRepaso.addEventListener("click", function () {
    const cantidad = vocabulario.filter(esProblematica).length;

    if (!modoRepaso && cantidad === 0) {
        estado.textContent = "Todavía no tienes palabras problemáticas en este tema.";
        return;
    }

    estado.textContent = "";
    modoRepaso = !modoRepaso;
    prepararSesion();
});

document.addEventListener("keydown", function (event) {
    if (event.code === "Space" && !respuestaVisible) {
        event.preventDefault();
        mostrarRespuesta();
    }

    if (!respuestaVisible) return;
    if (event.key === "ArrowLeft") clasificar("rojo");
    if (event.key === "ArrowDown") clasificar("amarillo");
    if (event.key === "ArrowRight") clasificar("verde");
});

let inicioX = 0;
let desplazamientoX = 0;

tarjeta.addEventListener("pointerdown", function (event) {
    if (!respuestaVisible || clasificando) return;
    inicioX = event.clientX;
    desplazamientoX = 0;
    tarjeta.classList.add("arrastrando");
    tarjeta.setPointerCapture(event.pointerId);
});

tarjeta.addEventListener("pointermove", function (event) {
    if (!tarjeta.classList.contains("arrastrando")) return;

    desplazamientoX = event.clientX - inicioX;
    const giro = Math.max(-8, Math.min(8, desplazamientoX / 20));
    tarjeta.style.transform = "translateX(" + desplazamientoX + "px) rotate(" + giro + "deg)";
    indicadorIzquierda.style.opacity = String(Math.min(1, Math.max(0, -desplazamientoX / 90)));
    indicadorDerecha.style.opacity = String(Math.min(1, Math.max(0, desplazamientoX / 90)));
});

function terminarArrastre() {
    if (!tarjeta.classList.contains("arrastrando")) return;
    tarjeta.classList.remove("arrastrando");

    if (desplazamientoX < -85) {
        clasificar("rojo");
    } else if (desplazamientoX > 85) {
        clasificar("verde");
    } else {
        tarjeta.style.transform = "";
        indicadorIzquierda.style.opacity = "0";
        indicadorDerecha.style.opacity = "0";
    }
}

tarjeta.addEventListener("pointerup", terminarArrastre);
tarjeta.addEventListener("pointercancel", terminarArrastre);

cargarVocabulario("Tema1.txt");
