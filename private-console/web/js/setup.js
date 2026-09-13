/**
 * Created by Strawmanbobi
 * 2026-09-11
 */

let setupLang = "en-US";
let setupCurrentStep = 1;
let setupDeployMode = "hybrid";
let setupSseCompleted = false;

$(document).ready(function() {
    // reuse the language resolved by index.js so that static texts (data-i18n) and
    // dynamic texts (i18n.t) are rendered in the very same language
    if (typeof userLang !== "undefined" && userLang) {
        setupLang = userLang;
    } else {
        setupLang = getParameter('lang') || navigator.language || "zh-CN";
    }

    checkInitStatus();
});

function checkInitStatus() {
    $.ajax({
        url: '/irext/init_setup/check',
        type: 'GET',
        dataType: 'json',
        timeout: 5000,
        success: function(response) {
            if (response.status.code === 0 && response.entity && response.entity.initialized) {
                showLoginArea();
            } else {
                showSetupArea();
            }
        },
        error: function() {
            showLoginArea();
        }
    });
}

function showLoginArea() {
    $('#setup_area').hide();
    $('#login_area').show();
}

function showSetupArea() {
    $('#login_area').hide();
    $('#setup_area').show();
    loadServerConfig();
}

function loadServerConfig() {
    $.ajax({
        url: '/irext/config',
        type: 'GET',
        dataType: 'json',
        timeout: 5000,
        success: function(response) {
            if (response.status.code === 0 && response.entity) {
                let config = response.entity;
                // set default mode based on server config
                if (config.default_mode) {
                    $('input[name="deploy_mode"][value="' + config.default_mode + '"]').prop('checked', true);
                    $('#' + config.default_mode + '_default_hint').show();
                }
                // if backend is offline, disable hybrid cloud option
                if (config.offline) {
                    $('input[name="deploy_mode"][value="hybrid"]').prop('disabled', true);
                    $('input[name="deploy_mode"][value="offline"]').prop('checked', true);
                    $('#offline_default_hint').show();
                    $('#hybrid_default_hint').hide();
                    $('#hybrid_unavailable_hint').show();
                }
            }
            goToStep(1);
        },
        error: function() {
            // failed to get config, proceed with default
            goToStep(1);
        }
    });
}

function goToStep(step) {
    for (let i = 1; i <= 4; i++) {
        $('#setup_step_' + i).hide();
        $('#step_indicator_' + i).removeClass('active completed');
    }

    for (let i = 1; i < step; i++) {
        $('#step_indicator_' + i).addClass('completed');
    }
    $('#step_indicator_' + step).addClass('active');

    $('#setup_step_' + step).show();
    setupCurrentStep = step;

    if (step === 2) {
        setupDeployMode = $('input[name="deploy_mode"]:checked').val();
        if (setupDeployMode === 'hybrid') {
            $('#hybrid_verify_panel').show();
            $('#offline_verify_panel').hide();
        } else {
            $('#hybrid_verify_panel').hide();
            $('#offline_verify_panel').show();
        }
        // reset verify button state when returning to step 2
        $('#btn_verify_identity').prop('disabled', false);
    }

    if (step === 3) {
        if (setupDeployMode === 'hybrid') {
            $('#hybrid_import_panel').show();
            $('#offline_import_panel').hide();
        } else {
            $('#hybrid_import_panel').hide();
            $('#offline_import_panel').show();
            let fileInput = document.getElementById('setup_data_file');
            if (fileInput && !fileInput.bsCustomFileInput) {
                bsCustomFileInput.init('#setup_data_file');
            }
            $('#offline_import_panel .form-group').show();
        }
        $('#setup_hybrid_progress').hide();
        $('#setup_offline_progress').hide();
        $('#btn_import_data').prop('disabled', false).find('span').text(i18n.t('page_setup.btn_import', { lng: setupLang }));
        $('#btn_setup_back_step2').prop('disabled', false);
    }
}

