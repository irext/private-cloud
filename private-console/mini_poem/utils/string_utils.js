exports.randomChar = function(l) {
    let x = "0123456789qwertyuioplkjhgfdsazxcvbnm";
    let tmp = "";
    for(let i = 0;i < l; i++)  {
        tmp += x.charAt(Math.ceil(Math.random()*100000000)%x.length);
    }
    return  tmp;
};

exports.randomNumber = function(l) {
    let x = "0123456789";
    let tmp = "";
    for(let i = 0;i < l; i++)  {
        tmp += x.charAt(Math.ceil(Math.random()*100000000)%x.length);
    }
    return  tmp;
};

exports.validateEmail = function (email) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

function rnd() {
    let today = new Date();
    let seed = today.getTime();
    seed = (seed * 9301 + 49297) % 233280;
    return seed / (233280.0);
}

function cr(number) {
    return Math.ceil(rnd() * number);
}

function isNumber() {
    let r = /^[0-9]*[1-9][0-9]*$/;
    return r.test(str);
}