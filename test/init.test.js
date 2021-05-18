import http from "node:http";

import test from "ava";
import got from "got";
import listen from "test-listen";

import app from "../src/index.js";

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
