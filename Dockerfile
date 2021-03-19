FROM node:12 as node-builder
COPY ./client /client
WORKDIR /client
RUN yarn install && yarn build

FROM golang:1.14 as go-builder
WORKDIR /go/src/app
COPY . /go/src/app
RUN go build -o /go/bin/app

FROM gcr.io/distroless/base:debug
SHELL ["/busybox/sh", "-c"]
WORKDIR /
EXPOSE 8080
COPY --from=go-builder /go/bin/app /
COPY --from=node-builder /client/dist /client/dist
COPY ./entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
