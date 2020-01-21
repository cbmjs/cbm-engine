const test = require("ava");
const supertest = require("supertest");

const app = require("../src");

const request = supertest(app);

test("GET / returns status code 200", async (t) => {
	const response = await request.get("/");
	t.is(response.statusCode, 200);
});
