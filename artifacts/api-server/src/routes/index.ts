import { Router, type IRouter } from "express";
import healthRouter from "./health";
import moradoresRouter from "./moradores";
import encomendasRouter from "./encomendas";
import logsRouter from "./logs";
import alertasRouter from "./alertas";

const router: IRouter = Router();

router.use(healthRouter);
router.use(moradoresRouter);
router.use(encomendasRouter);
router.use(logsRouter);
router.use(alertasRouter);

export default router;
