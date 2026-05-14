/**
 * Created by strawmanbobi
 * 2016-11-27
 */

let app = require('../irext_console.js');
let intService = require('../services/code_manage_service.js');

app.post('/irext/int/list_provinces', intService.listProvinces);
app.post('/irext/int/list_cities', intService.listCities);
app.post('/irext/int/list_operators', intService.listOperators);
app.post('/irext/int/list_categories', intService.listCategories);
app.post('/irext/int/list_brands', intService.listBrands);
app.post('/irext/int/list_indexes', intService.listIndexes);
app.post('/irext/int/list_ir_protocols', intService.listIRProtocols);




app.get('/irext/int/list_remote_indexes', intService.listRemoteIndexes);
app.get('/irext/int/search_remote_indexes', intService.searchRemoteIndexes);

app.get('/irext/int/download_remote_index', intService.downloadRemoteIndex);
