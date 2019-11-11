import test from "ava";
import app from "../src";

const request = require("supertest")(app);

test("GET /gbn/ returns status code 200", async (t) => {
	const response = await request.get("/gbn");
	t.is(response.statusCode, 200);
});

test("GET /gbn/<everythingelse> returns status code 404", async (t) => {
	const response = await request.get("/gbn/alsdlasd");
	t.is(response.statusCode, 404);
});

test("GET /gbn/c returns status code 200", async (t) => {
	const response = await request.get("/gbn/c");
	t.is(response.statusCode, 200);
});

test("GET /gbn/c something that exists", async (t) => {
	const response = await request.get("/gbn/c/time").set("Accept", "application/json");
	t.is(response.body.name, "time");
});

test("GET /gbn/c something that doesn't exist, but a similar one does", async (t) => {
	const response = await request.get("/gbn/c/clock").set("Accept", "application/json");
	t.is(response.body.name, "time");
});

test("GET /gbn/c something that doesn't exist has status code 418", async (t) => {
	const response = await request.get("/gbn/c/blalasda").set("Accept", "application/json");
	t.is(response.statusCode, 418);
});

test("GET /gbn/f returns status code 200", async (t) => {
	const response = await request.get("/gbn/f");
	t.is(response.statusCode, 200);
});

test("GET /gbn/f something that exists", async (t) => {
	const response = await request.get("/gbn/f/now").set("Accept", "application/json");
	t.is(response.body.name, "now");
});

test("GET /gbn/f something that doesn't exist has status code 418", async (t) => {
	const response = await request.get("/gbn/f/blalasda").set("Accept", "application/json");
	t.is(response.statusCode, 418);
});

test("GET /gbn/r returns status code 200", async (t) => {
	const response = await request.get("/gbn/r");
	t.is(response.statusCode, 200);
});

test("GET /gbn/r something that exists", async (t) => {
	const response = await request.get("/gbn/r/unitConversion").set("Accept", "application/json");
	t.is(response.body.name, "unitConversion");
});

test("GET /gbn/r something that doesn't exist has status code 418", async (t) => {
	const response = await request.get("/gbn/r/blalasda").set("Accept", "application/json");
	t.is(response.statusCode, 418);
});
