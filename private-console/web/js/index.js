/**
 * Created by Strawmanbobi
 * 2016-11-13
 */

let LS_KEY_ID = "user_name";
let LS_KEY_TOKEN = "token";
let LS_KEY_LANG = "lang";

let userLang = "en-US";
let paramLang = getParameter('lang');

if (paramLang) {
    localStorage.setItem(LS_KEY_LANG, paramLang);
} else {
    // set LANG default to simplified Chinese
    localStorage.setItem(LS_KEY_LANG, "zh-CN");
}

userLang = navigator.language || paramLang;

i18n.init(function(err, t) {
    $(".page_index").i18n({ lng: userLang });
});

$("#document").ready(function() {

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

function popUpHintDialog(hint) {
    let textHint = $("#text_hint");
    textHint.empty();
    textHint.append(hint);
    $("#hint_dialog").modal();
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