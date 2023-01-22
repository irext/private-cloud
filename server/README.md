# IRext private server

Private server is a runtime that any user can deploy and access it with IRext restful web service call or SDK.

### Runtime environment
- Java runtime 1.7 or above
- Mysql server 5.6 or above
- Redis service
- A Linux OS is preferred

### Deploy
- Fetch or compile libirda_decoder.so out of source code of irext/core.
- Run following command when you fetched or compiled the private-server.jar out of the private server Spring-Boot project.

```shell script
java -jar private-server.jar
```


### Usage
Please refer to Web API in https://site.irext.net/doc/ for restful webservice call.
