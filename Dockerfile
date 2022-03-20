FROM node:16.14-alpine



WORKDIR /home/app
USER root


COPY . ./

RUN npm install 


RUN npm run build