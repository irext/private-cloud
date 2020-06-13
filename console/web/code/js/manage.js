/**
 * Created by strawmanbobi
 * 2017-03-27
 */

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
    $(".page_code").i18n({ lng: userLang });
});

let CODE_TABLE_PADDING = 320;

let id = "";
let token = "";
let client = null;

let currentSubCate = 1;
let currentProtocol = null;
let currentProtocolType = 1;
let currentCategory = {
    id: 1,
    name: i18n.t("page_code.d_panel_category_init", { lng: userLang })
};

let currentFilterCategory = {
    id: 1,
    name: i18n.t("page_code.d_panel_category_init", { lng: userLang })
};

let currentBrand = null;
let currentFilterBrand = null;
let currentProvince = {
    code: '110000',
    name: i18n.t("page_code.d_panel_city_init", { lng: userLang })
};
let currentFilterProvince = {
    code: '110000',
    name: i18n.t("page_code.d_panel_city_init", { lng: userLang })
};
let currentCity = {
    code: '110100',
    name: i18n.t("page_code.d_panel_city_init", { lng: userLang })
};
let currentFilterCity = {
    code: '110100',
    name: i18n.t("page_code.d_panel_city_init", { lng: userLang })
};

let g_categories = [];
let g_brands = [];
let g_cities = [];
let g_stbOperators = [];

let currentOperator = null;

let selectedRemote = null;
let pass = 0;

let brandsToPublish = [];
let remoteIndexesToPublish = [];

///////////////////////////// Initialization /////////////////////////////

$('#menu_toggle').click(function(e) {
    if (null != client && client === 'console') {
        return;
    }
    e.preventDefault();
    $('#wrapper').toggleClass('toggled');
});

$(document).ready(function() {
    // get saved user id and token first
    id = localStorage.getItem(LS_KEY_ID);
    token = localStorage.getItem(LS_KEY_TOKEN);
    client = getParameter('client');

    initializeSelectors();

    $('#remote_file').change(function() {
        let filePath = $(this).val();
        let fileName = filePath.substring(filePath.lastIndexOf('\\') + 1, filePath.lastIndexOf('.'));
        $('#remote_name').val(fileName);
    });

    $('#protocol_file').change(function() {
        let filePath = $(this).val();
        let fileName = filePath.substring(filePath.lastIndexOf('\\') + 1, filePath.lastIndexOf('.'));
        $('#protocol_name_b').val(fileName);
    });

    $('.dob_cbtn').click(function() {
        onDoBClick(this.id);
    });

    updateTransferState(TRANSFER_STATE_NONE);

});

function initializeSelectors() {
    initializeFilterCategories();
    initializeFilterBrands();
    initializeFilterProvince();
    initializeSubCates();

    initializeProtocols();
    initializeCategories();
    initializeProvince();
}

function loadRemoteList(isSearch, remoteMap) {
    let url = null;

    if (isSearch && remoteMap) {
        url = '/irext/int/search_remote_indexes?remote_map='+
            remoteMap+'&from=0&count=2000&admin_id='+id+'&token='+token;
    } else {
        if(currentFilterCategory.id === 3) {
            url = '/irext/int/list_remote_indexes?category_id='+
                currentFilterCategory.id+'&city_code='+currentFilterCity.code+
                '&from=0&count=100&admin_id='+id+'&token='+token;
        } else {
            url = '/irext/int/list_remote_indexes?category_id='+
                currentFilterCategory.id+'&brand_id='+currentFilterBrand.id+
                '&from=0&count=100&admin_id='+id+'&token='+token;
        }
    }

    let tableContainer = $('#remote_table_container');
    tableContainer.empty();
    tableContainer.append('<table id="remote_table" data-row-style="rowStyle"></table>');

    $('#remote_table').bootstrapTable({
        method: 'get',
        url: url,
        cache: false,
        height: getViewPortHeight() - CODE_TABLE_PADDING,
        pagination: true,
        pageSize: 50,
        pageList: [10, 25, 50, 100, 200],
        search: true,
        showColumns: true,
        showRefresh: false,
        minimumCountColumns: 2,
        clickToSelect: true,
        singleSelect: true,
        showExport: true,
        exportDataType: 'all',
        exportTypes: ['txt', 'sql', 'excel'],
        columns: [{
            field: '',
            checkbox: true
        }, {
            field: 'category_name',
            title: i18n.t("page_code.d_table_category_cn", { lng: userLang }),
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'brand_name',
            title: i18n.t("page_code.d_table_brand_cn", { lng: userLang }),
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'city_name',
            title: i18n.t("page_code.d_table_city_cn", { lng: userLang }),
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'operator_name',
            title: i18n.t("page_code.d_table_operator_cn", { lng: userLang }),
            align: 'left',
            valign: 'middle',
            sortable: true,
            visible: false
        }, {
            field: 'priority',
            title: i18n.t("page_code.d_table_priority_cn", { lng: userLang }),
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'protocol',
            title: i18n.t("page_code.d_table_protocol_cn", { lng: userLang }),
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'remote',
            title: i18n.t("page_code.d_table_remote_cn", { lng: userLang }),
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'status',
            title: i18n.t("page_code.d_table_status_cn", { lng: userLang }),
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true
        }]
    }).on('check.bs.table', function (e, row) {
        onSelectRemote(row);
    }).on('uncheck.bs.table', function (e, row) {
        selectedRemote = null;
    }).on('load-success.bs.table', function (e, data) {
        let i = 0;
        for (i = 0; i < data.length; i++) {
            if (data[i].para === 0) {
                if (data[i].status === 1) {
                    data[i].status = i18n.t("page_code.d_status_published", { lng: userLang });
                } else if (data[i].status === 2) {
                    data[i].status = i18n.t("page_code.d_status_to_verify", { lng: userLang });
                } else if (data[i].status === 3) {
                    data[i].status = i18n.t("page_code.d_status_passed", { lng: userLang });
                } else if (data[i].status === 4) {
                    data[i].status = i18n.t("page_code.d_status_failed", { lng: userLang });
                } else if (data[i].status === 5) {
                    data[i].status = i18n.t("page_code.d_status_duplicated", { lng: userLang });
                }
            } else {
                data[i].status = 'From IRIS';
            }

            $('#remote_table').bootstrapTable('updateRow', {
                index: i,
                row: {
                    status: data[i].status,
                    para: data[i].para,
                }
            });
        }
    });
    selectedRemote = null;
}

