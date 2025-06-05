FROM node:alpine
WORKDIR /var/app
COPY ./package.json ./
RUN npm install --omit=dev
COPY ./ ./
CMD [ "npm", "start" ]