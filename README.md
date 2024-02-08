# IRext Private Cloud

This repository is the private cloud edition of IRext web services

In order to deploy private cloud service to your IDC or ECS environment, a Docker or Kubernetes should be installed first, then download [docker image](http://irext-lib-release.oss-cn-hangzhou.aliyuncs.com/pc-docker-image/0.2.5/irext-private_0.2.5.tar.gz) and [data pack](https://irext-lib-release.oss-cn-hangzhou.aliyuncs.com/pc-docker-image/0.2.6/irext-private-data-20210815.tar.gz) and deploy with following commands:

````
sudo docker load < irext-private_x.x.x.tar.gz

sudo docker run -itd \
--name irext-private \
-v /data:/data \
-p 8080:8301 \
-p 8081:8081 \
irext-private:x.x.x /data/start_irext.sh

````

Then access the local console with URL http://localhost:8080

Refer to https://site.irext.net/doc/#local_console for more details.
