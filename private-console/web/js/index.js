/**
 * Created by Strawmanbobi
 * 2016-11-13
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
    $(".page_index").i18n({ lng: userLang });
    // <title> lives in <head>, out of the reach of $(".page_index").i18n(), translate it explicitly
    document.title = i18n.t('page_index.title', { lng: userLang });
    // keep the document language in sync with the resolved UI language
    document.documentElement.lang = (userLang.indexOf('zh') === 0) ? 'zh-cmn' : 'en';
    // append version from package.json to title
    $.ajax({
        url: '/irext/config',
        type: 'GET',
        dataType: 'json',
        timeout: 5000,
        success: function(response) {
            if (response.status.code === 0 && response.entity && response.entity.version) {
                let ver = response.entity.version;
                let $title = $('h3[data-i18n="page_index.title"]');
                if ($title.length > 0) {
                    $title.text($title.text() + ' ' + ver);
                }
                document.title = document.title + ' ' + ver;
            }
        }
    });
});

function signIn() {
    let userName = $("#user_name").val();
    let password = $("#password").val();
    if (null == userName || "" === userName || null == password || "" === password) {
        toastr.error(i18n.t('page_index.d_signin_fill_email_pw', { lng: userLang }));
        return;
    }
    let pwHash = MD5(password);
    doSignIn(userName, pwHash);
}

function doSignIn(userName, password) {
    let token = "";
    let adminID = "";
    $.ajax({
        url: "/irext/authenticate/admin_login",
        type: "POST",
        data: JSON.stringify({user_name: userName, password: password}),
        contentType: "application/json; charset=utf-8",
        timeout: 20000,
        success: function(response) {
            console.log(JSON.stringify(response))
            if(response.status.code === 0) {
                token = response.entity.token;
                adminID = response.entity.id;
                toastr.success(i18n.t('page_index.d_signin_success', { lng: userLang }));
                let permission = token.substring(token.indexOf(",") + 1);
                let index = null;
                let page = "";
                if (null != permission && permission !== "") {
                    index = permission.substring(0, 1);
                }
                if (null == index) {
                    window.location = "./error/auth_error.html";
                } else {
                    page = "code";
                }
                setTimeout(function() {
                    window.location = "./" + page + "/index.html";
                }, 3000);
                localStorage.setItem(LS_KEY_ID, adminID);
                localStorage.setItem(LS_KEY_TOKEN, token);
            } else {
                toastr.error(i18n.t('page_index.d_signin_failed', { lng: userLang }));
            }
        },
        error: function() {
            toastr.error(i18n.t('page_index.d_signin_failed', { lng: userLang }));
        }
    });
}