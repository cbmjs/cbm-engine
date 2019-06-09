FROM node:latest

LABEL maintainer="napoleonoikon@gmail.com"

# Create app directory
WORKDIR /usr/src/app

# Env variables
ENV DB_HOST <mongodb-host>
ENV PORT 3000
ENV DB callbymeaning

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