function rowStyle(row, index) {
    let style = null;
    if (row.para === 0) {
        if (row.status === i18n.t("page_code.d_status_published", { lng: userLang })) {
            style = {
                classes: 'default'
            };
        } else if (row.status === i18n.t("page_code.d_status_to_verify", { lng: userLang })) {
            style = {
                classes: 'info'
            };
        } else if (row.status === i18n.t("page_code.d_status_passed", { lng: userLang })) {
            style = {
                classes: 'success'
            };
        } else if (row.status === i18n.t("page_code.d_status_failed", { lng: userLang })) {
            style = {
                classes: 'danger'
            };
        } else if (row.status === i18n.t("page_code.d_status_duplicated", { lng: userLang })) {
            style = {
                classes: 'warning'
            };
        } else {
            style = {
                classes: ''
            }
        }
    } else {
        style = {
            classes: 'info'
        };
    }
    return style;
}

function createRemote() {
    let remoteName = $('#remote_name').val();
    let remoteFile = $('#remote_file').val();
    let priority = $('#spinner').val();
    let subCate = $('#sub_cate').val();

    let remoteNumber = $('#remote_number').val();
    let versionPatten = new RegExp('[0-9]\\.[0-9]\\.[0-9]');

    if (!remoteName || "" === remoteName) {
        popUpHintDialog(i18n.t("page_code.d_hint_input_index_name", { lng: userLang }));
        return;
    }

    if (!remoteFile || "" === remoteFile) {
        popUpHintDialog(i18n.t("page_code.d_hint_input_index_file", { lng: userLang }));
        return;
    }

    let form = $('#remote_upload_form');
    form.attr('action', '/irext/int/create_remote_index');

    // set multipart-form parameters
    $('#category_name').val(currentCategory.name);
    $('#brand_name').val(currentBrand.name);
    $('#city_name').val(currentCity.name);
    $('#operator_name').val(currentOperator.operator_name);
    $('#protocol_name').val(currentProtocol.name);

    $('#category_name_tw').val(currentCategory.name_tw);
    $('#brand_name_tw').val(currentBrand.name_tw);
    $('#city_name_tw').val(currentCity.name_tw);
    $('#operator_name_tw').val(currentOperator.name_tw);
    $('#admin_id').val(id);

    form.submit();
    $('#create_remote_dialog').modal('hide');
    $('#uploading_dialog').modal();
}

function deleteRemote() {
    if(null == selectedRemote) {
        popUpHintDialog(i18n.t("page_code.d_hint_common_select_index", { lng: userLang }));
        return;
    }
    let remoteToDelete = selectedRemote;
    switch (remoteToDelete.status) {
        case i18n.t("page_code.d_status_published", { lng: userLang }):
            remoteToDelete.status = 1;
            break;
        case i18n.t("page_code.d_status_to_verify", { lng: userLang }):
            remoteToDelete.status = 2;
            break;
        case i18n.t("page_code.d_status_to_passed", { lng: userLang }):
            remoteToDelete.status = 3;
            break;
        case i18n.t("page_code.d_status_to_failed", { lng: userLang }):
            remoteToDelete.status = 4;
            break;
        case i18n.t("page_code.d_status_duplicated", { lng: userLang }):
            remoteToDelete.status = 5;
            break;
        default:
            remoteToDelete.status = 0;
            break;
    }

    remoteToDelete.admin_id = id;
    remoteToDelete.token = token;
    let deleteConfirmDialog = $('#delete_confirm_dialog');

    $.ajax({
        url: '/irext/int/delete_remote_index',
        type: 'POST',
        dataType: 'json',
        data: remoteToDelete,
        timeout: 20000,
        success: function (response) {
            if(response.status.code === 0) {
                deleteConfirmDialog.modal('hide');
                popUpHintDialog(i18n.t("page_code.d_hint_delete_success", { lng: userLang }));
                loadRemoteList();
                deleteConfirmDialog.modal('hide');
            } else {
                deleteConfirmDialog.modal('hide');
                popUpHintDialog(i18n.t("page_code.d_hint_delete_failed", { lng: userLang }));
                deleteConfirmDialog.modal('hide');
            }
        },
        error: function () {
            deleteConfirmDialog.modal('hide');
            popUpHintDialog(i18n.t("page_code.d_hint_delete_failed", { lng: userLang }));
            deleteConfirmDialog.modal('hide');
        }
    });
}

