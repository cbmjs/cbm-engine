import test from 'ava';
import app from '../src';

let request = require('supertest');

request = request(app);

test('GET /cbm returns status code 200', async (t) => {
  const response = await request.get('/cbm');
  t.is(response.statusCode, 200);
});

test('GET /cbm/<everythingelse> returns status code 404', async (t) => {
  const response = await request.get('/cbm/alsdlasd');
  t.is(response.statusCode, 404);
});

test('GET /cbm/call returns status code 200', async (t) => {
  const response = await request.get('/cbm/call');
  t.is(response.statusCode, 200);
});

test('GET /cbm/call<everythingelse> returns status code 404', async (t) => {
  const response = await request.get('/cbm/call/alsdlasd');
  t.is(response.statusCode, 404);
});

test('POST /cbm/call can retrieve a function with given arguments if test is in DB (with same units)', async (t) => {
  const response = await request.post('/cbm/call').send({
    outputConcepts: ['time'],
    outputUnits: ['milliseconds'],
  }).set('accept', 'json');
  // eslint-disable-next-line no-eval
  t.is(response.body, eval(response.body));
});

test('POST /cbm/call can retrieve a function with given arguments if test is in DB (with different units)', async (t) => {
  const response = await request.post('/cbm/call').send({
    outputConcepts: ['time'],
    outputUnits: ['hours'],
  }).set('accept', 'json');
  // eslint-disable-next-line no-eval
  t.is(response.body, eval(response.body));
});

test('POST /cbm/call can retrieve a function\'s code if returncode = true', async (t) => {
  const response = await request.post('/cbm/call').send({
    outputConcepts: ['time'],
    outputUnits: ['milliseconds'],
  }).set('returnCode', 'true').set('accept', 'json');
  t.is(response.body.function, 'now.js');
});

test('POST /cbm/call returns status 418 if test can\'t find a function in the DB', async (t) => {
  const response = await request.post('/cbm/call').send({
    outputConcepts: ['bla'],
    outputUnits: ['seconds'],
  }).set('returnCode', 'true').set('accept', 'json');
  t.is(response.statusCode, 418);
});
