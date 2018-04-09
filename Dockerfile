FROM node:alpine
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app
RUN npm run-script build
CMD [ "npm", "run-script", "start" ]