function fallbackRemote() {
    if(null === selectedRemote) {
        popUpHintDialog(i18n.t("page_code.d_hint_common_select_index", { lng: userLang }));
        return;
    }
    let remoteToFallback = selectedRemote;
    switch (remoteToFallback.status) {
        case i18n.t("page_code.d_status_published", { lng: userLang }):
            remoteToFallback.status = 1;
            break;
        case i18n.t("page_code.d_status_to_verify", { lng: userLang }):
            remoteToFallback.status = 2;
            break;
        case i18n.t("page_code.d_status_to_passed", { lng: userLang }):
            remoteToFallback.status = 3;
            break;
        case i18n.t("page_code.d_status_to_failed", { lng: userLang }):
            remoteToFallback.status = 4;
            break;
        case i18n.t("page_code.d_status_duplicated", { lng: userLang }):
            remoteToFallback.status = 5;
            break;
        default:
            remoteToFallback.status = 0;
            break;
    }

    remoteToFallback.admin_id = id;
    remoteToFallback.token = token;

    $.ajax({
        url: '/irext/int/fallback_remote_index',
        type: 'POST',
        dataType: 'json',
        data: remoteToFallback,
        timeout: 20000,
        success: function (response) {
            if(response.status.code === 0) {
                $('#fallback_confirm_dialog').modal('hide');
                popUpHintDialog(i18n.t("page_code.d_hint_fallback_success", { lng: userLang }));
                loadRemoteList();
            } else {
                $('#fallback_confirm_dialog').modal('hide');
                popUpHintDialog(i18n.t("page_code.d_hint_fallback_failed", { lng: userLang }));
            }
        },
        error: function () {
            $('#fallback_confirm_dialog').modal('hide');
            popUpHintDialog(i18n.t("page_code.d_hint_fallback_failed", { lng: userLang }));
        }
    });
}

function searchRemote() {
    let remoteMap = $('#remote_map').val();

    if (null != remoteMap && "" !== remoteMap && remoteMap.length > 5) {
        loadRemoteList(true, remoteMap);
        $('#search_dialog').modal('hide');
    } else {
        popUpHintDialog(i18n.t("page_code.d_hint_mapping_error", { lng: userLang }));
    }
}

function verifyRemote() {
    if(null == selectedRemote) {
        popUpHintDialog(i18n.t("page_code.d_hint_common_select_index", { lng: userLang }));
        return;
    }
    let remoteToVerify = selectedRemote;
    switch (remoteToVerify.status) {
        case i18n.t("page_code.d_status_published", { lng: userLang }):
            remoteToVerify.status = 1;
            break;
        case i18n.t("page_code.d_status_to_verify", { lng: userLang }):
            remoteToVerify.status = 2;
            break;
        case i18n.t("page_code.d_status_to_passed", { lng: userLang }):
            remoteToVerify.status = 3;
            break;
        case i18n.t("page_code.d_status_to_failed", { lng: userLang }):
            remoteToVerify.status = 4;
            break;
        case i18n.t("page_code.d_status_duplicated", { lng: userLang }):
            remoteToVerify.status = 5;
            break;
        default:
            remoteToVerify.status = 0;
            break;
    }

    remoteToVerify.admin_id = id;
    remoteToVerify.token = token;
    remoteToVerify.pass = pass;

    $.ajax({
        url: '/irext/int/verify_remote_index',
        type: 'POST',
        dataType: 'json',
        data: remoteToVerify,
        timeout: 20000,
        success: function (response) {
            if(response.status.code === 0) {
                $('#verify_confirm_dialog').modal('hide');
                popUpHintDialog(i18n.t("page_code.d_hint_update_success", { lng: userLang }));
                loadRemoteList();
            } else {
                $('#verify_confirm_dialog').modal('hide');
                popUpHintDialog(i18n.t("page_code.d_hint_update_failed", { lng: userLang }));
            }
        },
        error: function () {
            $('#verify_confirm_dialog').modal('hide');
            popUpHintDialog(i18n.t("page_code.d_hint_update_failed", { lng: userLang }));
        }
    });
}

function publishUnpublished() {
    publishBrands();
}

function publishBrands() {
    let publishHint = $('#publish_hint');
    publishHint.empty();
    publishHint.append(i18n.t("page_code.d_hint_publishing_brand", { lng: userLang }));

    $.ajax({
        url: '/irext/int/publish_brands',
        type: 'POST',
        dataType: 'json',
        data: {
            admin_id : id,
            token : token
        },
        timeout: 200000,
        success: function (response) {
            if(response.status.code === 0) {
                publishHint.empty();
                publishHint.append(i18n.t("page_code.d_hint_publishing_index", { lng: userLang }));
                publishRemoteIndexes();
            } else {
                publishHint.empty();
                publishHint.append(i18n.t("page_code.d_hint_publishing_index", { lng: userLang }));
                publishRemoteIndexes();
            }
        },
        error: function () {
            publishHint.empty();
            publishHint.append(i18n.t("page_code.d_hint_publishing_index", { lng: userLang }));
            publishRemoteIndexes();
        }
    });
}

