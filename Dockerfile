FROM node:latest

LABEL maintainer="Napoleonoikon@gmail.com"

# Create app directory
WORKDIR /usr/src/app

# Env variables
ENV DB_HOST <mongodb-host>
ENV PORT 3000
ENV DB callbymeaning

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
