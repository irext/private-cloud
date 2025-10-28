/**
 * Created by strawmanbobi
 * 2017-03-27
 */

// web COM socket
let ws = null;
let transferSocketConnected = false;
let serialPortConnected = false;

// initialize transfer object
let binToTransfer = {
    category_id : 0,
    content : null,
    length : 0
};

let keyNames = [
    "POWER", "UP", "DOWN", "LEFT", "RIGHT", "OK", "PLUS", "MINUS", "HOME", "BACK", "MENU"
];

let acPowers = ["ON", "OFF"];
let acTempBegin = 16;
let acModes = ["Cool", "Heat", "Auto", "Fan", "DEHUMID"];
let acSpeed = ["Low", "Medium", "High", "Auto"];
let acSwing = ["ON", "OFF"];
let acStatus = {
    power: 0,
    temp: 8,
    mode: 0,
    wind_dir: 0,
    wind_speed: 0
};

let decodedReceiverTimer = null;
let decodedValue = [];
let decodedReceiving = false;


let transferState = TRANSFER_STATE_NONE;

let BIN_TRANSFER_BYTE_MAX = 16;

function downloadBin() {
    let downloadURL = "";
    if(null == selectedRemote) {
        popUpHintDialog(i18n.t("page_code.d_hint_common_select_index", { lng: userLang }));
        return;
    }
    downloadURL = '/irext/int/download_remote_index?remote_index_id='+selectedRemote.id+'&admin_id='+id+'&token='+token;

    if (null != client && client === 'console') {
        // directly download binary to remote via serial port
    } else {
        window.open(
            downloadURL,
            '_blank'
        );
    }
}