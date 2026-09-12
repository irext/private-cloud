/**
 * Created by Strawmanbobi
 * 2026-09-11
 */
let app = require('../irext_console.js');
let initSetupService = require('../services/init_setup_service.js');

app.get('/irext/init_setup/check', initSetupService.checkInitialized);
app.post('/irext/init_setup/verify_identity', initSetupService.verifyIdentity);
app.post('/irext/init_setup/complete', initSetupService.completeSetup);
