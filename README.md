# IRext Private Cloud

This repository is the private cloud edition of IRext web services

In order to deploy private cloud service to your IDC or ECS environment, a Docker engine should be installed first, then download [docker image](https://irext-lib-release.oss-cn-hangzhou.aliyuncs.com/pc-docker-image/1.5.0/irext-private-container_1.5.0.tar.gz) and [data pack](https://irext-lib-release.oss-cn-hangzhou.aliyuncs.com/pc-docker-image/1.5.0/irext-private-data_1.5.0.tar.gz) and deploy with following commands:

````
sudo docker load < irext-private-container_1.5.0.tar.gz

tar -xf irext-private-data_1.5.0.tar.gz

sudo cp -r data /

sudo docker run -itd \
--name irext-private \
-v /data:/data \
-p 8080:8301 \
-p 8081:8081 \
irext-private:1.5.0 /data/start_irext.sh

````

Then access the local console with URL http://<server_ip>:8080

Refer to https://site.irext.net/doc/#local_console for more details.
