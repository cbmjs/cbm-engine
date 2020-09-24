const http = require("http");

const test = require("ava");
const got = require("got");
const listen = require("test-listen");

const app = require("../src");

test.before(async (t) => {
	t.context.server = http.createServer(app);
	t.context.prefixUrl = await listen(t.context.server);
	t.context.got = got.extend({ throwHttpErrors: false, prefixUrl: t.context.prefixUrl });
});

test.after.always((t) => t.context.server.close());

test("GET / returns status code 200", async (t) => {
	const { statusCode } = await t.context.got("");
	t.is(statusCode, 200);
});
