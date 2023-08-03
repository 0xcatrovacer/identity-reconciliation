import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import identityRouter from "./routers/identityRouters";

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(cors());

app.get("/test", (req: Request, res: Response) => {
    res.send({ status: "ok" });
});

app.use(identityRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