function publishRemoteIndexes() {
    $.ajax({
        url: '/irext/int/publish_remote_index',
        type: 'POST',
        dataType: 'json',
        data: {
            admin_id : id,
            token : token
        },
        timeout: 200000,
        success: function (response) {
            if(response.status.code === 0) {
                $('#publish_dialog').modal('hide');
                popUpHintDialog(i18n.t("page_code.d_hint_publish_success", { lng: userLang }));
                loadRemoteList();
            } else {
                $('#publish_dialog').modal('hide');
                popUpHintDialog(i18n.t("page_code.d_hint_publish_failed", { lng: userLang }));
            }
        },
        error: function () {
            $('#publish_dialog').modal('hide');
            popUpHintDialog(i18n.t("page_code.d_hint_publish_failed", { lng: userLang }));
        }
    });
}

function createBrand() {
    let newName = $('#brand_name_b').val();
    let newNameEn = $('#brand_name_en_b').val();
    let newNameTw = $('#brand_name_tw_b').val();
    let brandPriority = $('#brand_priority').val();

    if (null === newName || "" === newName ||
        null === newNameEn || "" === newNameEn ||
        null === newNameTw || "" === newNameTw)  {
        popUpHintDialog(i18n.t("page_code.d_hint_create_brand_fill_name", { lng: userLang }));
        return;
    }

    if (isBrandExists(newName)) {
        popUpHintDialog(i18n.t("page_code.d_hint_create_brand_existed", { lng: userLang }));
        return;
    }


    $.ajax({
        url: '/irext/int/create_brand',
        type: 'POST',
        data: {
            category_id : currentCategory.id,
            category_name : currentCategory.name,
            name : newName,
            name_en : newNameEn,
            name_tw : newNameTw,
            priority : brandPriority,
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function (response) {
            if(response.status.code === 0) {
                $('#create_brand_dialog').modal('hide');
                popUpHintDialog(i18n.t("page_code.d_hint_create_brand_success", { lng: userLang }));
                initializeBrands();
            } else {
                $('#create_brand_dialog').modal('hide');
                popUpHintDialog(i18n.t("page_code.d_hint_create_brand_failed", { lng: userLang }));
            }
        },
        error: function () {
            $('#create_brand_dialog').modal('hide');
            popUpHintDialog(i18n.t("page_code.d_hint_create_brand_failed", { lng: userLang }));
        }
    });
}

function createProtocol() {
    let protocolName = $('#protocol_name_b').val();
    let protocolFile = $('#protocol_file').val();
    let protocolType = $('#protocol_type').val();

    if(!protocolName || "" === protocolName) {
        popUpHintDialog(i18n.t("page_code.d_hint_create_protocol_fill_name", { lng: userLang }));
        return;
    }

    if(!protocolFile || "" === protocolFile) {
        popUpHintDialog(i18n.t("page_code.d_hint_create_protocol_upload_file", { lng: userLang }));
        return;
    }

    let form = $('#protocol_upload_form');
    form.attr('action', '/irext/int/create_protocol');
    $('#protocol_admin_id').val(id);

    form.submit();
    $('#create_protocol_dialog').modal('hide');
    $('#creating_protocol_dialog').modal();
    initializeProtocols();
}

///////////////////////////// Data process /////////////////////////////
function initializeSubCates() {
    $('#sub_cate').select2({
        placeholder: 'Select Subcate'
    });
}

function initializeProtocols() {
    $.ajax({
        url: '/irext/int/list_ir_protocols',
        dataType: 'JSON',
        type: 'POST',
        data: {
            from : 0,
            count : 200,
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                let protocols = response.entity;
                fillProtocolList(protocols);

                if(protocols && protocols.length > 0) {
                    currentProtocol = {
                        id: protocols[0].id,
                        name: protocols[0].name
                    }
                }
            } else {
                console.log('failed to get protocols');
            }
        },
        error: function() {
            console.log('failed to get protocols');
        }
    });
}

function initializeCategories() {
    $.ajax({
        url: '/irext/int/list_categories',
        dataType: 'JSON',
        type: 'POST',
        data: {
            from : 0,
            count : 200,
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                let categories = response.entity;
                g_categories = categories;

                fillCategoryList(categories);

                if(categories && categories.length > 0) {
                    currentCategory = {
                        id: categories[0].id,
                        name: categories[0].name,
                        name_en: categories[0].name_en,
                        name_tw: categories[0].name_tw
                    }
                }

                initializeBrands();
            } else {
                console.log('failed to get categories');
            }
        },
        error: function() {
            console.log('failed to get categories');
        }
    });
}

function initializeProvince() {
    $.ajax({
        url: '/irext/int/list_provinces',
        dataType: 'JSON',
        data: {
            admin_id : id,
            token : token
        },
        type: 'POST',
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                let provinces = response.entity;
                fillProvinceList(provinces);

                if(provinces && provinces.length > 0) {
                    currentProvince = {
                        code: provinces[0].code,
                        name: provinces[0].name
                    }
                }

                initializeCity();
            } else {
                console.log('failed to get provinces');
            }
        },
        error: function() {
            console.log('failed to get provinces');
        }
    });
}

