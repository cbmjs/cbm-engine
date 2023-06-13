import http from "node:http";

import test from "ava";
import got from "got";
import listen from "test-listen";

import app from "../src/index.js";

test.before(async (t) => {
	t.context.server = http.createServer(app);
	t.context.prefixUrl = await listen(t.context.server);
	t.context.got = got.extend({ throwHttpErrors: false, prefixUrl: new URL("/gbm", t.context.prefixUrl).toString() });
});

test.after.always((t) => { t.context.server.close(); });

test("GET /gbm returns status code 200", async (t) => {
	const { statusCode } = await t.context.got("");
	t.is(statusCode, 200);
});

test("GET /gbm/<everythingelse> returns status code 404", async (t) => {
	const { statusCode } = await t.context.got("alsdlasd");
	t.is(statusCode, 404);
});

test("GET /gbm/search/ returns status code 200", async (t) => {
	const { statusCode } = await t.context.got("search");
	t.is(statusCode, 200);
});

test("GET /gbm/search/<everythingelse> returns status code 404", async (t) => {
	const { statusCode } = await t.context.got("search/alsdlasd");
	t.is(statusCode, 404);
});

test("POST /gbm/search/ returns a function if test exists", async (t) => {
	const res = await t.context.got.post("search", { json: { outputConcepts: ["time"] } }).json();
	t.is(res[0].function, "getTime.js");
});

test("POST /gbm/search/ returns returns status code 418 if test can’t find a function", async (t) => {
	const { statusCode } = await t.context.got.post("search", { json: { outputConcepts: ["days"] } });
	t.is(statusCode, 418);
});
