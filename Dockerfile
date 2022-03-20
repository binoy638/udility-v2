FROM node:16.14-alpine
RUN apk add \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

WORKDIR /home/app
COPY package.json package-lock.json ./
COPY ./ ./
RUN npm install 
RUN npm run build