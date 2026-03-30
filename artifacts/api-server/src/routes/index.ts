import { Router, type IRouter } from "express";
import moradoresBulkRouter from "./moradoresBulk";
import healthRouter from "./health";
import moradoresRouter from "./moradores";
import encomendasRouter from "./encomendas";
import logsRouter from "./logs";
import alertasRouter from "./alertas";
import dashboardRouter from "./dashboard";
import visitantesRouter from "./visitantes";
import ocorrenciasRouter from "./ocorrencias";
import financeiroRouter from "./financeiro";
import assembleiasRouter from "./assembleias";
import reservasRouter from "./reservas";
import juridicoRouter from "./juridico";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(moradoresBulkRouter);
router.use(moradoresRouter);
router.use(encomendasRouter);
router.use(logsRouter);
router.use(alertasRouter);
router.use(visitantesRouter);
router.use(ocorrenciasRouter);
router.use(financeiroRouter);
router.use(assembleiasRouter);
router.use(reservasRouter);
router.use(juridicoRouter);

export default router;
