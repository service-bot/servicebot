'use strict';

function isError(element, message) {
    var el = $(element);
    el.parent().removeClass('has-success').addClass('has-danger')
    el.removeClass('form-control-success').addClass('form-control-danger')
    el.next().text(message).removeClass('text-success').addClass('text-danger');
    el.attr('data-valid', false);
}

function isSuccess(element, message) {
    var el = $(element);
    el.parent().removeClass('has-danger').addClass('has-success')
    el.removeClass('form-control-danger').addClass('form-control-success')
    el.next().text(message).removeClass('text-danger').addClass('text-success');
    el.attr('data-valid', true);
}

function resetMessages(element) {
    var el = $(element);
    el.parent().removeClass('has-danger').removeClass('has-success')
    el.removeClass('form-control-danger').removeClass('form-control-success')
    el.next().text('');
}

function validateOnChange(element, rules, successMessage, errorMessage) {
    $(document).on('focus', element, function(e) {
        e.preventDefault();
        //resetMessages(element);
        return false;
    });
    $(document).on('blur', element, function(e) {
        e.preventDefault();
        var result = approve.value($(element).val(), rules);
        if (result.approved) {
            isSuccess(element, successMessage);
        } else {
            isError(element, errorMessage);
        }
        return false;
    })
}

function animatedPeityBar(element, height, color) {
    var chart = $(element).peity('bar', {
        height: height,
        width: '100%',
        fill: [color]
    });
    setInterval(function() {
        var random = Math.floor(Math.random() * 10) + 2;
        var values = chart.text().split(',');
        values.shift();
        values.push(random);
        chart.text(values.join(',')).change();
    }, 1000);
}

function animatedPeityArea(element, height, color) {
    var chart = $(element).peity('line', {
        height: height,
        width: '100%',
        fill: color,
        stroke: color
    });
    setInterval(function() {
        var random = Math.floor(Math.random() * 10) + 2;
        var values = chart.text().split(',');
        values.shift();
        values.push(random);
        chart.text(values.join(',')).change();
    }, 1000);
}

function animatedPeityLine(element, height, color) {
    var chart = $(element).peity('line', {
        height: height,
        width: '100%',
        fill: 'white',
        stroke: color
    });
    setInterval(function() {
        var random = Math.floor(Math.random() * 10) + 2;
        var values = chart.text().split(',');
        values.shift();
        values.push(random);
        chart.text(values.join(',')).change();
    }, 1000);
}

function animatedLineChart(id, color) {
    var lineChart = echarts.init(document.getElementById(id));

    function randomData() {
        now = new Date(+now + oneDay);
        value = value + Math.random() * 21 - 10;
        return {
            name: now.toString(),
            value: [
                [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
                Math.round(value)
            ]
        };
    }
    var data = [];
    var now = new Date(2010, 9, 3);
    var oneDay = 24 * 3600 * 1000;
    var value = Math.random() * 1000;
    for (var i = 0; i < 1000; i++) {
        data.push(randomData());
    }
    var option = {
        color: [color],
        title: {
            text: null
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                params = params[0];
                var date = new Date(params.name);
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
            },
            axisPointer: {
                animation: false
            }
        },
        xAxis: {
            show: false,
            type: 'time',
            splitLine: {
                show: false
            }
        },
        yAxis: {
            show: false,
            type: 'value',
            boundaryGap: [0, '100%'],
            splitLine: {
                show: false
            }
        },
        series: [{
            name: 'Serie A',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: data
        }]
    };
    lineChart.setOption(option);
    setInterval(function() {
        for (var i = 0; i < 5; i++) {
            data.shift();
            data.push(randomData());
        }
        lineChart.setOption({
            series: [{
                data: data
            }]
        });
    }, 1000);
}

function peityDonut(element, radius, colors) {
    return $(element).peity('donut', {
        width: radius,
        radius: radius,
        fill: colors
    });
}

function peityPie(element, radius, colors) {
    return $(element).peity('pie', {
        height: radius,
        width: radius,
        radius: radius,
        fill: colors
    });
}

function peityBar(element, height, width, color) {
    return $(element).peity('bar', {
        height: height,
        width: width,
        fill: [color]
    });
}

function peityLine(element, height, width, color) {
    return $(element).peity('line', {
        height: height,
        width: width,
        fill: color,
        stroke: color
    });
}

function element_exists(id) {
        if ($(id).length === 0) {
            return false;
        }
        return true;
    }
    //http://www.sitepoint.com/javascript-generate-lighter-darker-color/

function colorLuminance(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        lum = lum || 0;
        // convert to decimal and change luminosity
        var rgb = "#",
            c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }
        return rgb;
    }
    //http://stackoverflow.com/questions/21646738/convert-hex-to-rgba

function hexToRgbA(hex, opacity) {
    var c;
    var o = opacity || 1;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + o + ')';
    }
    return false;
}

function incrementingData() {
    var series = [];
    var labels = [];
    for (var x = 0; x < 50; x++) {
        if (x % 2 === 0) {
            continue;
        }
        labels.push('Label ' + x);
        series.push(Functions.random(x, x + 10));
    }
    return {
        series: series,
        labels: labels
    }
}

function decrementingData() {
    var series = [];
    var labels = [];
    for (var x = 50; x > 0; x--) {
        if (x % 2 === 0) {
            continue;
        }
        labels.push('Label ' + x);
        series.push(Functions.random(x + 10, x));
    }
    return {
        series: series,
        labels: labels
    }
}

function randomData() {
    var series = [];
    var labels = [];
    for (var x = 0; x < 30; x++) {
        labels.push('Label ' + x);
        series.push(Functions.random(20, 80));
    }
    return {
        series: series,
        labels: labels
    }
}

function reverseArray(input) {
    var ret = [];
    for (var i = input.length - 1; i >= 0; i--) {
        ret.push(input[i]);
    }
    return ret;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lighten(col, amt) {
    amt = Math.abs(amt);
    amt = amt / 100;
    return colorLuminance(col, amt);
}

function darken(col, amt) {
    amt = Math.abs(amt);
    amt = (amt / 100) * -1;
    return colorLuminance(col, amt);
}
