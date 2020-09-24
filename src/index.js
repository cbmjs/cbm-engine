require("dotenv").config();
const fs = require("fs");
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const chalk = require("chalk");
const helmet = require("helmet");

const mongooseOptions = {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	poolSize: 50,
	keepAlive: true,
	keepAliveInitialDelay: 300000,
	useUnifiedTopology: true,
};

mongoose
	.connect(process.env.DB_HOST || "mongodb://localhost:27017/".concat(process.env.DB || "callbymeaning"), mongooseOptions)
	.catch((error) => console.error(error.message));

try {
	fs.mkdirSync(path.join(__dirname, "../logs/"));
} catch { /**/ }
const accessLogStream = fs.createWriteStream(path.join(__dirname, "../logs/access.log"), { flags: "a" });

const app = express();

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/js", express.static(path.join(__dirname, "../library")));
app.use("/internal", express.static(path.join(__dirname, "../library/internal")));
app.use("/docs", express.static(path.join(__dirname, "../docs")));
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

app.use("/new", require("./routes/new-routes"));
app.use("/all", require("./routes/display-all-routes"));
app.use("/gbn", require("./routes/get-by-name-routes"));
app.use("/gbm", require("./routes/get-by-meaning-routes"));
app.use("/cbm", require("./routes/call-by-meaning-routes"));

app.all("*", (req, res) => res.status(404).send("Hmm... How did you end up here?"));

const port = process.env.PORT || 3000;
app.listen(port, () => (process.env.NODE_ENV !== "test") && console.log(`Server ${chalk.green("started")} at http://localhost:${port}. Have fun. 😀`));

module.exports = app;
