import http from "node:http";
import test from "ava";
import got from "got";
import listen from "test-listen";

import app from "../src/index.js";

test.before(async (t) => {
	t.context.server = http.createServer(app);
	t.context.prefixUrl = await listen(t.context.server);
	t.context.got = got.extend({ throwHttpErrors: false, prefixUrl: new URL("/gbn", t.context.prefixUrl).toString() });
});

test.after.always((t) => t.context.server.close());

test("GET /gbn/ returns status code 200", async (t) => {
	const { statusCode } = await t.context.got("");
	t.is(statusCode, 200);
});

test("GET /gbn/<everythingelse> returns status code 404", async (t) => {
	const { statusCode } = await t.context.got("alsdlasd");
	t.is(statusCode, 404);
});

test("GET /gbn/c returns status code 200", async (t) => {
	const { statusCode } = await t.context.got("c");
	t.is(statusCode, 200);
});

test("GET /gbn/c something that exists", async (t) => {
	const { name } = await t.context.got("c/time").json();
	t.is(name, "time");
});

test("GET /gbn/c something that doesn’t exist, but a similar one does", async (t) => {
	const { name } = await t.context.got("c/clock").json();
	t.is(name, "time");
});

test("GET /gbn/c something that doesn’t exist has status code 418", async (t) => {
	const { statusCode } = await t.context.got("c/blalasda");
	t.is(statusCode, 418);
});

test("GET /gbn/f returns status code 200", async (t) => {
	const { statusCode } = await t.context.got("f");
	t.is(statusCode, 200);
});

test("GET /gbn/f something that exists", async (t) => {
	const { name } = await t.context.got("f/now").json();
	t.is(name, "now");
});

test("GET /gbn/f something that doesn’t exist has status code 418", async (t) => {
	const { statusCode } = await t.context.got("f/blalasda");
	t.is(statusCode, 418);
});

test("GET /gbn/r returns status code 200", async (t) => {
	const { statusCode } = await t.context.got("r");
	t.is(statusCode, 200);
});

test("GET /gbn/r something that exists", async (t) => {
	const { name } = await t.context.got("r/unitConversion").json();
	t.is(name, "unitConversion");
});

test("GET /gbn/r something that doesn’t exist has status code 418", async (t) => {
	const { statusCode } = await t.context.got("r/blalasda");
	t.is(statusCode, 418);
});
