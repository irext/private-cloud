#!/bin/bash
source /etc/profile
chown mysql:mysql /data/mysql -R
chmod 755 /data/mysql -R
service mysql restart
sleep 5
service redis-server restart
sleep 5
nohup java -jar /data/irext/private-cloud/server/package/private-server-0.2.5.jar > log.out 2>&1 &
echo "private server started"
sleep 5
cd /data/irext/private-cloud/console
./startup.sh
echo "private console started"
/bin/bash

