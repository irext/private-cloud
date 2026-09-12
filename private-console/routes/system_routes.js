/**
 * Created by Strawmanbobi
 * 2026-09-08
 */
let app = require('../irext_console.js');
let systemService = require('../services/system_service.js');

app.get('/irext/config', systemService.getConfig);
