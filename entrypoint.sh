#!/bin/sh

PORT=${PORT:=3000}
cd /client
yarn dev
cd /
/app --port ${PORT} --projectID ${PROJECT_ID} --dsHost ${DATASTORE_EMULATOR_HOST}
