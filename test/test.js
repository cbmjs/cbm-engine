const request = require('request');
const JSON = require('../app/dev/jsonfn');
const server = require('../app/index.js');


const HOST = 'http://localhost:3000/';

describe('CallByMeaning Server', () => {
  afterAll(() => server.close());
  describe('Initial', () => {
    it('GET / returns status code 200', () => {
      request.get(HOST, (error, response) => expect(response.statusCode).toEqual(200));
    });
  });

  describe('/gbn', () => {
    it('GET / returns status code 200', () => {
      request.get(`${HOST}gbn/`, (error, response) => expect(response.statusCode).toEqual(200));
    });

    it('GET /<everythingelse> returns status code 404', () => {
      request.get(`${HOST}gbn/alsdlasd`, (error, response) => expect(response.statusCode).toEqual(200));
    });

    describe('/c', () => {
      it('GET / returns status code 200', () => {
        request.get(`${HOST}gbn/c`, (error, response) => expect(response.statusCode).toEqual(200));
      });

      it('GET something that exists', () => {
        request.get(`${HOST}gbn/c/time`, (error, response) => expect(JSON.parse(response.body).name).toEqual('time'));
      });

      it('GET something that doesn\'t exist, but a similar one does', () => {
        request.get(`${HOST}gbn/c/clock`, (error, response) => expect(JSON.parse(response.body).name).toEqual('time'));
      });

      it('GET something that doesn\'t exist has status code 418', () => {
        request.get(`${HOST}gbn/c/blalasda`, (error, response) => expect(response.statusCode).toEqual(418));
      });
    });

    describe('/f', () => {
      it('GET / returns status code 200', () => {
        request.get(`${HOST}gbn/f`, (error, response) => expect(response.statusCode).toEqual(200));
      });

      it('GET something that exists', () => {
        request.get(`${HOST}gbn/f/now`, (error, response) => expect(JSON.parse(response.body).name).toEqual('now'));
      });

      it('GET something that doesn\'t exist has status code 418', () => {
        request.get(`${HOST}gbn/f/blalasda`, (error, response) => expect(response.statusCode).toEqual(418));
      });
    });

    describe('/r', () => {
      it('GET / returns status code 200', () => {
        request.get(`${HOST}gbn/r`, (error, response) => expect(response.statusCode).toEqual(200));
      });

      it('GET something that exists', () => {
        request.get(`${HOST}gbn/r/unitConversion`, (error, response) => expect(JSON.parse(response.body).name).toEqual('unitConversion'));
      });

      it('GET something that doesn\'t exist has status code 418', () => {
        request.get(`${HOST}gbn/r/blalasda`, (error, response) => expect(response.statusCode).toEqual(418));
      });
    });
  });

  describe('/gbm', () => {
    it('GET / returns status code 200', () => {
      request.get(`${HOST}gbm/`, (error, response) => expect(response.statusCode).toEqual(200));
    });

    it('GET /<everythingelse> returns status code 404', () => {
      request.get(`${HOST}gbm/alsdlasd`, (error, response) => expect(response.statusCode).toEqual(418));
    });

    describe('/search', () => {
      it('GET / returns status code 200', () => {
        request.get(`${HOST}gbm/search`, (error, response) => expect(response.statusCode).toEqual(200));
      });

      it('GET /<everythingelse> returns status code 404', () => {
        request.get(`${HOST}gbm/search/alsdlasd`, (error, response) => expect(response.statusCode).toEqual(404));
      });

      it('POST / returns a function if it exists', () => {
        request.post({ uri: `${HOST}gbm/search`, form: { outputNodes: ['time'] } }, (error, response) => expect(JSON.parse(response.body)[0].function).toEqual('now.js'));
      });

      it('POST / returns returns status code 418 if it can\'t find a function', () => {
        request.post({ uri: `${HOST}gbm/search`, form: { outputNodes: ['days'] } }, (error, response) => expect(response.statusCode).toEqual(418));
      });
    });
  });

  describe('/cbm', () => {
    it('GET / returns status code 200', () => {
      request.get(`${HOST}cbm/`, (error, response) => expect(response.statusCode).toEqual(200));
    });

    it('GET /<everythingelse> returns status code 404', () => {
      request.get(`${HOST}cbm/alsdlasd`, (error, response) => expect(response.statusCode).toEqual(404));
    });

    describe('/call', () => {
      it('GET / returns status code 200', () => {
        request.get(`${HOST}cbm/call`, (error, response) => expect(response.statusCode).toEqual(200));
      });

      it('GET /<everythingelse> returns status code 404', () => {
        request.get(`${HOST}cbm/call/alsdlasd`, (error, response) => expect(response.statusCode).toEqual(404));
      });

      it('POST / can retrieve a function with given arguments if it is in DB (with same units)', () => {
        // eslint-disable-next-line no-eval
        request.post({ uri: `${HOST}cbm/call`, form: { outputNodes: ['time'], outputUnits: ['milliseconds'] } }, (error, response) => expect(JSON.parse(response.body)).toBe(eval(JSON.parse(response.body))));
      });

      it('POST / can retrieve a function with given arguments if it is in DB (with different units)', () => {
        // eslint-disable-next-line no-eval
        request.post({ uri: `${HOST}cbm/call`, form: { outputNodes: ['time'], outputUnits: ['hours'] } }, (error, response) => expect(JSON.parse(response.body)).toBe(eval(JSON.parse(response.body))));
      });

      it('POST / can retrieve a function\'s code if returncode = true', () => {
        request.post({ uri: `${HOST}cbm/call`, headers: { returncode: true }, form: { outputNodes: ['time'], outputUnits: ['hours'] } }, (error, response) => expect(JSON.parse(response.body).function).toEqual('now.js'));
      });

      it('POST / returns status 418 if it can\'t find a function in the DB', () => {
        request.post({ uri: `${HOST}cbm/call`, headers: { returncode: true }, form: { outputNodes: ['bla'], outputUnits: ['seconds'] } }, (error, response) => expect(response.statusCode).toEqual(200));
      });
    });
  });
});
