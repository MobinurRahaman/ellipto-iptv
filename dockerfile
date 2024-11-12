FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 3000


RUN yarn global add serve
ENTRYPOINT ["serve", "-s", "build", "-l", "3000"]
