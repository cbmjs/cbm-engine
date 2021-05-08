import "dotenv/config";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import chalk from "chalk";
import helmet from "helmet";

import newRoutes from "./routes/new-routes.js";
import displayAllRoutes from "./routes/display-all-routes.js";
import getByNameRoutes from "./routes/get-by-name-routes.js";
import getByMeaningRoutes from "./routes/get-by-meaning-routes.js";
import callByMeaningRoutes from "./routes/call-by-meaning-routes.js";

const mongooseOptions = {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	poolSize: 50,
	keepAlive: true,
	keepAliveInitialDelay: 300_000,
	useUnifiedTopology: true,
};

mongoose
	.connect(process.env.DB_HOST || "mongodb://localhost:27017/".concat(process.env.DB || "callbymeaning"), mongooseOptions)
	.catch((error) => console.error(error.message));

try {
	fs.mkdirSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../logs/"));
} catch { /**/ }
const accessLogStream = fs.createWriteStream(path.join(path.dirname(fileURLToPath(import.meta.url)), "../logs/access.log"), { flags: "a" });

const app = express();

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/js", express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), "../library")));
app.use("/internal", express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), "../library/internal")));
app.use("/docs", express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), "../docs")));
app.use(morgan("dev", { stream: accessLogStream }));

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get("/", (req, res) => {
	res.send("<h1>Hello There :)</h1><br>Check <a href=./gbn>Get by name</a><br>"
  + "Check <a href=./gbm>Get by meaning</a><br>Check <a href=./cbm>Call by meaning</a>");
});

app.use("/new", newRoutes);
app.use("/all", displayAllRoutes);
app.use("/gbn", getByNameRoutes);
app.use("/gbm", getByMeaningRoutes);
app.use("/cbm", callByMeaningRoutes);

app.all("*", (req, res) => res.status(404).send("Hmm... How did you end up here?"));

const port = process.env.PORT || 3000;
app.listen(port, () => (process.env.NODE_ENV !== "test") && console.log(`Server ${chalk.green("started")} at http://localhost:${port}. Have fun. 😀`));

export default app;