function initializeCity() {
    let provincePrefix = currentProvince.code.substring(0, 2);
    $.ajax({
        url: '/irext/int/list_cities',
        type: 'POST',
        dataType: 'JSON',
        data: {
            province_prefix : provincePrefix,
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                let cities = response.entity;
                if (cities && cities.length > 0) {
                    cities.push({
                        code: provincePrefix + '0000',
                        name: i18n.t("page_code.d_hint_init_all_cities", { lng: userLang })
                    });
                } else {
                    cities = [{
                        code: provincePrefix + '0000',
                        name: i18n.t("page_code.d_hint_init_all_cities", { lng: userLang })
                    }];
                }
                g_cities = cities;

                fillCityList(cities);

                if(cities && cities.length > 0) {
                    currentCity = {
                        code: cities[0].code,
                        name: cities[0].name,
                        name_tw: cities[0].name_tw
                    }
                }

                initializeOperator();
            } else {
                console.log('failed to get cities');
            }
        },
        error: function() {
            console.log('failed to get cities');
        }
    });
}

function initializeOperator() {
    $.ajax({
        url: '/irext/int/list_operators',
        type: 'POST',
        dataType: 'JSON',
        data: {
            city_code : currentCity.code,
            from : 0,
            count : 200,
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                let operators = response.entity;

                if (operators && operators.length > 0) {
                    operators.push({
                        operator_id: '0',
                        operator_name: '--'
                    });
                } else {
                    operators = [{
                        operator_id: '0',
                        operator_name: '--'
                    }];
                }
                g_stbOperators = operators;

                fillOperatorList(operators);

                if(operators && operators.length > 0) {
                    currentOperator = {
                        operator_id: operators[0].operator_id,
                        operator_name: operators[0].operator_name,
                        operator_name_tw: operators[0].operator_name_tw
                    }
                }
            } else {
                console.log('failed to get operators');
            }
        },
        error: function() {
            console.log('failed to get operators');
        }
    });
}

function initializeBrands() {
    $.ajax({
        url: '/irext/int/list_brands',
        type: 'POST',
        dataType: 'JSON',
        data: {
            category_id : currentCategory.id,
            from : 0,
            count : 300,
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                let brands = response.entity;
                g_brands = brands;

                fillBrandList(brands);

                if(brands && brands.length > 0) {
                    currentBrand = {
                        id: brands[0].id,
                        name: brands[0].name,
                        name_en: brands[0].name_en,
                        name_tw: brands[0].name_tw
                    }
                }
            } else {
                console.log('failed to get brands');
            }
        },
        error: function() {
            console.log('failed to get brands');
        }
    });
}

function initializeFilterCategories() {
    $.ajax({
        url: '/irext/int/list_categories',
        type: 'POST',
        dataType: 'JSON',
        data: {
            from : 0,
            count : 200,
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                let categories = response.entity;
                fillFilterCategoryList(categories);

                if(categories && categories.length > 0) {
                    currentFilterCategory = {
                        id: categories[0].id,
                        name: categories[0].name
                    }
                }

                initializeFilterBrands();
            } else {
                console.log('failed to get categories');
            }
        },
        error: function() {
            console.log('failed to get categories');
        }
    });
}

function initializeFilterProvince() {
    $.ajax({
        url: '/irext/int/list_provinces',
        type: 'POST',
        dataType: 'JSON',
        data: {
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                let provinces = response.entity;
                fillFilterProvinceList(provinces);

                if(provinces && provinces.length > 0) {
                    currentFilterProvince = {
                        code: provinces[0].code,
                        name: provinces[0].name
                    }
                }

                initializeFilterCity();
            } else {
                console.log('failed to get provinces');
            }
        },
        error: function() {
            console.log('failed to get provinces');
        }
    });
}

function initializeFilterCity() {
    let provincePrefix = currentFilterProvince.code.substring(0, 2);
    $.ajax({
        url: '/irext/int/list_cities',
        type: 'POST',
        dataType: 'JSON',
        data: {
            province_prefix : provincePrefix,
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                let cities = response.entity;
                fillFilterCityList(cities);

                if(cities && cities.length > 0) {
                    currentFilterCity = {
                        code: cities[0].code,
                        name: cities[0].name
                    }
                }
                if(currentFilterCategory.id === 3) {
                    loadRemoteList();
                }
            } else {
                console.log('failed to get cities');
            }
        },
        error: function() {
            console.log('failed to get cities');
        }
    });
}

function initializeFilterBrands() {
    $.ajax({
        url: '/irext/int/list_brands',
        type: 'POST',
        dataType: 'JSON',
        data: {
            category_id : currentFilterCategory.id,
            from : 0,
            count : 300,
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                let brands = response.entity;
                fillFilterBrandList(brands);

                if(brands && brands.length > 0) {
                    currentFilterBrand = {
                        id: brands[0].id,
                        name: brands[0].name
                    }
                }
                if(currentFilterCategory.id !== 3) {
                    loadRemoteList();
                }
            } else {
                console.log('failed to get brands');
            }
        },
        error: function() {
            console.log('failed to get brands');
        }
    });
}

///////////////////////////// Event handler /////////////////////////////

function onCreateRemote() {
    $('#create_remote_dialog').modal();
}

function onProtocolChange() {
    currentProtocol = {
        id: $('#protocol_id').val(),
        name: $('#protocol_id option:selected').text()
    };
}

function onSubCateChange() {
    currentSubCate = $('#sub_cate').val();
}

