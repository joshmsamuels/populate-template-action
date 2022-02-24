FROM node:buster

RUN apt-get update
RUN apt-get install -y texlive-latex-base

# Copy all the files from Current Directory into the Container
COPY . .

RUN npm install

ENTRYPOINT ["npm", "start"]
