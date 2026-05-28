/**
 * Created by strawmanbobi
 * 2017-03-27
 */

// Global variables for online decode
var currentControl = {
    indexId: 0,
    keyCode: 0,
    paraData: 0,
    directDecode: 0
};

var acStatus = {
    power: 0,
    mode: 0,
    temp: 0,
    wind_speed: 0,
    wind_dir: 0,
    change_wind_direction: 0
};

var g_sendToEmitter = false;

// AC status constants
var acPowers = ['Off', 'On'];
var acModes = ['Cool', 'Dry', 'Fan', 'Heat', 'Auto'];
var acSpeed = ['Auto', 'Low', 'Medium', 'High'];
var acSwing = ['Fixed', 'Swing'];
var acChangeWindDir = ['No', 'Yes'];

function downloadBin() {
    let downloadURL = "";
    if(null == selectedRemote) {
        popUpHintDialog(i18n.t("page_code.d_hint_common_select_index", { lng: userLang }));
        return;
    }
    downloadURL = '/irext/code/download_remote_index?remote_index_id='+selectedRemote.id+'&admin_id='+id+'&token='+token;

    if (null != client && client === 'console') {
        // directly download binary to remote via serial port
    } else {
        window.open(
            downloadURL,
            '_blank'
        );
    }
}

// Open online decode dialog
function onDecodeOnline(toEmitter) {
    let titlePrefix = '';

    if (null === selectedRemote) {
        popUpHintDialog(i18n.t("page_code.d_hint_common_select_index", {lng: userLang}));
        return;
    }

    fillKeyMapping();

    titlePrefix = i18n.t("page_code.d_try_index_title", {lng: userLang});
    
    g_sendToEmitter = false;
    resetKeyPressInfo();
    changeDialogTitleWithRemote($('#decode_online_title'), titlePrefix, selectedRemote);
    $('#decode_dialog').modal({backdrop: 'static', keyboard: false});
}

// Fill key mapping based on category
function fillKeyMapping() {
    let keyMapping = keyMappings[selectedRemote.category_id - 1];
    let keys = keyMapping.keys;

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let keyEle = $('#' + key.id);
        keyEle.attr('class', key.icon);
        keyEle.attr('name', key.name);
        if (key.enabled) {
            keyEle.prop('disabled', false);
        } else {
            keyEle.prop('disabled', true);
        }
        keyEle.tooltip('destroy')
            .attr('title', key.desc)
            .tooltip('hide');
    }
    if (CATEGORY_STB === selectedRemote.category_id) {
        $('.stb_keys').show();
    } else {
        $('.stb_keys').hide();
    }
}

// Change dialog title with remote info
function changeDialogTitleWithRemote(dialogTitle, prefix, remote) {
    let remoteName = '';
    if (parseInt(remote.category_id) === CATEGORY_STB) {
        remoteName = remote.city_name + ' ' + remote.category_name;
    } else {
        remoteName = remote.brand_name + ' ' + remote.category_name;
    }
    if (undefined !== remote.priority && null !== remote.priority) {
        remoteName += '-' + remote.priority;
    }
    dialogTitle.text(prefix + ' ' + remoteName);
}

// Close decode dialog
function quitDecode() {
    $('#decode_dialog').modal('hide');
}

// Reset key press info display
function resetKeyPressInfo() {
    let wave_value = $('#ir_wave_value');
    $('#key_press_d').text('');
    $('#ac_status_power_d').text('');
    $('#ac_status_mode_d').text('');
    $('#ac_status_temp_d').text('');
    $('#ac_status_speed_d').text('');
    $('#ac_status_swing_d').text('');
    $('#ac_status_change_wind_dir_d').text('');
    wave_value.empty();
    wave_value.html(i18n.t("page_code.d_invoke_hint", {lng: userLang}));
    
    // Reset AC status
    acStatus = {
        power: 0,
        mode: 0,
        temp: 0,
        wind_speed: 0,
        wind_dir: 0,
        change_wind_direction: 0
    };
    
    // Clear waveform chart if it exists
    if (typeof resetWave === 'function') {
        resetWave();
    }
}

