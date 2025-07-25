import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DOMINIO_BACKEND } from "../config/config.js";
import { useTranslation } from 'react-i18next';

export default function ReservaConfirmar() {
  const [searchParams] = useSearchParams();
  // Estado para almacenar la partida (datos estáticos)
  const [partida, setPartida] = useState(null);
  // Estados independientes para los campos de formulario
  const [nombre, setNombre] = useState("");
  const [numero, setNumero] = useState("");
  const [codigoPais, setCodigoPais] = useState("212");
  const [nivel, setNivel] = useState("");
  const [jugadoresFaltan, setJugadoresFaltan] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [enviando, setEnviando] = useState(false);
  // Estado para controlar modo de edición de campos adicionales
  const [modoEdicion, setModoEdicion] = useState(false);
  // Bandera para controlar la inicialización de datos
  const [datosInicializados, setDatosInicializados] = useState(false);
  // Estado para controlar si la reserva fue confirmada exitosamente
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  // Estado para almacenar los datos de la reserva confirmada
  const [reservaData, setReservaData] = useState(null);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation()

  useEffect(() => {
    // Solo inicializar los datos una vez
    if (!datosInicializados) {
      try {
        const data = searchParams.get("data");
        if (data) {
          const partidaData = JSON.parse(decodeURIComponent(data));
          setPartida(partidaData);

          // Inicializa los valores del formulario solo una vez
          if (partidaData.nombre) setNombre(partidaData.nombre);

          // Procesar el número de teléfono para separar prefijo si existe
          if (partidaData.numero) {
            const numStr = partidaData.numero.toString();
            // Si el número comienza con algún prefijo conocido
            if (numStr.startsWith("34")) {
              setCodigoPais("34");
              setNumero(numStr.substring(2));
            } else if (numStr.startsWith("54")) {
              setCodigoPais("54");
              setNumero(numStr.substring(2));
            } else if (numStr.startsWith("1")) {
              setCodigoPais("1");
              setNumero(numStr.substring(1));
            } else if (numStr.startsWith("44")) {
              setCodigoPais("44");
              setNumero(numStr.substring(2));
            } else if (numStr.startsWith("49")) {
              setCodigoPais("49");
              setNumero(numStr.substring(2));
            } else if (numStr.startsWith("33")) {
              setCodigoPais("33");
              setNumero(numStr.substring(2));
            } else if (numStr.startsWith("351")) {
              setCodigoPais("351");
              setNumero(numStr.substring(3));
            } else if (numStr.startsWith("52")) {
              setCodigoPais("52");
              setNumero(numStr.substring(2));
            } else if (numStr.startsWith("55")) {
              setCodigoPais("55");
              setNumero(numStr.substring(2));
            } else if (numStr.startsWith("56")) {
              setCodigoPais("56");
              setNumero(numStr.substring(2));
            } else if (numStr.startsWith("57")) {
              setCodigoPais("57");
              setNumero(numStr.substring(2));
            } else if (numStr.startsWith("58")) {
              setCodigoPais("58");
              setNumero(numStr.substring(2));
            } else if (numStr.startsWith("212")) {
              setCodigoPais("212")
              setNumero(numStr.substring(3))
            } else {
              // Si no hay prefijo reconocido, establecer el número completo
              setNumero(numStr);
            }
          }
          if (partidaData.nivel) setNivel(partidaData.nivel);
          if (partidaData.jugadores_faltan) setJugadoresFaltan(partidaData.jugadores_faltan);
        }
        // Marcar que ya se inicializaron los datos
        setDatosInicializados(true);
      } catch (e) {
        console.error("Error al parsear datos:", e);
        setDatosInicializados(true);
      }
    }
  }, [searchParams, datosInicializados]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!nivel || nivel === "No especificado" || nivel === "") {
      setMensaje("Debe especificar el nivel de la partida");
      setTipoMensaje("danger");
      return;
    }
    if (!jugadoresFaltan || jugadoresFaltan === "?" || jugadoresFaltan === "") {
      setMensaje("Debe especificar los jugadores que faltan para completar la partida");
      setTipoMensaje("danger");
      return;
    }
    const numeroCompleto = `${codigoPais}${numero}`;
    setEnviando(true);
    setMensaje("");
    const inicioDate = new Date(partida?.inicio);
    const finDate = new Date(inicioDate.getTime() + 90 * 60000);
    const fin = finDate.toISOString();
    let tipoPartida = partida?.partida || "abierta";
    if (jugadoresFaltan === "0") {
      tipoPartida = "completa";
    }
    try {
      // Crear objeto de datos para la reserva (lo usaremos tanto para la solicitud como para localStorage)
      const reservaData = {
        pista: partida?.pista,
        inicio: partida?.inicio,
        fin,
        nombre,
        numero: numeroCompleto,
        partida: tipoPartida,
        nivel,
        jugadores_faltan: jugadoresFaltan
      };

      // Enviamos los datos al backend
      const response = await fetch(`${DOMINIO_BACKEND}/reservas/confirmar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reservaData)
      });

      // Comprobamos el código de estado primero
      if (response.status === 401) {
        // Detectar específicamente el error de usuario no registrado
        setMensaje("Para reservar pistas debes estar registrado en el sistema.");
        setTipoMensaje("warning");

        // Guardar los datos del intento de reserva
        localStorage.setItem("reservaPendiente", JSON.stringify(reservaData));

        // Establecer estado para mostrar botón de registro
        setNeedsRegistration(true);
        return;
      }

      // Si llegamos aquí, es porque no es un 401, procesamos normalmente
      const data = await response.json();
      if (data.status === "success") {
        setNombre(data.data.nombre);
        setReservaConfirmada(true);
        setMensaje("¡Tu reserva ha sido confirmada! Hemos enviado los detalles a tu WhatsApp.");
        setReservaData(data.data);
      } else {
        setMensaje(`Error: ${data.message}`);
        setTipoMensaje("danger");
      }
    } catch (err) {
      console.error("Error en la solicitud:", err);

      // Aquí manejamos los errores de red, incluyendo CORS
      // Para estos casos, asumimos que podría ser un 401, especialmente en producción
      if (window.location.hostname !== 'localhost') {
        setMensaje("No pudimos verificar tu registro. Por favor, regístrate antes de reservar.");
        setTipoMensaje("warning");

        // Guardar los datos del intento de reserva
        localStorage.setItem("reservaPendiente", JSON.stringify({
          pista: partida?.pista,
          inicio: partida?.inicio,
          fin,
          nombre,
          numero: numeroCompleto,
          partida: tipoPartida,
          nivel,
          jugadores_faltan: jugadoresFaltan
        }));

        // Mostrar botón de registro
        setNeedsRegistration(true);
      } else {
        // Para desarrollo local, mostramos el error técnico
        setMensaje("Error al confirmar la reserva. Por favor, inténtalo de nuevo.");
        setTipoMensaje("danger");
      }
    } finally {
      setEnviando(false);
    }
  };
  if (!partida) {
    return <div className="container min-vh-100 d-flex align-items-center">
      <div className="row w-100">
        <div className="col-12 col-md-8 col-lg-6 mx-auto">
          <div className="card shadow">
            <div className="card-body text-center">
              <div className="display-1 mb-4">{t("key_6")}</div>
              <h3 className="text-warning mb-3">{t("informacion-no-disponible")}</h3>
              <p className="lead">{t("no-se-han-recibido-datos-de-la-partida")}</p>
              <button onClick={() => navigate('/home')} className="btn btn-primary mt-3">{t("cerrar")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }

  // Pantalla de reserva confirmada exitosamente
  if (reservaConfirmada) {
    return <div className="container min-vh-100 d-flex align-items-center">
      <div className="row w-100">
        <div className="col-12 col-md-8 col-lg-6 mx-auto">
          <div className="card shadow">
            <div className="card-body text-center">
              <div className="display-1 mb-4">{t("key_2")}</div>
              <h3 className="text-success mb-3">{t("reserva-confirmada")}</h3>
              <p className="lead">{mensaje}</p>
              <ul className="list-group mb-4 text-start">
                <li className="list-group-item">{t("fecha")}{new Date(partida.inicio).toLocaleDateString("es-ES", {
                  timeZone: 'Europe/Madrid'
                })}</li>
                <li className="list-group-item">{t("hora")}{new Date(partida.inicio).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: 'Europe/Madrid'
                })}</li>
                <li className="list-group-item">{t("nivel_3")}{nivel}</li>
                <li className="list-group-item">{t("pista_1")}{partida.pista}</li>
                <li className="list-group-item">{t("a-tu-nombre")}{nombre}</li>
                <li className="list-group-item">{t("jugadores-que-faltan")}{jugadoresFaltan}</li>
              </ul>
              <div className="alert alert-info mb-4">
                <p className="mb-0">{t("se-ha-enviado-una-confirmacion-a-tu-numero-de-what")}</p>
              </div>
              <button onClick={() => navigate('/home')} className="btn btn-primary mt-3">{t("cerrar")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }

  // Formulario de confirmación de reserva
  return <div className="container min-vh-100 d-flex align-items-center">
    <div className="row w-100">
      <div className="col-12 col-md-8 col-lg-6 mx-auto">
        <div className="card shadow">
          <div className="card-body">
            <h3 className="mb-4 text-center">{t("detalles-de-la-partida")}</h3>
            <div className="d-flex justify-content-end mb-2">
              <button type={t("button")} className={`btn btn-sm ${modoEdicion ? 'btn-outline-secondary' : 'btn-outline-primary'}`} onClick={() => setModoEdicion(!modoEdicion)}>
                {modoEdicion ? '❌ Cancelar edición' : '✏️ Editar detalles'}
              </button>
            </div>
            <ul className="list-group mb-4">
              <li className="list-group-item">{t("fecha")}{new Date(partida.inicio).toLocaleDateString("es-ES", {
                timeZone: 'Europe/Madrid'
              })}</li>
              <li className="list-group-item">{t("hora")}{new Date(partida.inicio).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: 'Europe/Madrid'
              })}</li>

              {!modoEdicion ? <li className="list-group-item">{t("nivel_3")}{nivel || "No especificado"}</li> : <li className="list-group-item">
                <div className="input-group">
                  <span className="input-group-text">{t("nivel_3")}</span>
                  <select className="form-select" value={nivel} onChange={e => setNivel(e.target.value)} required>
                    <option value="">{t("selecciona-nivel")}</option>
                    <option value={t("1")}>{t("1-principiante")}</option>
                    <option value={t("2")}>{t("2-intermedio")}</option>
                    <option value={t("3")}>{t("3-avanzado")}</option>
                  </select>
                </div>
              </li>}

              <li className="list-group-item">{t("pista_1")}{partida.pista}</li>

              {!modoEdicion ? <li className="list-group-item">{t("jugadores-faltantes")}{jugadoresFaltan || "?"}</li> : <li className="list-group-item">
                <div className="input-group">
                  <span className="input-group-text">{t("jugadores-faltantes")}</span>
                  <select className="form-select" value={jugadoresFaltan} onChange={e => setJugadoresFaltan(e.target.value)} required>
                    <option value="">{t("selecciona-cantidad")}</option>
                    <option value={t("0")}>{t("0-jugadores")}</option>
                    <option value={t("1")}>{t("1-jugador")}</option>
                    <option value={t("2")}>{t("2-jugadores")}</option>
                    <option value={t("3")}>{t("3-jugadores")}</option>
                  </select>
                </div>
              </li>}
            </ul>

            <form onSubmit={handleSubmit}>
              {/* <div className="mb-3">
                                    <label className="form-label">Tu nombre</label>
                                    <input
                                        className="form-control"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        required
                                    />
                                 </div> */}
              <div className="mb-3">
                <label className="form-label">{t("tu-numero-de-telefono")}</label>
                <div className="input-group">
                  <select className="form-select" value={codigoPais} onChange={e => setCodigoPais(e.target.value)} style={{
                    maxWidth: "130px"
                  }}>
                    <option value={t("212")}>{t("212_1")}</option>
                    <option value={t("34")}>{t("34_1")}</option>
                    <option value={t("54")}>{t("54_1")}</option>
                    <option value={t("1")}>{t("1_1")}</option>
                    <option value={t("44")}>{t("44_1")}</option>
                    <option value={t("49")}>{t("49_1")}</option>
                    <option value={t("33")}>{t("33_1")}</option>
                    <option value={t("351")}>{t("351_1")}</option>
                    <option value={t("52")}>{t("52_1")}</option>
                    <option value={t("55")}>{t("55_1")}</option>
                    <option value={t("56")}>{t("56_1")}</option>
                    <option value={t("57")}>{t("57_1")}</option>
                    <option value={t("58")}>{t("58_1")}</option>
                  </select>
                  <input type={t("tel")} className="form-control" value={numero} onChange={e => setNumero(e.target.value)} placeholder={t("612345678")} required />
                </div>
                <div className="form-text">{t("recibiras-notificaciones-por-whatsapp")}</div>
              </div>

              {mensaje && tipoMensaje === "danger" && <div className={`alert alert-${tipoMensaje} mb-3`}>{mensaje}</div>}

              {mensaje && tipoMensaje === "warning" && needsRegistration && <div className="alert alert-warning mb-3 text-center">
                <p>{mensaje}</p>
                <div className="d-flex justify-content-center">
                  <button type={t("button")} className="btn btn-outline-primary mt-2" onClick={() => navigate("/signup")}>{t("ir-a-la-pagina-de-registro")}</button>
                </div>
              </div>}

              <button className="btn btn-success w-100" disabled={enviando}>
                {enviando ? "Enviando..." : "Confirmar reserva"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>;
}