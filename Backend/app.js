import express from 'express';
import cors from 'cors'
import reservasRouter from './src/api/routes/reservas.js'
import jugadoresRouter from './src/api/routes/jugadores.js';
import invitacionesRouter from './src/api/routes/invitaciones.js';
import pagosRouter from './src/api/routes/pagos.js';
import utilsRouter from './src/api/routes/utils.js';
import { DOMINIO_FRONTEND } from './src/config/config.js';
import { initializeJobs } from './src/jobs/index.js';

const app = express();
app.disable("x-powered-by");

try {
    await loadDynamicConfig();
    console.log('Configuración inicial de calendarios cargada');
} catch (err) {
    console.error('Error cargando configuración inicial de calendarios:', err);
}


const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())

// Rutas
app.use("/jugadores", jugadoresRouter);
app.use("/reservas", reservasRouter);
app.use("/invitaciones", invitacionesRouter);
app.use("/pagos", pagosRouter);
app.use("/utils", utilsRouter);

initializeJobs();

// Arranca el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});