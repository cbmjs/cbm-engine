import "dotenv/config";
import { MongoClient } from "mongodb";

const url = "mongodb://localhost:27017/callbymeaning";

/*
 * This script creates a new db with everything from the default one. mongod MUST be already running before used.
 * Run this before starting the server.
 */
MongoClient.connect(url, (err, db) => {
	if (err) {
		console.error(err);
	}

	const mongoCommand = {
		copydb: 1,
		fromhost: "localhost",
		fromdb: "callbymeaning",
		todb: process.env.DB,
	};
	const admin = db.admin();
	admin.command(mongoCommand, (commandErr, data) => {
		if (commandErr) {
			console.log(commandErr.errmsg);
		} else {
			console.log(data);
		}

		db.close();
	});
});
