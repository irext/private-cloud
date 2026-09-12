#!/bin/bash

WORKSPACE=$(dirname "$(realpath '${0}')")

SRC_DIR="/opt/private-cloud"
DATA_DIR="/data/irext"

LOG_FILE="/data/irext/log/start_irext.log"
BACKEND_START_LOG="/data/irext/log/backend_start.log"
CONSOLE_START_LOG="/data/irext/log/console_start.log"

source /etc/profile

mkdir -p "${DATA_DIR}/config"
mkdir -p "${DATA_DIR}/database"
mkdir -p "${DATA_DIR}/log"
mkdir -p "${DATA_DIR}/temp_data"

exec > >(tee -a "${LOG_FILE}") 2>&1

service mysql restart

echo ""
sleep 5

service redis-server restart

echo ""
sleep 5

echo "Stopping private-backend"
pkill java
sleep 2

echo "Starting private-backend"
cp -f "${SRC_DIR}/private-backend/src/main/java/net/irext/decode/sdk/libs/libirdecode_jni.so" "${DATA_DIR}/"
nohup java -Dirext.server.appkey="${APP_KEY}" -Dirext.server.appsecret="${APP_SECRET}" -jar "${SRC_DIR}/private-backend/package/private-backend.jar" >> "${BACKEND_START_LOG}" 2>&1 &

echo ""
sleep 5

echo "Stopping private-console"
cd   "${SRC_DIR}/private-console"
pkill node

echo "Starting private-console"
sleep 2
./startup.sh >> "${CONSOLE_START_LOG}" 2>&1 &

cd "${WORKSPACE}"

echo "IRext private server started"

/bin/bash