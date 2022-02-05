FROM node:alpine

# COPY all the files from Current Directory into the Container
COPY ./ ./

RUN npm install

ENTRYPOINT ["npm", "start"]
