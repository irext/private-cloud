/**
 * Created by strawmanbobi
 * 2017-03-27
 */

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
