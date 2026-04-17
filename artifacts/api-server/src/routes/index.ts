import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import customersRouter from "./customers";
import ordersRouter from "./orders";
import inventoryRouter from "./inventory";
import aiRouter from "./ai";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(customersRouter);
router.use(ordersRouter);
router.use(inventoryRouter);
router.use(aiRouter);
router.use(analyticsRouter);

export default router;