function onProtocolTypeChange() {
    currentProtocolType = $('#protocol_type').val();
}

function onCategoryChange() {
    let currentCategoryID = $('#category_id').val();
    currentCategory = getCategoryByID(currentCategoryID);

    switchCategory();
}

function switchCategory() {
    switch(parseInt(currentCategory.id)) {
        case CATEGORY_AC:
            showBrandSelector();
            showProtocolSelector(false);
            break;
        case CATEGORY_TV:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_STB:
            showCitySelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_NW:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_IPTV:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_DVD:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_FAN:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_PROJECTOR:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_STEREO:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_LIGHT_BULB:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_BSTB:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_CLEANING_ROBOT:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_AIR_CLEANER:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        case CATEGORY_DYSON:
            showBrandSelector();
            showProtocolSelector(true);
            break;
        default:
            console.log('Wrong category : ' + currentCategory.id);
            break;
    }
}

function onBrandChange() {
    let currentBrandID = $('#brand_id').val();

    currentBrand = getBrandByID(currentBrandID);
}

function onProvinceChange() {
    currentProvince = {
        code: $('#province_id').val(),
        name: $('#province_id option:selected').text()
    };

    initializeCity();
}

function onCityChange() {
    let currentCityCode = $('#city_code').val();

    currentCity = getCityByCode(currentCityCode);

    if (currentCity.code !== '000000') {
        initializeOperator();
    } else {
        // if 'city not specified' is specified, empty operator list
        let operators = [{
            operator_id: '0',
            operator_name: '--'
        }];

        fillOperatorList(operators);

        if(operators && operators.length > 0) {
            currentOperator = {
                operator_id: operators[0].operator_id,
                operator_name: operators[0].operator_name,
                operator_name_tw: operators[0].operator_name_tw
            }
        }
    }
}

function onOperatorChange() {
    let currentOperatorID = $('#operator_id').val();

    currentOperator = getStbOperatorByID(currentOperatorID);
}

function discoverCityCode() {
    popUpHintDialog(currentCity.code);
}

function onFilterCategoryChange() {
    currentFilterCategory = {
        id: $('#filter_category_id').val(),
        name: $('#filter_category_id option:selected').text()
    };

    switch(parseInt(currentFilterCategory.id)) {
        case CATEGORY_AC:
            showFilterBrandSelector();
            break;
        case CATEGORY_TV:
            showFilterBrandSelector();
            break;
        case CATEGORY_STB:
            showFilterCitySelector();
            break;
        case CATEGORY_NW:
            showFilterBrandSelector();
            break;
        case CATEGORY_IPTV:
            showFilterBrandSelector();
            break;
        case CATEGORY_DVD:
            showFilterBrandSelector();
            break;
        case CATEGORY_FAN:
            showFilterBrandSelector();
            break;
        case CATEGORY_PROJECTOR:
            showFilterBrandSelector();
            break;
        case CATEGORY_STEREO:
            showFilterBrandSelector();
            break;
        case CATEGORY_LIGHT_BULB:
            showFilterBrandSelector();
            break;
        case CATEGORY_BSTB:
            showFilterBrandSelector();
            break;
        case CATEGORY_CLEANING_ROBOT:
            showFilterBrandSelector();
            break;
        case CATEGORY_AIR_CLEANER:
            showFilterBrandSelector();
            break;
        case CATEGORY_DYSON:
            showFilterBrandSelector();
            break;
        default:
            break;
    }
}

function onFilterBrandChange() {
    currentFilterBrand = {
        id: $('#filter_brand_id').val(),
        name: $('#filter_brand_id option:selected').text()
    };
    loadRemoteList();
}

function onFilterProvinceChange() {
    currentFilterProvince = {
        code: $('#filter_province_id').val(),
        name: $('#filter_province_id option:selected').text()
    };

    initializeFilterCity();
}

function onFilterCityChange() {
    currentFilterCity = {
        code: $('#filter_city_code').val(),
        name: $('#filter_city_code option:selected').text()
    };
    loadRemoteList();
}

function onCreateBrand() {
    $('#category_name_b').val(currentCategory.name);
    $('#create_brand_dialog').modal({backdrop: 'static', keyboard: false});
}

function onCreateProtocol() {
    $('#create_protocol_dialog').modal({backdrop: 'static', keyboard: false});
}

function onBleTestInfo() {
    $('#create_ble_test_dialog').modal({backdrop: 'static', keyboard: false});
}

function onSelectRemote(data) {
    selectedRemote = data;
}

function onFallbackRemote() {
    let hintText = '';
    if (null == selectedRemote) {
        popUpHintDialog(i18n.t("page_code.d_hint_common_select_index", { lng: userLang }));
        return;
    }

    if (currentFilterCategory.id === 3) {
        hintText = i18n.t("page_code.d_hint_fallback_confirm", { lng: userLang }) +
            selectedRemote.city_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' + selectedRemote.remote +
            i18n.t("page_code.d_hint_confirm_q", { lng: userLang });
    } else {
        hintText = i18n.t("page_code.d_hint_fallback_confirm", { lng: userLang }) +
            selectedRemote.brand_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' + selectedRemote.remote +
            i18n.t("page_code.d_hint_confirm_q", { lng: userLang });
    }

    let fallbackInt = $('#fallback_hint');
    fallbackInt.empty();
    fallbackInt.append(hintText);
    $('#fallback_confirm_dialog').modal();
}

