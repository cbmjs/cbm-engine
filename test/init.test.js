import test from 'ava';
import app from '../src';

const request = require('supertest')(app);

test('GET / returns status code 200', async (t) => {
  const response = await request.get('/');
  t.is(response.statusCode, 200);
});
