# CallByMeaning [![Build Status](https://travis-ci.org/cbmjs/CallByMeaning.svg?branch=master)](https://travis-ci.org/cbmjs/CallByMeaning)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Intro

Code for the server-side of the CallByMeaning Project. You don't need this package to use the project. You can do so by using [cbm-api](https://github.com/cbmjs/cbm-api).

For a bit more information on what you can do, check the [docs](./docs/).

## Run locally

```bash
git clone https://github.com/cbmjs/CallByMeaning.git
cd CallByMeaning
npm install
DB_HOST=mongodb://user:pass@host:port/callbymeaning npm start
```

Default host is `http://localhost` and port is 3000 but you can change that by specifying a PORT env variable.

If mongo is local, you only need to specify the name of the database by using the DB env variable, instead of the DB_HOST.

## Docker

You can use Docker to run the web server too. Just clone the repository, change the `DB_HOST` accordingly [here](Dockerfile#L9) and then:

```bash
git clone https://github.com/cbmjs/CallByMeaning.git
cd CallByMeaning
docker build -t call-by-meaning .
docker run -p 3000:3000 call-by-meaning
```

## Unit Tests

Run tests via the command `npm test`

---

## License

[AGPL-3.0 license](./LICENSE).
