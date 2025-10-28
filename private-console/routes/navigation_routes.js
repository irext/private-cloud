/**
 * Created by Strawmanbobi
 * 2016-12-05
 */

let app = require('../irext_console.js');
let navigationService = require('../services/navigation_service.js');

app.post('/irext/nav/nav_to_url', navigationService.navToURL);