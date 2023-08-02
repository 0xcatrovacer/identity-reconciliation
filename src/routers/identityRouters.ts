import express from "express";
import { identify } from "../controllers/identityController";

const identityRouter = express.Router();

identityRouter.post("/identify", identify);

export default identityRouter;
