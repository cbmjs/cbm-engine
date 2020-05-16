const http = require("http");
const test = require("ava");
const got = require("got");
const listen = require("test-listen");
const url = require("url");

const app = require("../src");

test.before(async (t) => {
	t.context.server = http.createServer(app);
	t.context.prefixUrl = await listen(t.context.server);
	t.context.got = got.extend({ throwHttpErrors: false, prefixUrl: url.resolve(t.context.prefixUrl, "/cbm") });
});

test.after.always((t) => t.context.server.close());
test("GET /cbm returns status code 200", async (t) => {
	const { statusCode } = await t.context.got("");
	t.is(statusCode, 200);
});

test("GET /cbm/<everythingelse> returns status code 404", async (t) => {
	const { statusCode } = await t.context.got("alsdlasd");
	t.is(statusCode, 404);
});

test("GET /cbm/call returns status code 200", async (t) => {
	const { statusCode } = await t.context.got("call");
	t.is(statusCode, 200);
});

test("GET /cbm/call<everythingelse> returns status code 404", async (t) => {
	const { statusCode } = await t.context.got("call/alsdlasd");
	t.is(statusCode, 404);
});

test("POST /cbm/call can retrieve a function with given arguments if test is in DB (with same units)", async (t) => {
	const res = await t.context.got.post("call", { json: {
		outputConcepts: ["time"],
		outputUnits: ["milliseconds"],
	} }).json();
	t.truthy(res);
});

test("POST /cbm/call can retrieve a function with given arguments if test is in DB (with different units)", async (t) => {
	const res = await t.context.got.post("call", { json: {
		outputConcepts: ["time"],
		outputUnits: ["hours"],
	} }).json();
	t.truthy(res);
});

test("POST /cbm/call can retrieve a function’s code if returncode = true", async (t) => {
	const { function: func } = await t.context.got.post("call", {
		json: {
			outputConcepts: ["time"],
			outputUnits: ["milliseconds"],
		},
		headers: { returnCode: true },
	}).json();
	t.is(func, "now.js");
});

test("POST /cbm/call returns status 418 if test can’t find a function in the DB", async (t) => {
	const { statusCode } = await t.context.got.post("call", {
		json: {
			outputConcepts: ["bla"],
			outputUnits: ["seconds"],
		},
		headers: { returnCode: true },
	});
	t.is(statusCode, 418);
});
