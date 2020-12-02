/**
 * Created by strawmanbobi
 * 2016-11-27
 */

let app = require('../irext_console.js');
let authenticationService = require('../services/authentication_service.js');

app.post('/irext/certificate/admin_login', authenticationService.adminLogin);
app.post('/irext/certificate/token_verify', authenticationService.verifyToken);