function verifyIdentity() {
    let $btn = $('#btn_verify_identity');
    $btn.prop('disabled', true);

    let requestData = { mode: setupDeployMode };

    if (setupDeployMode === 'hybrid') {
        let email = $('#setup_cloud_email').val();
        let password = $('#setup_cloud_password').val();
        if (!email || !password) {
            toastr.error(i18n.t('page_setup.verify_fill_fields', { lng: setupLang }));
            $btn.prop('disabled', false);
            return;
        }
        requestData.user_name = email;
        requestData.password = MD5(password);
    } else {
        let appSecret = $('#setup_app_secret').val();
        if (!appSecret) {
            toastr.error(i18n.t('page_setup.verify_fill_secret', { lng: setupLang }));
            $btn.prop('disabled', false);
            return;
        }
        requestData.app_secret = appSecret;
    }

    $.ajax({
        url: '/irext/init_setup/verify_identity',
        type: 'POST',
        data: JSON.stringify(requestData),
        contentType: 'application/json; charset=utf-8',
        timeout: 20000,
        success: function(response) {
            if (response.status.code === 0) {
                toastr.success(i18n.t('page_setup.verify_success', { lng: setupLang }));
                setTimeout(function() {
                    goToStep(3);
                }, 1500);
            } else {
                toastr.error(i18n.t('page_setup.verify_failed', { lng: setupLang }));
                $btn.prop('disabled', false);
            }
        },
        error: function() {
            toastr.error(i18n.t('page_setup.verify_failed', { lng: setupLang }));
            $btn.prop('disabled', false);
        }
    });
}

function startDataImport() {
    let $btn = $('#btn_import_data');
    $btn.prop('disabled', true).find('span').text(i18n.t('page_setup.importing', { lng: setupLang }));
    $('#btn_setup_back_step2').prop('disabled', true);

    if (setupDeployMode === 'hybrid') {
        startHybridImport();
    } else {
        startOfflineImport();
    }
}

function startHybridImport() {
    console.log('[setup] startHybridImport: connecting SSE...');
    $('#setup_hybrid_progress').show();
    setupSseCompleted = false;

    let eventSource = new EventSource('/irext/code/update_status');

    eventSource.onopen = function() {
        console.log('[setup] SSE connected, waiting 500ms before POST...');
    };

    eventSource.onmessage = function(event) {
        try {
            let data = JSON.parse(event.data);
            console.log('[setup] SSE event:', JSON.stringify(data));
            renderSetupProgress(data, '#setup_hybrid_status');

            if (data.step === 'completed' || data.step === 'failed') {
                setupSseCompleted = true;
                eventSource.close();
                onImportFinished(data.step === 'completed');
            }
        } catch (e) {
            console.error('[setup] SSE parse error:', e.message);
        }
    };

    eventSource.onerror = function(e) {
        console.error('[setup] SSE error, readyState:', eventSource.readyState);
        if (!setupSseCompleted) {
            eventSource.close();
            onImportFinished(false);
        }
    };

    setTimeout(function() {
        console.log('[setup] sending POST /irext/code/update_private_data...');
        $.ajax({
            url: '/irext/code/update_private_data',
            type: 'POST',
            dataType: 'json',
            data: {},
            timeout: 300000,
            success: function(response) {
                console.log('[setup] POST response:', JSON.stringify(response));
                if (response && response.status && response.status.code !== 0 && !setupSseCompleted) {
                    onImportFinished(false);
                }
            },
            error: function(xhr, status, error) {
                console.error('[setup] POST error, status:', xhr.status, 'text:', xhr.responseText);
                if (!setupSseCompleted) {
                    onImportFinished(false);
                }
            }
        });
    }, 500);
}

