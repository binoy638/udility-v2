FROM node:16.14-alpine
ENV NODE_ENV=production
WORKDIR /home/app
COPY package.json package-lock.json ./
COPY ./ ./
RUN npm install 
RUN npm run build