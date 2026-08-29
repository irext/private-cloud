/**
 * Created by strawmanbobi
 * 2016-11-27
 */

let app = require('../irext_console.js');
let intService = require('../services/code_manage_service.js');

app.post('/irext/code/list_provinces', intService.listProvinces);
app.post('/irext/code/list_cities', intService.listCities);
app.post('/irext/code/list_operators', intService.listOperators);
app.post('/irext/code/list_categories', intService.listCategories);
app.post('/irext/code/list_brands', intService.listBrands);
app.post('/irext/code/list_indexes', intService.listIndexes);
app.post('/irext/code/list_ir_protocols', intService.listIRProtocols);

app.get('/irext/code/list_remote_indexes', intService.listRemoteIndexes);
app.get('/irext/code/search_remote_indexes', intService.searchRemoteIndexes);

app.get('/irext/code/download_remote_index', intService.downloadRemoteIndex);

app.get('/irext/code/update_status', intService.updateStatus);

app.post('/irext/code/update_private_data', intService.updatePrivateData);

app.post('/irext/code/upload_offline_data', intService.uploadOfflineData);
