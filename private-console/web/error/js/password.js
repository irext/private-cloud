/**
 * Created by Strawmanbobi
 * 2016-12-02
 */

let LS_KEY_ID = "user_name";
let LS_KEY_TOKEN = "token";

let userLang = "en-US";
let paramLang = getParameter('lang') || localStorage.getItem(LS_KEY_LANG);

if (paramLang) {
    localStorage.setItem(LS_KEY_LANG, paramLang);
} else {
    // set LANG default to simplified Chinese
    localStorage.setItem(LS_KEY_LANG, "zh-CN");
}

userLang = navigator.language || paramLang;

i18n.init(function(err, t) {
    $(".page_error").i18n({ lng: userLang });
});

$(document).ready(function() {
    let password = getParameter('password');
    let result = getParameter('result');
    let indFrame = $("#plain_password");
    let indContent = "";

    if (result === 1) {
        indContent = i18n.t("page_error.change_pw_success", { lng: userLang }) + password;
    } else {
        indContent = i18n.t("page_error.change_pw_fail", { lng: userLang });
    }

    indFrame.empty();
    indFrame.html(indContent);

    localStorage.removeItem(LS_KEY_ID);
    localStorage.removeItem(LS_KEY_TOKEN);
});