function onDeleteRemote() {
    let hintText = '';
    if (null == selectedRemote) {
        popUpHintDialog(i18n.t("page_code.d_hint_common_select_index", { lng: userLang }));
        return;
    }
    if (currentFilterCategory.id === 3) {
        hintText = i18n.t("page_code.d_hint_delete_confirm", { lng: userLang }) +
            selectedRemote.city_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' + selectedRemote.remote +
            i18n.t("page_code.d_hint_confirm_q", { lng: userLang });
    } else {
        hintText = i18n.t("page_code.d_hint_delete_confirm", { lng: userLang }) +
            selectedRemote.brand_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' + selectedRemote.remote +
            i18n.t("page_code.d_hint_confirm_q", { lng: userLang });
    }

    let deleteHint = $('#delete_hint');
    deleteHint.empty();
    deleteHint.append(hintText);
    $('#delete_confirm_dialog').modal();
}

function onSearchRemote() {
    $('#search_dialog').modal({backdrop: 'static', keyboard: false});
}

function onVerifyRemote(isPass) {
    pass = isPass;
    let hintText = '';
    let passText = 0 === pass ?
        i18n.t("page_code.d_pass", { lng: userLang }):i18n.t("page_code.d_not_pass", { lng: userLang });
    if (null == selectedRemote) {
        popUpHintDialog(i18n.t("page_code.d_hint_common_select_index", { lng: userLang }));
        return;
    }
    if (currentFilterCategory.id === 3) {
        hintText = i18n.t("page_code.d_hint_confirm_to", { lng: userLang }) +
            passText + selectedRemote.city_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' +
            selectedRemote.remote + i18n.t("page_code.d_hint_confirm_q", { lng: userLang }) ;
    } else {
        hintText = i18n.t("page_code.d_hint_confirm_to", { lng: userLang }) +
            passText + selectedRemote.brand_name + ' ' + selectedRemote.category_name + ' ' +
            selectedRemote.protocol + ' ' +
            selectedRemote.remote + i18n.t("page_code.d_hint_confirm_q", { lng: userLang }) ;
    }

    let verifyHint = $('#verify_hint');
    verifyHint.empty();
    verifyHint.append(hintText);
    $('#verify_confirm_dialog').modal();
}

function onPublishRemote() {
    getUnpublishedBrands();
}

function getUnpublishedBrands() {
    $.ajax({
        url: '/irext/int/list_unpublished_brands',
        type: 'POST',
        dataType: 'JSON',
        data: {
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                brandsToPublish = response.entity;
                getUnpublishedRemoteIndexes();
            } else {
                console.log('failed to get unpublished brands');
            }
        },
        error: function() {
            console.log('failed to get unpublished brands');
        }
    });
}

