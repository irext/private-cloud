/**
 * Created by strawmanbobi
 * 2017-03-27
 */

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
    $("[data-i18n]").css("visibility", "visible");
});

let CODE_TABLE_PADDING = 320;

let id = "";
let token = "";
let client = null;

let currentFilterCategory = {
    id: 1,
    name: i18n.t("page_code.d_panel_category_init", { lng: userLang })
};

let currentFilterBrand = null;
let currentFilterProvince = {
    code: '110000',
    name: i18n.t("page_code.d_panel_city_init", { lng: userLang })
};
let currentFilterCity = {
    code: '110100',
    name: i18n.t("page_code.d_panel_city_init", { lng: userLang })
};

let selectedRemote = null;

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

    initializeFilterCategories();
    initializeFilterBrands();
    initializeFilterProvince();
});

function loadRemoteList(isSearch, remoteMap) {
    let url = null;

    if (isSearch && remoteMap) {
        url = '/irext/code/search_remote_indexes?remote_map='+
            remoteMap+'&from=0&count=2000&admin_id='+id+'&token='+token;
    } else {
        if(parseInt(currentFilterCategory.id) === 3) {
            url = '/irext/code/list_remote_indexes?category_id='+
                currentFilterCategory.id+'&city_code='+currentFilterCity.code+
                '&from=0&count=100&admin_id='+id+'&token='+token;
        } else {
            url = '/irext/code/list_remote_indexes?category_id='+
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
                    data[i].intStatus = ITEM_VALID;
                } else if (data[i].status === 2) {
                    data[i].status = i18n.t("page_code.d_status_to_verify", { lng: userLang });
                    data[i].intStatus = ITEM_VERIFY;
                } else if (data[i].status === 3) {
                    data[i].status = i18n.t("page_code.d_status_passed", { lng: userLang });
                    data[i].intStatus = ITEM_PASS;
                } else if (data[i].status === 4) {
                    data[i].status = i18n.t("page_code.d_status_failed", { lng: userLang });
                    data[i].intStatus = ITEM_FAILED;
                } else if (data[i].status === 5) {
                    data[i].status = i18n.t("page_code.d_status_duplicated", { lng: userLang });
                    data[i].intStatus = ITEM_DUPLICATED;
                }
            } else {
                data[i].status = i18n.t("page_code.d_status_collected", { lng: userLang });
                data[i].intStatus = ITEM_VALID;
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

function searchRemote() {
    let remoteMap = $('#remote_map').val();

    if (null != remoteMap && "" !== remoteMap && remoteMap.length > 5) {
        loadRemoteList(true, remoteMap);
        $('#search_dialog').modal('hide');
    } else {
        popUpHintDialog(i18n.t("page_code.d_hint_mapping_error", { lng: userLang }));
    }
}

///////////////////////////// Data process /////////////////////////////

function initializeFilterCategories() {
    $.ajax({
        url: '/irext/code/list_categories',
        type: 'POST',
        dataType: 'JSON',
        data: {
            from : 0,
            count : 200,
            admin_id : id,
            token : token,
            lang: userLang
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

///////////////////////////// Event handler /////////////////////////////

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
        case CATEGORY_CAMERA:
            showFilterBrandSelector();
            break;
        case CATEGORY_HEATER:
            showFilterBrandSelector();
            break;
        default:
            break;
    }
}

function initializeFilterProvince() {
    $.ajax({
        url: '/irext/code/list_provinces',
        type: 'POST',
        dataType: 'JSON',
        data: {
            admin_id : id,
            token : token,
            lang : userLang
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
        url: '/irext/code/list_cities',
        type: 'POST',
        dataType: 'JSON',
        data: {
            province_prefix : provincePrefix,
            admin_id : id,
            token : token,
            lang : userLang
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
                if(parseInt(currentFilterCategory.id) === 3) {
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
        url: '/irext/code/list_brands',
        type: 'POST',
        dataType: 'JSON',
        data: {
            category_id : currentFilterCategory.id,
            from : 0,
            count : 300,
            admin_id : id,
            token : token,
            lang: userLang
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

function onSelectRemote(data) {
    selectedRemote = data;
}

function onSearchRemote() {
    $('#search_dialog').modal({backdrop: 'static', keyboard: false});
}

///////////////////////////// UI functions /////////////////////////////
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

function popUpHintDialog(hint) {
    let TextHint = $('#text_hint');
    TextHint.empty();
    TextHint.append(hint);
    $('#hint_dialog').modal();
}

/////////////////////////////   Admin   /////////////////////////////
function updateData() {
    let $btn = $('#btn_auto_update');
    if ($btn.prop('disabled')) {
        return;
    }
    let originalText = $btn.text();
    $btn.text(i18n.t('page_code.d_updating', {lng: userLang})).prop('disabled', true);
    $('#btn_update_dropdown').prop('disabled', true);

    // show status area and clear previous status
    let $statusArea = $('#update_status_area');
    let $statusText = $('#update_status_text');
    $statusArea.css('display', 'inline-block');

    // connect to SSE for real-time status
    let eventSource = new EventSource('/irext/code/update_status');
    let sseCompleted = false;

    eventSource.onmessage = function(event) {
        try {
            let data = JSON.parse(event.data);
            let stepKey = 'd_step_' + data.step;
            let stepName = i18n.t('page_code.' + stepKey, {lng: userLang});
            if (stepName === stepKey) {
                stepName = data.message;
            }

            let icon, color;
            if (data.status === 'success') {
                icon = '<i class="fa fa-check" style="color: #5cb85c; margin-right: 5px;"></i>';
                color = '#5cb85c';
            } else if (data.status === 'error') {
                icon = '<i class="fa fa-times" style="color: #d9534f; margin-right: 5px;"></i>';
                color = '#d9534f';
            } else {
                icon = '<i class="fa fa-spinner fa-spin" style="color: #337ab7; margin-right: 5px;"></i>';
                color = '#333';
            }

            // only show latest status
            $statusText.html(icon + '<span style="color: ' + color + ';">' + stepName + '</span>');

            // handle completion
            if (data.step === 'completed' || data.step === 'failed') {
                sseCompleted = true;
                eventSource.close();
                $btn.text(originalText).prop('disabled', false);
                $('#btn_update_dropdown').prop('disabled', false);
                if (data.step === 'completed') {
                    // add dismiss button for success status
                    let successHtml = icon + '<span style="color: ' + color + ';">' + stepName + '</span>';
                    successHtml += ' <a href="#" onclick="dismissUpdateStatus(); return false;" style="color: #999; margin-left: 5px; text-decoration: none; font-size: 16px;" title="关闭">&times;</a>';
                    $statusText.html(successHtml);
                    toastr.success(i18n.t('page_code.d_update_success', {lng: userLang}));
                } else {
                    toastr.error(i18n.t('page_code.d_update_failed', {lng: userLang}));
                }
            }
        } catch (e) {
            // ignore parse errors
        }
    };

    eventSource.onerror = function() {
        if (!sseCompleted) {
            eventSource.close();
            $btn.text(originalText).prop('disabled', false);
            $('#btn_update_dropdown').prop('disabled', false);
            toastr.error(i18n.t('page_code.d_update_failed', {lng: userLang}));
        }
    };

    // trigger the update after SSE is connected
    setTimeout(function() {
        $.ajax({
            url: '/irext/code/update_private_data',
            type: 'POST',
            dataType: 'json',
            data: {
                admin_id: id,
                token: token
            },
            timeout: 300000
        });
    }, 500);
}

function updateDataOffline() {

}

function dismissUpdateStatus() {
    $('#update_status_area').hide();
    $('#update_status_text').empty();
}

function toggleOfflineUploadArea() {
    let $uploadArea = $('#offline_upload_area');
    if ($uploadArea.is(':visible')) {
        cancelOfflineUpload();
    } else {
        $uploadArea.show();
        // initialize bs-custom-file-input for file input
        let fileInput = document.getElementById('data_file');
        if (fileInput && !fileInput.bsCustomFileInput) {
            bsCustomFileInput.init('#data_file');
        }
    }
}

function cancelOfflineUpload() {
    let $uploadArea = $('#offline_upload_area');
    let $fileInput = $('#data_file');
    let $status = $('#upload_status');
    let $btnUpload = $('#btn_upload_data');

    $fileInput.val('');
    $('label[for="data_file"]').text(i18n.t('page_code.d_select_data_file', {lng: userLang}));
    $status.hide().text('');
    $btnUpload.prop('disabled', false);
    $uploadArea.hide();
}

function uploadOfflineData() {
    let fileInput = document.getElementById('data_file');
    let file = fileInput.files[0];

    if (!file) {
        toastr.error(i18n.t('page_code.d_select_file_first', {lng: userLang}));
        return;
    }

    if (!file.name.endsWith('.tar.gz.enc') && !file.name.endsWith('.enc')) {
        toastr.error(i18n.t('page_code.d_invalid_file_format', {lng: userLang}));
        return;
    }

    if (file.size > 200 * 1024 * 1024) {
        toastr.error(i18n.t('page_code.d_file_too_large', {lng: userLang}));
        return;
    }

    let $status = $('#upload_status');
    let $btnUpload = $('#btn_upload_data');
    let $btnAutoUpdate = $('#btn_auto_update');
    let $btnDropdown = $('#btn_update_dropdown');

    // disable buttons during upload
    $btnUpload.prop('disabled', true);
    $btnAutoUpdate.prop('disabled', true);
    $btnDropdown.prop('disabled', true);

    // hide the offline upload area, only show progress
    $('#offline_upload_area').hide();

    // show status area and connect to SSE
    let $statusArea = $('#update_status_area');
    let $statusText = $('#update_status_text');
    $statusArea.css('display', 'inline-block');
    $statusText.empty();

    let eventSource = new EventSource('/irext/code/update_status');
    let sseCompleted = false;

    eventSource.onmessage = function(event) {
        try {
            let data = JSON.parse(event.data);
            let stepKey = 'd_step_' + data.step;
            let stepName = i18n.t('page_code.' + stepKey, {lng: userLang});
            if (stepName === stepKey) {
                stepName = data.message;
            }

            let icon, color;
            if (data.status === 'success') {
                icon = '<i class="fa fa-check" style="color: #5cb85c; margin-right: 5px;"></i>';
                color = '#5cb85c';
            } else if (data.status === 'error') {
                icon = '<i class="fa fa-times" style="color: #d9534f; margin-right: 5px;"></i>';
                color = '#d9534f';
            } else {
                icon = '<i class="fa fa-spinner fa-spin" style="color: #337ab7; margin-right: 5px;"></i>';
                color = '#333';
            }

            $statusText.html(icon + '<span style="color: ' + color + ';">' + stepName + '</span>');

            if (data.step === 'completed' || data.step === 'failed') {
                sseCompleted = true;
                eventSource.close();
                $btnAutoUpdate.text(i18n.t('page_code.d_update_data', {lng: userLang})).prop('disabled', false);
                $btnDropdown.prop('disabled', false);
                $btnUpload.prop('disabled', false);
                if (data.step === 'completed') {
                    let successHtml = icon + '<span style="color: ' + color + ';">' + stepName + '</span>';
                    successHtml += ' <a href="#" onclick="dismissUpdateStatus(); return false;" style="color: #999; margin-left: 5px; text-decoration: none; font-size: 16px;" title="关闭">&times;</a>';
                    $statusText.html(successHtml);
                    toastr.success(i18n.t('page_code.d_update_success', {lng: userLang}));
                    cancelOfflineUpload();
                } else {
                    toastr.error(i18n.t('page_code.d_update_failed', {lng: userLang}));
                    // clear file input and reset label, show upload area again on failure
                    $('#data_file').val('');
                    $('label[for="data_file"]').text(i18n.t('page_code.d_select_data_file', {lng: userLang}));
                    $('#offline_upload_area').show();
                }
            }
        } catch (e) {
            // ignore parse errors
        }
    };

    eventSource.onerror = function() {
        if (!sseCompleted) {
            eventSource.close();
            $btnAutoUpdate.text(i18n.t('page_code.d_update_data', {lng: userLang})).prop('disabled', false);
            $btnDropdown.prop('disabled', false);
            $btnUpload.prop('disabled', false);
            $('#offline_upload_area').show();
            toastr.error(i18n.t('page_code.d_update_failed', {lng: userLang}));
        }
    };

    // upload file after SSE is connected
    setTimeout(function() {
        let formData = new FormData();
        formData.append('data_file', file);
        formData.append('admin_id', id);
        formData.append('token', token);

        $.ajax({
            url: '/irext/code/upload_offline_data',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            timeout: 300000,
            success: function(response) {
                if (response.status.code !== 0) {
                    // AJAX returned but SSE not yet complete
                    // SSE will handle the final status
                }
            },
            error: function(xhr, status, error) {
                if (!sseCompleted) {
                    eventSource.close();
                    $btnAutoUpdate.text(i18n.t('page_code.d_update_data', {lng: userLang})).prop('disabled', false);
                    $btnDropdown.prop('disabled', false);
                    $btnUpload.prop('disabled', false);
                    $('#offline_upload_area').show();
                    toastr.error(error || i18n.t('page_code.d_update_failed', {lng: userLang}));
                }
            }
        });
    }, 500);
}

///////////////////////////// Utilities /////////////////////////////
function gotoIndex() {
    window.location = '../';
}