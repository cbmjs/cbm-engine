import test from 'ava';
import app from '../src';

let request = require('supertest');

request = request(app);

test('GET /gbm returns status code 200', async t => {
	const response = await request.get('/gbm');
	t.is(response.statusCode, 200);
});

test('GET /gbm/<everythingelse> returns status code 404', async t => {
	const response = await request.get('/gbm/alsdlasd');
	t.is(response.statusCode, 404);
});

test('GET /gbm/search/ returns status code 200', async t => {
	const response = await request.get('/gbm/search');
	t.is(response.statusCode, 200);
});

test('GET /gbm/search/<everythingelse> returns status code 404', async t => {
	const response = await request.get('/gbm/search/alsdlasd');
	t.is(response.statusCode, 404);
});

test('POST /gbm/search/ returns a function if test exists', async t => {
	const response = await request.post('/gbm/search').send({
		outputConcepts: ['time']
	}).set('accept', 'json');
	t.is(response.body[0].function, 'now.js');
});

test('POST /gbm/search/ returns returns status code 418 if test can\'t find a function', async t => {
	const response = await request.post('/gbm/search').send({
		outputConcepts: ['days']
	}).set('accept', 'json');
	t.is(response.statusCode, 418);
});
