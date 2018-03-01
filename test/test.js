const got = require('got');
const server = require('../app/index.js');


const HOST = 'http://localhost:3000/';

describe('cbm-engine Server', () => {
  afterAll(() => server.close());
  describe('Initial', () => {
    it('GET / returns status code 200', async () => {
      const response = await got(HOST, { throwHttpErrors: false });
      expect(response.statusCode).toEqual(200);
    });
  });

  describe('/gbn', () => {
    it('GET / returns status code 200', async () => {
      const response = await got(`${HOST}gbn/`, { throwHttpErrors: false });
      expect(response.statusCode).toEqual(200);
    });

    it('GET /<everythingelse> returns status code 404', async () => {
      const response = await got(`${HOST}gbn/alsdlasd`, { throwHttpErrors: false });
      expect(response.statusCode).toEqual(404);
    });

    describe('/c', () => {
      it('GET / returns status code 200', async () => {
        const response = await got(`${HOST}gbn/c`, { throwHttpErrors: false });
        expect(response.statusCode).toEqual(200);
      });

      it('GET something that exists', async () => {
        const response = await got(`${HOST}gbn/c/time`, { json: true, throwHttpErrors: false });
        expect(response.body.name).toEqual('time');
      });

      it('GET something that doesn\'t exist, but a similar one does', async () => {
        const response = await got(`${HOST}gbn/c/clock`, { json: true, throwHttpErrors: false });
        expect(response.body.name).toEqual('time');
      });

      it('GET something that doesn\'t exist has status code 418', async () => {
        const response = await got(`${HOST}gbn/c/blalasda`, { json: true, throwHttpErrors: false });
        expect(response.statusCode).toEqual(418);
      });
    });

    describe('/f', () => {
      it('GET / returns status code 200', async () => {
        const response = await got(`${HOST}gbn/f`, { throwHttpErrors: false });
        expect(response.statusCode).toEqual(200);
      });

      it('GET something that exists', async () => {
        const response = await got(`${HOST}gbn/f/now`, { json: true, throwHttpErrors: false });
        expect(response.body.name).toEqual('now');
      });

      it('GET something that doesn\'t exist has status code 418', async () => {
        const response = await got(`${HOST}gbn/f/blalasda`, { json: true, throwHttpErrors: false });
        expect(response.statusCode).toEqual(418);
      });
    });

    describe('/r', () => {
      it('GET / returns status code 200', async () => {
        const response = await got(`${HOST}gbn/r`, { throwHttpErrors: false });
        expect(response.statusCode).toEqual(200);
      });

      it('GET something that exists', async () => {
        const response = await got(`${HOST}gbn/r/unitConversion`, { json: true, throwHttpErrors: false });
        expect(response.body.name).toEqual('unitConversion');
      });

      it('GET something that doesn\'t exist has status code 418', async () => {
        const response = await got(`${HOST}gbn/r/blalasda`, { json: true, throwHttpErrors: false });
        expect(response.statusCode).toEqual(418);
      });
    });
  });

  describe('/gbm', () => {
    it('GET / returns status code 200', async () => {
      const response = await got(`${HOST}gbm/`, { throwHttpErrors: false });
      expect(response.statusCode).toEqual(200);
    });

    it('GET /<everythingelse> returns status code 404', async () => {
      const response = await got(`${HOST}gbm/alsdlasd`, { throwHttpErrors: false });
      expect(response.statusCode).toEqual(404);
    });

    describe('/search', () => {
      it('GET / returns status code 200', async () => {
        const response = await got(`${HOST}gbm/search`, { throwHttpErrors: false });
        expect(response.statusCode).toEqual(200);
      });

      it('GET /<everythingelse> returns status code 404', async () => {
        const response = await got(`${HOST}gbm/search/alsdlasd`, { throwHttpErrors: false });
        expect(response.statusCode).toEqual(404);
      });

      it('POST / returns a function if it exists', async () => {
        const response = await got.post(`${HOST}gbm/search`, {
          encoding: 'utf-8',
          body: { outputConcepts: ['time'] },
          form: true,
          json: true,
          throwHttpErrors: false,
        });
        expect(response.body[0].function).toEqual('now.js');
      });

      it('POST / returns returns status code 418 if it can\'t find a function', async () => {
        const response = await got.post(`${HOST}gbm/search`, {
          encoding: 'utf-8',
          body: { outputConcepts: ['days'] },
          form: true,
          json: true,
          throwHttpErrors: false,
        });
        expect(response.statusCode).toEqual(418);
      });
    });
  });

  describe('/cbm', () => {
    it('GET / returns status code 200', async () => {
      const response = await got(`${HOST}cbm`, { throwHttpErrors: false });
      expect(response.statusCode).toEqual(200);
    });

    it('GET /<everythingelse> returns status code 404', async () => {
      const response = await got(`${HOST}cbm/alsdlasd`, { throwHttpErrors: false });
      expect(response.statusCode).toEqual(404);
    });

    describe('/call', () => {
      it('GET / returns status code 200', async () => {
        const response = await got(`${HOST}cbm/call`, { throwHttpErrors: false });
        expect(response.statusCode).toEqual(200);
      });

      it('GET /<everythingelse> returns status code 404', async () => {
        const response = await got(`${HOST}cbm/call/alsdlasd`, { throwHttpErrors: false });
        expect(response.statusCode).toEqual(404);
      });

      it('POST / can retrieve a function with given arguments if it is in DB (with same units)', async () => {
        const response = await got.post(`${HOST}cbm/call`, {
          encoding: 'utf-8',
          body: { outputConcepts: ['time'], outputUnits: ['milliseconds'] },
          form: true,
          json: true,
          throwHttpErrors: false,
        });
        // eslint-disable-next-line no-eval
        expect(response.body).toBe(eval(response.body));
      });

      it('POST / can retrieve a function with given arguments if it is in DB (with different units)', async () => {
        const response = await got.post(`${HOST}cbm/call`, {
          encoding: 'utf-8',
          body: { outputConcepts: ['time'], outputUnits: ['hours'] },
          form: true,
          json: true,
          throwHttpErrors: false,
        });
        // eslint-disable-next-line no-eval
        expect(response.body).toBe(eval(response.body));
      });

      it('POST / can retrieve a function\'s code if returncode = true', async () => {
        const response = await got.post(`${HOST}cbm/call`, {
          encoding: 'utf-8',
          body: { outputConcepts: ['time'], outputUnits: ['hours'] },
          headers: { returncode: true },
          form: true,
          json: true,
          throwHttpErrors: false,
        });
        expect(response.body.function).toEqual('now.js');
      });

      it('POST / returns status 418 if it can\'t find a function in the DB', async () => {
        const response = await got.post(`${HOST}cbm/call`, {
          encoding: 'utf-8',
          body: { outputConcepts: ['bla'], outputUnits: ['seconds'] },
          headers: { returncode: true },
          form: true,
          json: true,
          throwHttpErrors: false,
        });
        // eslint-disable-next-line no-eval
        expect(response.statusCode).toEqual(418);
      });
    });
  });
});
