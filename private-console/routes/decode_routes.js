/**
 * Created by Strawmanbobi
 * 2016-12-24 (Xmas eve)
 */

let app = require('../irext_console.js');
let decodeService = require('../services/decode_service.js');

app.post('/irext/decode/decode_online', decodeService.decodeOnline);