// Handle control button click and call decode API
function onControlClick(buttonID) {
    // translate to application server style parameters
    let keyId = buttonID.substring(4); // e.g., "pos_power" -> "power"
    currentControl.indexId = parseInt(selectedRemote.id);

    // Find the keyCode from key mapping
    // buttonID is like "pos_power", we need to find its name like "btn_0", then extract 0
    let keyCode = -1;
    let keyMapping = keyMappings[selectedRemote.category_id - 1];
    if (keyMapping) {
        let keys = keyMapping.keys;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].id === buttonID && keys[i].name) {
                // Extract number from "btn_X"
                let nameParts = keys[i].name.split('_');
                if (nameParts.length === 2) {
                    keyCode = parseInt(nameParts[1]);
                }
                break;
            }
        }
    }
    
    // If not found in mapping, try to extract from number buttons
    if (keyCode === -1 && buttonID.startsWith('pos_num_')) {
        keyCode = parseInt(buttonID.substring(8)); // "pos_num_5" -> 5
    }
    
    console.log('Button ID:', buttonID, ', Key Code:', keyCode);

    if (selectedRemote.para === 0) {
        currentControl.keyCode = keyCode;
        currentControl.paraData = 0;
    } else {
        currentControl.keyCode = keyCode;
        currentControl.directDecode = 1;
        currentControl.paraData = 1;
    }
    resetKeyPressInfo();
    $.ajax({
        url: '/irext/decode/decode_online',
        type: 'POST',
        dataType: 'json',
        data: currentControl,
        timeout: 20000,
        success: function (response) {
            if (response.status.code === 0) {
                let irWaveValue = $('#ir_wave_value');
                updateKeyPressInfo(keyCode, response.entity);
                let keyValueStr = response.entity;
                if (null === keyValueStr || keyValueStr.length < 5) {
                    if (selectedRemote.intStatus === ITEM_INVALID ||
                        selectedRemote.intStatus === ITEM_FAILED) {
                        toastr.error(i18n.t("page_code.d_hint_decode_failed", {lng: userLang}));
                    } else {
                        keyValueStr = i18n.t('page_code.d_hint_decode_retry', {lng: userLang});
                    }
                } else if (keyValueStr === '[0,0]') {
                    keyValueStr = i18n.t('page_code.d_hint_decode_no_key_value', {lng: userLang});
                }
                irWaveValue.text(keyValueStr);
                let keyValue = keyValueStr.substring(1, keyValueStr.length - 1);
                if (typeof waverizeKeyValue === 'function') {
                    waverizeKeyValue(keyValue);
                }
            } else {
                toastr.error(i18n.t("page_code.d_hint_decode_failed", {lng: userLang}));
            }
        },
        error: function (xhr, status, error) {
            toastr.error(i18n.t("page_code.d_hint_decode_failed", {lng: userLang}));
        },
        complete: function() {
            ;
        }
    });
}

// Update key press info display
function updateKeyPressInfo(buttonID, keyValue) {
    let keyName = '';
    if (buttonID < 14) {
        keyName = findDescByKeyName(selectedRemote.category_id, buttonID);
    } else {
        keyName = 'num-' + (buttonID - 14);
    }
    $('#key_press_d').text(i18n.t("page_code.d_hint_decode_key", {lng: userLang}) + keyName);

    if (CATEGORY_AC === selectedRemote.category_id) {
        $('#ac_status_power_d').text(i18n.t("page_code.d_hint_decode_ac_power", {lng: userLang}) + acPowers[acStatus.power]);
        $('#ac_status_mode_d').text(i18n.t("page_code.d_hint_decode_ac_mode", {lng: userLang}) + acModes[acStatus.mode]);
        $('#ac_status_temp_d').text(i18n.t("page_code.d_hint_decode_ac_temp", {lng: userLang}) + (16 + parseInt(acStatus.temp)));
        $('#ac_status_speed_d').text(i18n.t("page_code.d_hint_decode_ac_wind_speed", {lng: userLang}) + acSpeed[acStatus.wind_speed]);
        $('#ac_status_swing_d').text(i18n.t("page_code.d_hint_decode_ac_wind_dir", {lng: userLang}) + acSwing[acStatus.wind_dir]);
        $('#ac_status_change_wind_dir_d').text(i18n.t("page_code.d_hint_decode_ac_change_wind_dir", {lng: userLang}) + acChangeWindDir[acStatus.change_wind_direction]);
    } else {
        $('#ac_status_power_d').text('');
        $('#ac_status_mode_d').text('');
        $('#ac_status_temp_d').text('');
        $('#ac_status_speed_d').text('');
        $('#ac_status_swing_d').text('');
        $('#ac_status_change_wind_dir_d').text('');
    }
}

// Bind click events to control buttons
$(document).ready(function() {
    // Bind all position buttons
    $('[id^="pos_"]').click(function() {
        let buttonId = $(this).attr('id');
        onControlClick(buttonId);
    });
});
