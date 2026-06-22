import {joyasControllers} from "../controllers/joyas.controllers.js"
import { reportarConsulta } from "../middlewares/logger.middleware.js";
import { Router } from "express";

const router = Router();

router.get("/", joyasControllers.getAllJoyas);
router.get("/filtros", reportarConsulta,joyasControllers.getJoyasByFilters);

export default router;