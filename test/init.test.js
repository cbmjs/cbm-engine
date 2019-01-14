import test from 'ava';
import app from '../src';

let request = require('supertest');

request = request(app);

test('GET / returns status code 200', async (t) => {
  const response = await request.get('/');
  t.is(response.statusCode, 200);
});
