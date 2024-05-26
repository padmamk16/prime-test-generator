# Tini is recommended for Node apps https://github.com/krallin/tini
FROM node:lts-alpine
WORKDIR /app

# Only run npm install if these files change.
COPY package*.json ./

# install application modules
RUN npm install && npm cache clean --force

# Add the rest of the source
COPY . .

EXPOSE 8080

CMD ["node","server.js"]