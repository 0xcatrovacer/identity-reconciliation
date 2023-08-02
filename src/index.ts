import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import identityRouter from "./routers/identityRouters";

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(cors());

app.use(identityRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
