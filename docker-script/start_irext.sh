#!/bin/bash
WORKSPACE=$(dirname "$(realpath '${0}')")
source /etc/profile
chown mysql:mysql /data/mysql -R
chmod 755 /data/mysql -R
service mysql restart
service redis-server restart
sleep 5

echo "Stopping private-backend"
pkill java
sleep 2

echo "Starting private-backend"
nohup java -jar /data/irext/private-cloud/private-backend/package/private-backend-1.5.0.jar > log.out 2>&1 &
sleep 5

echo "Stopping private-console"
cd /data/irext/private-cloud/private-console
pkill node

echo "Starting private-console"
sleep 2
./startup.sh

cd ${WORKSPACE}

echo "IRext private server started"
/bin/bash

