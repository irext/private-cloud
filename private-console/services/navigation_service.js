/**
 * Created by Strawmanbobi
 * 2016-12-05
 */

// system inclusion

/*
 * function :   Navigation to certain URL
 * parameter :  Name of page to navigate
 * return :     Redirect to the certain URL
 */
exports.navToURL = function(req, res) {
    let bodyParam = req.body;
    let page = bodyParam.page;
    res.redirect("/" + page);
};