/**
 * Created by Strawmanbobi
 * 2017-05-24
 */

let LS_KEY_ID = "user_name";
let LS_KEY_TOKEN = "token";
let LS_KEY_LANG = "lang";

let userLang = "en-US";
let paramLang = getParameter('lang');

// language priority: url parameter > browser language > simplified Chinese
// only persist to localStorage when explicitly set via URL parameter
userLang = paramLang || navigator.language || "zh-CN";
if (paramLang) {
    localStorage.setItem(LS_KEY_LANG, paramLang);
}

i18n.init(function(err, t) {
    $(".page_error").i18n({ lng: userLang });
    // <title> lives in <head>, out of the reach of $(".page_error").i18n(), translate it explicitly
    document.title = i18n.t('page_error.title_error', { lng: userLang });
    // keep the document language in sync with the resolved UI language
    document.documentElement.lang = (userLang.indexOf('zh') === 0) ? 'zh-cmn' : 'en';
});

$(document).ready(function() {
    localStorage.removeItem(LS_KEY_ID);
    localStorage.removeItem(LS_KEY_TOKEN);
});
