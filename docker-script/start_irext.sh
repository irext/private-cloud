#!/bin/bash
WORKSPACE=$(dirname "$(realpath '${0}')")
LOG_FILE="${WORKSPACE}/logs/start_irext.log"
BACKEND_START_LOG="${WORKSPACE}/logs/backend_start.log"
CONSOLE_START_LOG="${WORKSPACE}/logs/console_start.log"
source /etc/profile

mkdir -p "${WORKSPACE}/logs"

exec > >(tee -a "$LOG_FILE") 2>&1

service mysql restart

echo ""
sleep 5

if [[ ! -f "/data/.data_inited" ]]; then
  echo "Initializing data"
  mysql < /data/irext/database/db/irext_db_20260519_mysql.sql -uroot -proot
  touch /data/.data_inited
  chmod 400 /data/.data_inited
fi
sleep 5

service redis-server restart

echo ""
sleep 5

echo "Stopping private-backend"
pkill java
sleep 2

echo "Starting private-backend"
nohup java -Dirext.server.appkey="$APP_KEY" -Dirext.server.appsecret="$APP_SECRET" -jar /data/irext/private-cloud/private-backend/package/private-backend-1.5.3.jar >> ${BACKEND_START_LOG} 2>&1 &

echo ""
sleep 5

echo "Stopping private-console"
cd /data/irext/private-cloud/private-console
pkill node

echo "Starting private-console"
sleep 2
./startup.sh >> ${CONSOLE_START_LOG} 2>&1 &

cd ${WORKSPACE}

echo "IRext private server started"

/bin/bash