function startOfflineImport() {
    let fileInput = document.getElementById('setup_data_file');
    let file = fileInput.files[0];

    if (!file) {
        toastr.error(i18n.t('page_setup.select_file_first', { lng: setupLang }));
        $('#btn_import_data').prop('disabled', false).find('span').text(i18n.t('page_setup.btn_import', { lng: setupLang }));
        $('#btn_setup_back_step2').prop('disabled', false);
        return;
    }

    if (!file.name.endsWith('.tar.gz.enc') && !file.name.endsWith('.enc')) {
        toastr.error(i18n.t('page_setup.invalid_file_format', { lng: setupLang }));
        $('#btn_import_data').prop('disabled', false).find('span').text(i18n.t('page_setup.btn_import', { lng: setupLang }));
        $('#btn_setup_back_step2').prop('disabled', false);
        return;
    }

    if (file.size > 200 * 1024 * 1024) {
        toastr.error(i18n.t('page_setup.file_too_large', { lng: setupLang }));
        $('#btn_import_data').prop('disabled', false).find('span').text(i18n.t('page_setup.btn_import', { lng: setupLang }));
        $('#btn_setup_back_step2').prop('disabled', false);
        return;
    }

    console.log('[setup] startOfflineImport: file=', file.name, 'size=', file.size);
    $('#offline_import_panel .form-group').hide();
    $('#setup_offline_progress').show();
    setupSseCompleted = false;

    console.log('[setup] connecting SSE...');
    let eventSource = new EventSource('/irext/code/update_status');

    eventSource.onopen = function() {
        console.log('[setup] SSE connected, waiting 500ms before upload...');
    };

    eventSource.onmessage = function(event) {
        try {
            let data = JSON.parse(event.data);
            console.log('[setup] SSE event:', JSON.stringify(data));
            renderSetupProgress(data, '#setup_offline_status');

            if (data.step === 'completed' || data.step === 'failed') {
                setupSseCompleted = true;
                eventSource.close();
                onImportFinished(data.step === 'completed');
            }
        } catch (e) {
            console.error('[setup] SSE parse error:', e.message);
        }
    };

    eventSource.onerror = function(e) {
        console.error('[setup] SSE error, readyState:', eventSource.readyState);
        if (!setupSseCompleted) {
            eventSource.close();
            onImportFinished(false);
        }
    };

    setTimeout(function() {
        console.log('[setup] uploading file...');
        let formData = new FormData();
        formData.append('data_file', file);

        $.ajax({
            url: '/irext/code/upload_offline_data',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            timeout: 300000,
            success: function(response) {
                console.log('[setup] upload response:', JSON.stringify(response));
                if (response && response.status && response.status.code !== 0 && !setupSseCompleted) {
                    eventSource.close();
                    onImportFinished(false);
                }
            },
            error: function(xhr, status, error) {
                console.error('[setup] upload error, status:', xhr.status, 'text:', xhr.responseText);
                if (!setupSseCompleted) {
                    eventSource.close();
                    onImportFinished(false);
                }
            }
        });
    }, 500);
}

function renderSetupProgress(data, statusSelector) {
    let stepKey = 'd_step_' + data.step;
    let stepName = i18n.t('page_code.' + stepKey, { lng: setupLang });
    if (stepName === stepKey) {
        stepName = data.message;
    }

    let icon, color;
    if (data.status === 'success') {
        icon = '<i class="fa fa-check" style="color: #5cb85c; margin-right: 5px;"></i>';
        color = '#5cb85c';
    } else if (data.status === 'error') {
        icon = '<i class="fa fa-times" style="color: #d9534f; margin-right: 5px;"></i>';
        color = '#d9534f';
    } else {
        icon = '<i class="fa fa-spinner fa-spin" style="color: #337ab7; margin-right: 5px;"></i>';
        color = '#333';
    }

    $(statusSelector).html(icon + '<span style="color: ' + color + ';">' + stepName + '</span>');
}

function onImportFinished(success) {
    if (success) {
        completeSetup();
    } else {
        toastr.error(i18n.t('page_setup.import_failed', { lng: setupLang }));
        $('#btn_import_data').prop('disabled', false).find('span').text(i18n.t('page_setup.btn_import', { lng: setupLang }));
        $('#btn_setup_back_step2').prop('disabled', false);
        $('#offline_import_panel .form-group').show();
    }
}

function completeSetup() {
    $.ajax({
        url: '/irext/init_setup/complete',
        type: 'POST',
        dataType: 'json',
        timeout: 5000,
        success: function(response) {
            if (response.status.code === 0) {
                goToStep(4);
            } else {
                toastr.error(i18n.t('page_setup.complete_failed', { lng: setupLang }));
            }
        },
        error: function() {
            toastr.error(i18n.t('page_setup.complete_failed', { lng: setupLang }));
        }
    });
}

function goToLogin() {
    window.location.reload();
}
