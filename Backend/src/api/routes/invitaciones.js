import express from 'express';
import { InvitacionesController } from '../controllers/invitaciones.js';

const invitacionesRouter = express.Router();

invitacionesRouter.post("/invitar", InvitacionesController.invitarJugador)

export default invitacionesRouter;