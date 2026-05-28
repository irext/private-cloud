/**
 * Created by strawmanbobi
 * 2021-03-03
 */

function waverizeKeyValue(keyValue) {
    if (undefined === keyValue || null === keyValue || 0 === parseInt(keyValue)) {
        return;
    }
    let strValues = keyValue.split(',');
    let intValues = new Array(strValues.length);
    let totalEnd = 0;
    for (let i = 0; i < strValues.length - 1; i++) {
        intValues[i] = parseInt(strValues[i]);
        totalEnd += intValues[i];
    }
    let data = getWaveData(intValues, totalEnd);
    if (null === data) {
        data = [];
    }
    Highcharts.chart('wave_container', {
        backgroundColor: '#FCFFC5',
        title: {
            text: '',
        },
        subtitle: {
            text: '',
        },
        credits: {
            enabled: false
        },
        chart: {
            height: 100,
            zoomType: 'x',
            animation: false
        },
        tooltip: {
            enabled: true,
            valueDecimals: 0,
            formatter: function() {
                return 'Time: ' + this.x + ' μs<br/>Level: ' + this.y;
            }
        },
        xAxis: {
            type: 'number',
            zoomEnabled: true,
            labels: {
                enabled: true
            },
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            max: 1,
            zoomEnabled: false,
            labels: {
                enabled: false
            },
            title: {
                text: null
            }
        },
        plotOptions: {
            series: {
                animation: false,
                enableMouseTracking: true,
                states: {
                    hover: {
                        lineWidthPlus: 0
                    }
                }
            }
        },
        series: [{
            data: data,
            lineWidth: 1,
            name: 'Wave',
            color: '#FF0000',
            showInLegend: false,
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true,
                        radius: 3
                    }
                }
            }
        }]
    });
}

function getWaveData(timeSeries, totalEnd) {
    if (undefined === timeSeries || null === timeSeries) {
        return;
    }
    let waveBit = 1;
    let logicIndex = 0;
    let arr = [];
    // timeSeries = [9000, 4500, 500, 1500, ...];
    for (let timePoint = 0; timePoint < totalEnd; timePoint++) {
        logicIndex = getScopedIndex(timeSeries, timePoint);
        if (0 === timePoint) {
            waveBit = 0;
        } else if (logicIndex % 2 === 0) {
            waveBit = 1;
        } else {
            waveBit = 0;
        }
        arr.push([
            timePoint,
            waveBit
        ]);
    }
    return arr;
}

function resetWave() {
    Highcharts.chart('wave_container', {
        backgroundColor: '#FCFFC5',
        title: {
            text: '',
        },
        subtitle: {
            text: '',
        },
        credits: {
            enabled: false
        },
        chart: {
            height: 100,
            zoomType: 'x',
            animation: false
        },
        tooltip: {
            enabled: true,
            valueDecimals: 0,
            formatter: function() {
                return 'Time: ' + this.x + ' μs<br/>Level: ' + this.y;
            }
        },
        xAxis: {
            type: 'number',
            zoomEnabled: true,
            labels: {
                enabled: true
            },
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            max: 1,
            zoomEnabled: false,
            labels: {
                enabled: false
            },
            title: {
                text: null
            }
        },
        plotOptions: {
            series: {
                animation: false,
                enableMouseTracking: true,
                states: {
                    hover: {
                        lineWidthPlus: 0
                    }
                }
            }
        },
        series: [{
            data: [],
            lineWidth: 1,
            name: 'Wave',
            color: '#FF0000',
            showInLegend: false,
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true,
                        radius: 3
                    }
                }
            }
        }]
    });
}

function getScopedIndex(timeSeries, point) {
    if (point < timeSeries[0]) {
        return 0;
    }
    let intervalBegin = 0;
    let intervalEnd = 0;
    let i = 1;
    // [9000, 4500, 500, 1500, 500, 500, 500, 1500...] // length = 8
    for (i = 1; i < timeSeries.length; i++) {
        // eg. when i = 1, begin = 0 + timeSeries[0] = 9000
        // end = 9000 + 4500 = 13500
        // when i = 2, begin = begin` + timeSeries[1] = 9000 + 4500 = 13500
        // end = 13500 + 500 = 14000
        intervalBegin += parseInt(timeSeries[i - 1]);
        intervalEnd = intervalBegin + parseInt(timeSeries[i]);
        if (point > intervalBegin && point <= intervalEnd) {
            return i;
        }
    }
    return timeSeries.length;
}
