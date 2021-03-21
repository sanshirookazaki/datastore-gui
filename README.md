# Datastore GUI

GUI for Google Cloud Datastore Emulator
![demo.gif](https://user-images.githubusercontent.com/13990981/111747158-55dd2c80-88d2-11eb-8cb5-699045dfad60.gif)

## Getting started

### docker

You can run it with docker-compose as in the [example](https://github.com/sanshirookazaki/datastore-gui/blob/master/example/docker-compose.yml).

The following environment variables need to be set.

- `PROJECT_ID`: Google Cloud project ID
- `DATASTORE_EMULATOR_HOST`: The emulator endpoint
- `PORT`: the HTTP port (default 3000)

```
:
services:
  datastore-gui:
    image: 346o/datastore-gui:latest
    ports:
      - 3000:3000 # PORT:PORT
    environment:
      - PROJECT_ID=${PROJECT_ID}
      - DATASTORE_EMULATOR_HOST=datastore:8081
      - PORT=3000
:
```
