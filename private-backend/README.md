# IRext Private Backend

Private server is a runtime that any user can deploy and access it with IRext restful web service call or SDK.

### Runtime environment
- Java runtime 1.7 or above
- Mysql server 8.0 or above
- Redis server 4.0 or above
- A Linux OS is preferred

### Deploy
- Fetch or compile libirdecode_jni.so out of source code of irext/core.
- Run following command when you fetched or compiled the private-backend-<version>.jar out of the private server Spring-Boot project.

```shell script
java -jar private-backend-<version>.jar
```


### Usage
Please refer to Web API in https://site.irext.net/doc/ for restful webservice call.