function getUnpublishedRemoteIndexes() {
    $.ajax({
        url: '/irext/int/list_unpublished_remote_indexes',
        type: 'POST',
        dataType: 'JSON',
        data: {
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function(response) {
            if(response.status.code === 0) {
                remoteIndexesToPublish = response.entity;
                showPublishDialog();
            } else {
                console.log('failed to get unpublished remote indexes');
            }
        },
        error: function() {
            console.log('failed to get unpublished remote indexes');
        }
    });
}

function showPublishDialog() {
    let hintText = i18n.t("page_code.d_hint_publish_totally", { lng: userLang }) +
        '<span color="#FF0000">' + brandsToPublish.length +
        '</span> ' + i18n.t("page_code.d_hint_publish_brands_and", { lng: userLang }) +
        ' <span color="#FF0000">' + remoteIndexesToPublish.length +
        '</span> ' + i18n.t("page_code.d_hint_publish_indexes_to_publish_confirm", { lng: userLang });
    let publishHint = $('#publish_hint')
    publishHint.empty();
    publishHint.append(hintText);
    $('#publish_dialog').modal();
}

///////////////////////////// UI functions /////////////////////////////
function fillProtocolList(protocols) {
    let protocolId = $('#protocol_id')
    protocolId.find('option')
        .remove()
        .end();

    $.each(protocols, function (i, protocol) {
        $('#protocol_id').append($('<option>', {
            value: protocol.id,
            text : protocol.name
        }));
    });

    protocolId.select2({
        placeholder: 'Select Protocol'
    });
}

function fillCategoryList(categories) {
    $.each(categories, function (i, category) {
        $('#category_id').append($('<option>', {
            value: category.id,
            text : category.name
        }));
    });

    $('#category_id').select2({
        placeholder: i18n.t("page_code.d_hint_category_placeholder", { lng: userLang })
    });
}

function fillProvinceList(provinces) {
    $.each(provinces, function (i, province) {
        $('#province_id').append($('<option>', {
            value: province.code,
            text : province.name
        }));
    });

    $('#province_id').select2({
        placeholder: i18n.t("page_code.d_hint_province_placeholder", { lng: userLang })
    });
}

function fillCityList(cities) {
    let cityCode = $('#city_code');
    cityCode.find('option')
        .remove()
        .end();

    $.each(cities, function (i, city) {
        $('#city_code').append($('<option>', {
            value: city.code,
            text : city.name
        }));
    });

    cityCode.select2({
        placeholder: i18n.t("page_code.d_hint_city_placeholder", { lng: userLang })
    });
}

function fillOperatorList(operators) {
    let operatorId = $('#operator_id');
    operatorId.find('option')
        .remove()
        .end();

    $.each(operators, function (i, operator) {
        $('#operator_id').append($('<option>', {
            value: operator.operator_id,
            text : operator.operator_name
        }));
    });

    operatorId.select2({
        placeholder: i18n.t("page_code.d_hint_sp_placeholder", { lng: userLang })
    });
}

function fillBrandList(brands) {
    let brandId = $('#brand_id');
    brandId.find('option')
        .remove()
        .end();

    $.each(brands, function (i, brand) {
        $('#brand_id').append($('<option>', {
            value: brand.id,
            text : brand.name
        }));
    });

    brandId.select2({
        placeholder: i18n.t("page_code.d_hint_brand_placeholder", { lng: userLang })
    });
}

function fillFilterCategoryList(categories) {
    let filterCategoryId = $('#filter_category_id');
    filterCategoryId.find('option')
        .remove()
        .end();

    $.each(categories, function (i, category) {
        $('#filter_category_id').append($('<option>', {
            value: category.id,
            text : category.name
        }));
    });

    filterCategoryId.select2({
        placeholder: i18n.t("page_code.d_hint_category_placeholder", { lng: userLang })
    });
}

function fillFilterProvinceList(provinces) {
    let filterProvinceId = $('#filter_province_id');
    filterProvinceId.find('option')
        .remove()
        .end();

    $.each(provinces, function (i, province) {
        $('#filter_province_id').append($('<option>', {
            value: province.code,
            text : province.name
        }));
    });

    filterProvinceId.select2({
        placeholder: i18n.t("page_code.d_hint_province_placeholder", { lng: userLang })
    });
}

function fillFilterCityList(cities) {
    let filterCityCode = $('#filter_city_code')
    filterCityCode.find('option')
        .remove()
        .end();

    $.each(cities, function (i, city) {
        $('#filter_city_code').append($('<option>', {
            value: city.code,
            text : city.name
        }));
    });

    filterCityCode.select2({
        placeholder: i18n.t("page_code.d_hint_city_placeholder", { lng: userLang })
    });
}

function fillFilterBrandList(brands) {
    let filterBrandId = $('#filter_brand_id');
    filterBrandId.find('option')
        .remove()
        .end();

    $.each(brands, function (i, brand) {
        $('#filter_brand_id').append($('<option>', {
            value: brand.id,
            text : brand.name
        }));
    });

    filterBrandId.select2({
        placeholder: i18n.t("page_code.d_hint_brand_placeholder", { lng: userLang })
    });
}

function showCitySelector() {
    $('#brand_panel').hide();
    $('#province_panel').show();
    $('#city_panel').show();
    $('#operator_panel').show();
    initializeProvince();
}

function showBrandSelector() {
    $('#brand_panel').show();
    $('#province_panel').hide();
    $('#city_panel').hide();
    $('#operator_panel').hide();
    initializeBrands();
}

function showFilterCitySelector() {
    $('#filter_brand_panel').hide();
    $('#filter_province_panel').show();
    $('#filter_city_panel').show();
    initializeFilterProvince();
}

function showFilterBrandSelector() {
    $('#filter_brand_panel').show();
    $('#filter_province_panel').hide();
    $('#filter_city_panel').hide();
    initializeFilterBrands();
}

function showProtocolSelector(show) {
    if (true === show) {
        $('.protocol_panel').show();
    } else {
        $('.protocol_panel').hide();
    }
}

function popUpHintDialog(hint) {
    let TextHint = $('#text_hint');
    TextHint.empty();
    TextHint.append(hint);
    $('#hint_dialog').modal();
}

///////////////////////////// Utilities /////////////////////////////

function isBrandExists(newBrandName) {
    let i = 0;
    for(i = 0; i < g_brands.length; i++) {
        if(g_brands[i].name === newBrandName) {
            return true;
        }
    }
    return false;
}

function getCategoryByID(categoryID) {
    let i = 0;
    for(i = 0; i < g_categories.length; i++) {
        let category = g_categories[i];
        if (category.id === categoryID) {
            return category;
        }
    }
    return null;
}

function getBrandByID(brandID) {
    let i = 0;
    for(i = 0; i < g_brands.length; i++) {
        let brand = g_brands[i];
        if (brand.id === brandID) {
            return brand;
        }
    }
    return null;
}

function getCityByCode(cityCode) {
    let i = 0;
    for(i = 0; i < g_cities.length; i++) {
        let city = g_cities[i];
        if (city.code === cityCode) {
            return city;
        }
    }
    return null;
}

function getStbOperatorByID(operatorID) {
    let i = 0;
    for(i = 0; i < g_stbOperators.length; i++) {
        let operator = g_stbOperators[i];
        if (operator.operator_id === operatorID) {
            return operator;
        }
    }
    return null;
}

function translateToTC(textID, targetTextID) {
    let val = $('#' + textID).val();
    let tcVal = "";
    Chinese.prototype.loaded.onkeep(function() {
        let chinese = new Chinese();
        tcVal = chinese.toTraditional(val);
        if (null == tcVal) {
            tcVal = val;
        }
        $('#' + targetTextID).val(tcVal);
    });
}

function gotoIndex() {
    window.location = '../';
}