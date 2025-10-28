# irext-web-console
IR remote control code mangement service and web portal for IRext

### Runtime environment
Node.js V4.X.X is required, you could download it from [Node.js V4.8.3](https://nodejs.org/dist/v4.8.3/) for latest release

Run following commands in your Linux bash or Windows cmd

```shell script
npm install
npm install -g express
npm install -g bower
cd web/public_js/
bower install
```

MySQL (at least version 5.5) is required

Redis is required


### Usage
Run ```./script_run.sh production``` to kick start the server

Visit http://yourDomain:8300/ with your browser
