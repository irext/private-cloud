/**
 * Created by Strawmanbobi
 * 2016-11-13
 */

var LS_KEY_ID = "user_name";
var LS_KEY_TOKEN = "token";
var LS_KEY_LANG = "lang";

var userLang = "en-US";
var paramLang = getParameter('lang');

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
    var userName = $("#user_name").val();
    var password = $("#password").val();
    if (null == userName || "" === userName || null == password || "" === password) {
        toastr.error(i18n.t('page_index.d_signin_fill_email_pw', { lng: userLang }));
        return;
    }
    var pwHash = MD5(password);
    doSignIn(userName, pwHash);
}

function onChangePassword() {
    var userName = $("#user_name").val();
    if (null == userName || "" === userName) {
        toastr.error(i18n.t('page_index.d_signin_fill_email', { lng: userLang }));
        return;
    }
    $("#changepw_confirm_dialog").modal();
}

function popUpHintDialog(hint) {
    var textHint = $("#text_hint");
    textHint.empty();
    textHint.append(hint);
    $("#hint_dialog").modal();
}

function navigateToPage(page, id, token) {
    var form = $("<form method='post'></form>"),
        input;
    form.attr({"action" : "/irext/nav/nav_to_url"});

    input = $("<input type='hidden'>");
    input.attr({"name": "admin_id"});
    input.val(id);
    form.append(input);

    input = $("<input type='hidden'>");
    input.attr({"name": "token"});
    input.val(token);
    form.append(input);

    input = $("<input type='hidden'>");
    input.attr({"name": "page"});
    input.val(page);
    form.append(input);

    form.submit();
}

function changePassword() {
    var userName = $("#user_name").val();
    if (null == userName || "" === userName) {
        popUpHintDialog(i18n.t('page_index.d_signin_fill_email', { lng: userLang }));
        return;
    }
    $.ajax({
        url: "/irext/certificate/change_pw",
        type: "POST",
        data: {
            user_name : userName,
            callback_url : window.location.hostname
        },
        timeout: 20000,
        success: function (response) {
            if(response.status.code === 0) {
                $("#changepw_confirm_dialog").modal('hide');
                popUpHintDialog(i18n.t('page_index.d_signup_email_sent', { lng: userLang }));
            } else {
                $("#changepw_confirm_dialog").modal('hide');
                popUpHintDialog(i18n.t('page_index.d_signup_email_failed', { lng: userLang }));
            }
        },
        error: function () {
            $("#changepw_confirm_dialog").modal('hide');
            popUpHintDialog(i18n.t('page_index.d_signup_email_failed', { lng: userLang }));
        }
    });
}

function doSignIn(userName, password) {
    var token = "";
    var adminID = "";
    $.ajax({
        url: "/irext/certificate/admin_login",
        type: "POST",
        data: JSON.stringify({user_name: userName, password: password}),
        contentType: "application/json; charset=utf-8",
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                token = response.entity.token;
                adminID = response.entity.id;
                toastr.success(i18n.t('page_index.d_signin_success', { lng: userLang }));
                var permission = token.substring(token.indexOf(",") + 1);
                var index = null;
                var page = "";
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