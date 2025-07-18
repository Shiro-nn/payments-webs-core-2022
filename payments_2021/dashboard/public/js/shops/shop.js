var $uploadCrop;
let loading = false;
var _link = window.location.href;
var lastChar = _link.substr(_link.length - 1);
if(lastChar == '/') _link = _link.substring(0, _link.length - 1);
var array = _link.split('/');
const shop_id = array[array.length - 1]
$('.z0').on('click', function (ev) {
    $('.q1').fadeOut(500);
    document.getElementById('f1').value = null;
    $('.w1').fadeOut(500);
});
$('.q7').on('click', function (ev) {
    $('.q1').fadeOut(500);
    document.getElementById('f1').value = null;
});
$('.upload-result').on('click', async function (ev) {
    $uploadCrop.croppie('result', {
        type: 'canvas',
        size: 'viewport'
    }).then(function (resp) {
        var file = dataURLtoFile(resp,'filedata.png');
        document.getElementById('avatar').style = `background-image: url("${createObjectURL(file)}");`
        uploader(file, 'png');
    });
});
function uploader(file, format) {
    if(loading) return;
    document.getElementById(`select_avatar`).src = `https://cdn.scpsl.store/bot/waiting.gif`;
    $.ajax({
        type:'post',
        url:"https://reserve.fydne.xyz:836/upload",
        dataType: 'json',
        contentType: 'application/json',
        timeout: 15000,
        success:function(data) {
            DoLoad();
        },
        error:function(e, d, m) {
            if(e.responseText == undefined || e.responseText == null){
                document.body.innerHTML += `
                <link rel="stylesheet" href="/css/modules/alert.css">
                <div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                Нет отклика от основного cdn-хоста, возможно, проблема из-за ADBlock'a, если он у вас включен, то лучше отключите.
                </div>`;
            }
            else DoLoad();
        }
    });
    function DoLoad() {
        let hash = guid().replace("#", '').replace("?", '');
        var formData = new FormData();
        formData.append("name", hash);
        formData.append("dir", `qurre.store/shops/${shop_id}`);
        formData.append("filedata", file);
        var request = new XMLHttpRequest();
        request.open("POST", "https://reserve.fydne.xyz:836/upload");
        loading = true;
        request.onload = function () {
            $.ajax({
                type:'post',
                url:`/shops/${shop_id}/set?type=avatar`,
                dataType: 'json',
                contentType: 'application/json',
                timeout: 15000,
                data: JSON.stringify({hash, format})
            });
            $('.q1').fadeOut(500);
            document.getElementById('f1').value = null;
            loading = false;
        };
        request.send(formData);
    }
}
$('input[class=f1]').change(function(e) {
    selecting_file = true;
    setTimeout(() => selecting_file = false, 2000);
    thisFunctionShoulBeCallByTheFileuploaderButton(e);
});
function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), 
    n = bstr.length,
    u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}
async function URLtoFile(url, filename){
    let response = await fetch(url);
    let data = await response.blob();
    var format = data.type.split('/')[1];
    return new File([data], `${filename}.${format}`, {type: data.type});
  }
function convertURIToImageData(URI) {
    return new Promise(function(resolve, reject) {
        if (URI == null) return reject();
        var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        image = new Image();
        image.addEventListener('load', function() {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(context.getImageData(0, 0, canvas.width, canvas.height));
        }, false);
        image.src = URI;
    });
}
function thisFunctionShoulBeCallByTheFileuploaderButton(e){
    e.preventDefault && e.preventDefault();
    var i;
    var images = 'files' in e.target ? e.target.files : 'dataTransfer' in e ? e.dataTransfer.files : [];
    if(images && images.length) {
        for(i in images) {
            if(typeof images[i] != 'object') continue;
            if (images[i].type.match(/image.*/)) {
                $uploadCrop.croppie('bind', {
                    url: createObjectURL(images[i])
                })
                $('.v1').fadeOut(0);
                $('#upload').fadeIn(0);
                $('.q1').fadeIn(500);
            }
        }
    }
}
function createObjectURL(i){ 
    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    return URL.createObjectURL(i);
}
function FileLoad() {
    document.querySelectorAll("#f1").forEach(function(element) {
        element.click()
    });
}

const guid = function(){return 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}
$(document).ready(function () {
    $uploadCrop = $('#upload').croppie({
        viewport: {width: 400, height: 400},
        enableExif: true,
    });
});
{
    let edit_bool = false;
    let frezze_edit = false;
    $('#name_edit').on('click', function (ev) {
        if(frezze_edit) return;
        const name = document.getElementById('name');
        if(!edit_bool){
            edit_bool = true;
            name.contentEditable = "true";
            name.classList = name.className.replace(' z14', '') + ' z14';
        }
        else{
            name.contentEditable = "false";
            name.classList = name.className.replace(' z14', '');
            edit_bool = false;
            Waiting();
            frezze_edit = true;
            const name_data = name.innerHTML;
            function SendNameRequest() {
                $.ajax({
                    type:'post',
                    url:`/shops/${shop_id}/set?type=name`,
                    dataType: 'json',
                    contentType: 'application/json',
                    timeout: 15000,
                    data: JSON.stringify({name: name_data}),
                    success:function(data) {
                        frezze_edit = false;
                        WaitingStop();
                        document.getElementById('mssg_name').style.display = 'none';
                    },
                    error:function(e, d, m) {
                        if(e.responseText == undefined) return setTimeout(() => SendNameRequest(), 1000);
                        const mssg = document.getElementById('mssg_name');
                        mssg.style = '';
                        if(e.responseText == 'name-few-length') mssg.innerHTML = 'Название магазина должно быть более 4х символов.';
                        else if(e.responseText == 'name-many-length') mssg.innerHTML = 'Название магазина должно быть не более 20ти символов.';
                        else mssg.style.display = 'none';
                        frezze_edit = false;
                        WaitingStop();
                    }
                });
            }
            SendNameRequest();
        }
    });
}
function Waiting() {
    var coord = getPosition();
    if(coord.x > ($(window).width() - 300)) coord.x = $(window).width() - 300;
    document.getElementById('waiting').style = `top: ${coord.y}px; left: ${coord.x}px;`;
}
function WaitingStop() {
    document.getElementById('waiting').style = `display:none;`;
}
function getPosition(e){
    var x = y = 0;
    if (!e) {
        var e = window.event;
    }
    if (e.pageX || e.pageY){
        x = e.pageX;
        y = e.pageY;
    } else if (e.clientX || e.clientY){
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return {x: x, y: y}
}
const config = {
    type: 'line',
    data: {},
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false
            },
        },
        hover: {
            mode: 'index',
            intersec: false
        },
        scales: {
            y: {
                min: 0,
                ticks: {
                    stepSize: 50
                }
            }
        }
    },
};
const config_prefer = {
    type: 'pie',
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        }
    },
};
window.addEventListener("load", function() {
    setInterval(() => document.querySelectorAll(".canvasjs-chart-credit").forEach((element) => element.outerHTML = ''), 100);
});
window.addEventListener("load", function() {
    const socket = io();
    $('#stats-click').on('click', function (ev) {
        document.getElementById('stats').style = '';
        document.getElementById('settings').style.display = 'none';
        document.getElementById('keys').style.display = 'none';
        document.getElementById('api').style.display = 'none';
        if(!document.getElementById('stats-click').className.includes('selected')) socket.emit('stats');
        document.getElementById('stats-click').classList = 'z19 selected';
        document.getElementById('settings-click').classList = 'z19';
        document.getElementById('keys-click').classList = 'z19';
        document.getElementById('api-click').classList = 'z19';
    });
    $('#settings-click').on('click', function (ev) {
        document.getElementById('stats').style.display = 'none';
        document.getElementById('settings').style = '';
        document.getElementById('keys').style.display = 'none';
        document.getElementById('api').style.display = 'none';
        document.getElementById('stats-click').classList = 'z19';
        document.getElementById('settings-click').classList = 'z19 selected';
        document.getElementById('keys-click').classList = 'z19';
        document.getElementById('api-click').classList = 'z19';
    });
    $('#keys-click').on('click', function (ev) {
        document.getElementById('stats').style.display = 'none';
        document.getElementById('settings').style.display = 'none';
        document.getElementById('keys').style = '';
        document.getElementById('api').style.display = 'none';
        document.getElementById('stats-click').classList = 'z19';
        document.getElementById('settings-click').classList = 'z19';
        document.getElementById('keys-click').classList = 'z19 selected';
        document.getElementById('api-click').classList = 'z19';
    });
    $('#api-click').on('click', function (ev) {
        document.getElementById('stats').style.display = 'none';
        document.getElementById('settings').style.display = 'none';
        document.getElementById('keys').style.display = 'none';
        document.getElementById('api').style = '';
        document.getElementById('stats-click').classList = 'z19';
        document.getElementById('settings-click').classList = 'z19';
        document.getElementById('keys-click').classList = 'z19';
        document.getElementById('api-click').classList = 'z19 selected';
    });
    socket.on("connect", () => {
        $.ajax({
            type:'post',
            url:`/shops/${shop_id}/info?type=initial`,
            dataType: 'json',
            contentType: 'application/json',
            timeout: 15000,
            data: JSON.stringify({socket: socket.id}),
            success: () => socket.emit('stats'),
            error: () => socket.emit('stats'),
        });
    });
    socket.on("stats", (data) => LoadLaterStats(data));
    //const chart = new Chart(document.getElementById('pay_stats'), config);
    const prefer = new Chart(document.getElementById('pay_prefer'), config_prefer);
    function Create(data) {
        console.log(data)
        let _data = {
            suc: [],
            err: [],
            cre: []
        };
        {
            data.suc = data.suc.sort((a, b) => a.date - b.date);
            data.err = data.err.sort((a, b) => a.date - b.date);
            data.cre = data.cre.sort((a, b) => a.date - b.date);
            for (let i = 0; i < data.suc.length; i++) {
                const _e = data.suc[i];
                _data.suc.push({ x: _e.date, y: parseInt(_e.inf) });
            }
            for (let i = 0; i < data.err.length; i++) {
                const _e = data.err[i];
                _data.err.push({ x: _e.date, y: parseInt(_e.inf) });
            }
            for (let i = 0; i < data.cre.length; i++) {
                const _e = data.cre[i];
                _data.cre.push({ x: _e.date, y: parseInt(_e.inf) });
            }
        }
        const toolTip = {shared: true},
        legend = {
            cursor: "pointer",
            itemclick: function (e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
                e.chart.render();
            }
        };
    
        const ChartOptions = {
            animationEnabled: true,
            theme: "dark2",
            toolTip,
            legend: legend,
            axisY: {
                suffix: ""
            },
            title: {
                text: 'Статистика по платежам'
            },
            data: [{
                type: "splineArea",
                showInLegend: "true",
                name: "Создано платежей",
                color: "#0089c7",
                xValueType: "dateTime",
                xValueFormatString: "DD.MM.YY",
                yValueFormatString: "#0",
                legendMarkerType: "square",
                dataPoints: _data.cre
            },{
                type: "splineArea",
                showInLegend: "true",
                name: "Успешных платежей",
                color: "#00cc16",
                xValueType: "dateTime",
                xValueFormatString: "DD.MM.YY",
                yValueFormatString: "#0",
                legendMarkerType: "square",
                dataPoints: _data.suc
            },{
                type: "splineArea",
                showInLegend: "true",
                name: "Отменено платежей",
                color: "#ff2b2b",
                xValueType: "dateTime",
                xValueFormatString: "DD.MM.YY",
                yValueFormatString: "#0",
                legendMarkerType: "square",
                dataPoints: _data.err
            },]
        };
        const uid = guid();
        const par = document.getElementById('pay_stats');
        par.innerHTML = '';
        const _new = document.createElement("div");
        par.appendChild(_new);
        _new.id = uid;
        const _newParent = document.createElement("div");
        _newParent.appendChild(_new);
        {
            const __new = document.createElement("div");
            __new.className = 't8';
            _newParent.appendChild(__new);
        }
        par.appendChild(_newParent);
        const _chart = new CanvasJS.Chart(uid, ChartOptions);
        _chart.options.axisX = {
            labelAngle: 0,
            crosshair: {
                enabled: true,
                snapToDataPoint: true,
                valueFormatString: "HH:mm"
            }
        }
        new syncCharts([_chart], true, true, true);
        _chart.render();
        setTimeout(() => {
            {
                const __new = document.createElement("div");
                __new.className = 't9';
                __new.style.left = '0';
                __new.style.top = '0';
                _new.getElementsByClassName('canvasjs-chart-container')[0].appendChild(__new);
            }
            {
                const __new = document.createElement("div");
                __new.className = 't9';
                __new.style.left = '0';
                __new.style.top = '390px';
                _new.getElementsByClassName('canvasjs-chart-container')[0].appendChild(__new);
            }
            {
                const __new = document.createElement("div");
                __new.className = 't9';
                __new.style.right = '0';
                __new.style.top = '390px';
                _new.getElementsByClassName('canvasjs-chart-container')[0].appendChild(__new);
            }
        }, 10);
    }
    function LoadLaterStats(data) {
        const __data = {
            labels: ['Qiwi', 'YooMoney', 'Карта', 'Телефон'],
            datasets: [
                {
                    data: data.prefer,
                    backgroundColor: ['#FFA200','#8c3dfd', '#5f646b', '#d0060e'],
                }
            ]
        };
        prefer.config.data = __data;
        prefer.update();
        Create(RenderData(data.success, data.canceled, data.total, data.labels));
    }
    function RenderData(suc, err, cre, labels) {
        const ret = {
            suc: [],
            err: [],
            cre: []
        };
        for (let i = 0; i < labels.length; i++) {
            const el = labels[i];
            const dateArray = el.split('.');
            const date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]).getTime();
            if(ret.suc.filter(x => x.date == date).length == 0) ret.suc.push({
                date,
                inf: suc.filter(x => x == el).length,
            });
            if(ret.err.filter(x => x.date == date).length == 0) ret.err.push({
                date,
                inf: err.filter(x => x == el).length,
            });
            if(ret.cre.filter(x => x.date == date).length == 0) ret.cre.push({
                date,
                inf: cre.filter(x => x == el).length,
            });
        }
        return ret;
    }
    let updatingBalance = false;
    UpdateShop();
    setInterval(() => UpdateShop(), 5000);
    function UpdateShop() {
        socket.emit('module');
    }
    socket.on("module", (data) => {
        RenderCurrency(data);
    });
    async function RenderCurrency(data) {
        {
            const el = document.getElementById('key_public');
            if(el.innerHTML != data.key_public) el.innerHTML = data.key_public;
        }
        if(!updatingBalance){
            let blnc = parseInt(document.getElementById('balance').innerHTML);
            let mb = data.balance - blnc;
            if(mb != 0){
                if(mb > 0){
                    updatingBalance = true;
                    while (mb > 0) {
                        blnc++;
                        mb--;
                        document.getElementById('balance').innerHTML = blnc;
                        await sleep(10);
                    }
                    updatingBalance = false;
                }
                if(mb < 0){
                    updatingBalance = true;
                    while (mb < 0) {
                        blnc--;
                        mb++;
                        document.getElementById('balance').innerHTML = blnc;
                        await sleep(10);
                    }
                    updatingBalance = false;
                }
            }
        }
    }
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    {
        let frezze_edit = false;
        $('#key_public_reset').on('click', function (ev) {
            if(frezze_edit) return;
            Waiting();
            frezze_edit = true;
            function SendRequest() {
                $.ajax({
                    type:'post',
                    url:`/shops/${shop_id}/set?type=public_key`,
                    dataType: 'json',
                    contentType: 'application/json',
                    timeout: 15000,
                    success:function(data) {
                        frezze_edit = false;
                        WaitingStop();
                    },
                    error:function(e, d, m) {
                        if(e.responseText == undefined) return setTimeout(() => SendRequest(), 1000);
                        UpdateShop();
                        frezze_edit = false;
                        WaitingStop();
                    }
                });
            }
            SendRequest();
        });
    }
});
window.addEventListener("load", function() {
    {
        let edit_bool = false;
        let frezze_edit = false;
        $('#link_main_edit').on('click', function (ev) {
            if(frezze_edit) return;
            const el = document.getElementById('link_main');
            if(!edit_bool){
                edit_bool = true;
                el.contentEditable = "true";
                el.classList = el.className.replace(' z14', '') + ' z14';
            }
            else{
                el.contentEditable = "false";
                el.classList = el.className.replace(' z14', '');
                edit_bool = false;
                Waiting();
                frezze_edit = true;
                const link_data = el.innerHTML;
                function SendRequest() {
                    $.ajax({
                        type:'post',
                        url:`/shops/${shop_id}/set?type=link_main`,
                        dataType: 'json',
                        contentType: 'application/json',
                        timeout: 15000,
                        data: JSON.stringify({link: link_data}),
                        success:function(data) {
                            frezze_edit = false;
                            WaitingStop();
                            document.getElementById('mssg_link_main').style.display = 'none';
                        },
                        error:function(e, d, m) {
                            if(e.responseText == undefined) return setTimeout(() => SendRequest(), 1000);
                            const mssg = document.getElementById('mssg_link_main');
                            mssg.style = '';
                            if(e.responseText == 'not_url') mssg.innerHTML = 'Это не ссылка.';
                            else mssg.style.display = 'none';
                            frezze_edit = false;
                            WaitingStop();
                        }
                    });
                }
                SendRequest();
            }
        });
    }
    {
        let edit_bool = false;
        let frezze_edit = false;
        $('#link_successfully_edit').on('click', function (ev) {
            if(frezze_edit) return;
            const el = document.getElementById('link_successfully');
            if(!edit_bool){
                edit_bool = true;
                el.contentEditable = "true";
                el.classList = el.className.replace(' z14', '') + ' z14';
            }
            else{
                el.contentEditable = "false";
                el.classList = el.className.replace(' z14', '');
                edit_bool = false;
                Waiting();
                frezze_edit = true;
                const link_data = el.innerHTML;
                function SendRequest() {
                    $.ajax({
                        type:'post',
                        url:`/shops/${shop_id}/set?type=link_successfully`,
                        dataType: 'json',
                        contentType: 'application/json',
                        timeout: 15000,
                        data: JSON.stringify({link: link_data}),
                        success:function(data) {
                            frezze_edit = false;
                            WaitingStop();
                            document.getElementById('mssg_link_successfully').style.display = 'none';
                        },
                        error:function(e, d, m) {
                            if(e.responseText == undefined) return setTimeout(() => SendRequest(), 1000);
                            const mssg = document.getElementById('mssg_link_successfully');
                            mssg.style = '';
                            if(e.responseText == 'not_url') mssg.innerHTML = 'Это не ссылка.';
                            else mssg.style.display = 'none';
                            frezze_edit = false;
                            WaitingStop();
                        }
                    });
                }
                SendRequest();
            }
        });
    }
    {
        let edit_bool = false;
        let frezze_edit = false;
        $('#link_error_edit').on('click', function (ev) {
            if(frezze_edit) return;
            const el = document.getElementById('link_error');
            if(!edit_bool){
                edit_bool = true;
                el.contentEditable = "true";
                el.classList = el.className.replace(' z14', '') + ' z14';
            }
            else{
                el.contentEditable = "false";
                el.classList = el.className.replace(' z14', '');
                edit_bool = false;
                Waiting();
                frezze_edit = true;
                const link_data = el.innerHTML;
                function SendRequest() {
                    $.ajax({
                        type:'post',
                        url:`/shops/${shop_id}/set?type=link_error`,
                        dataType: 'json',
                        contentType: 'application/json',
                        timeout: 15000,
                        data: JSON.stringify({link: link_data}),
                        success:function(data) {
                            frezze_edit = false;
                            WaitingStop();
                            document.getElementById('mssg_link_error').style.display = 'none';
                        },
                        error:function(e, d, m) {
                            if(e.responseText == undefined) return setTimeout(() => SendRequest(), 1000);
                            const mssg = document.getElementById('mssg_link_error');
                            mssg.style = '';
                            if(e.responseText == 'not_url') mssg.innerHTML = 'Это не ссылка.';
                            else mssg.style.display = 'none';
                            frezze_edit = false;
                            WaitingStop();
                        }
                    });
                }
                SendRequest();
            }
        });
    }
    {
        let edit_bool = false;
        let frezze_edit = false;
        $('#link_notification_edit').on('click', function (ev) {
            if(frezze_edit) return;
            const el = document.getElementById('link_notification');
            if(!edit_bool){
                edit_bool = true;
                el.contentEditable = "true";
                el.classList = el.className.replace(' z14', '') + ' z14';
            }
            else{
                el.contentEditable = "false";
                el.classList = el.className.replace(' z14', '');
                edit_bool = false;
                Waiting();
                frezze_edit = true;
                const link_data = el.innerHTML;
                function SendRequest() {
                    $.ajax({
                        type:'post',
                        url:`/shops/${shop_id}/set?type=link_notification`,
                        dataType: 'json',
                        contentType: 'application/json',
                        timeout: 15000,
                        data: JSON.stringify({link: link_data}),
                        success:function(data) {
                            frezze_edit = false;
                            WaitingStop();
                            document.getElementById('mssg_link_notification').style.display = 'none';
                        },
                        error:function(e, d, m) {
                            if(e.responseText == undefined) return setTimeout(() => SendRequest(), 1000);
                            const mssg = document.getElementById('mssg_link_notification');
                            mssg.style = '';
                            if(e.responseText == 'not_url') mssg.innerHTML = 'Это не ссылка.';
                            else mssg.style.display = 'none';
                            frezze_edit = false;
                            WaitingStop();
                        }
                    });
                }
                SendRequest();
            }
        });
    }
    {
        let edit_bool = false;
        let frezze_edit = false;
        $('#webhook_edit').on('click', function (ev) {
            if(frezze_edit) return;
            const el = document.getElementById('webhook');
            if(!edit_bool){
                edit_bool = true;
                el.contentEditable = "true";
                el.classList = el.className.replace(' z14', '') + ' z14';
            }
            else{
                el.contentEditable = "false";
                el.classList = el.className.replace(' z14', '');
                edit_bool = false;
                Waiting();
                frezze_edit = true;
                const link_data = el.innerHTML;
                function SendRequest() {
                    $.ajax({
                        type:'post',
                        url:`/shops/${shop_id}/set?type=webhook`,
                        dataType: 'json',
                        contentType: 'application/json',
                        timeout: 15000,
                        data: JSON.stringify({link: link_data}),
                        success:function(data) {
                            frezze_edit = false;
                            WaitingStop();
                            document.getElementById('mssg_webhook').style.display = 'none';
                        },
                        error:function(e, d, m) {
                            if(e.responseText == undefined) return setTimeout(() => SendRequest(), 1000);
                            const mssg = document.getElementById('mssg_webhook');
                            mssg.style = '';
                            if(e.responseText == 'not_url') mssg.innerHTML = 'Это не ссылка.';
                            else mssg.style.display = 'none';
                            frezze_edit = false;
                            WaitingStop();
                        }
                    });
                }
                SendRequest();
            }
        });
    }
});
window.addEventListener("load", function() {
    let frezze_edit = false;
    $('#pk_close').on('click', function (ev) {
        $('#pk_smth').fadeOut();
        document.getElementById('pk_text').value = '';
    });
    $('#pk_copy').on('click', function (ev) {
        navigator.clipboard.writeText(document.getElementById('pk_text').value);
        document.getElementById('pk_text').style.color = 'lime';
        setTimeout(() => document.getElementById('pk_text').style = '', 2000);
    });
    $('#key_private_reset').on('click', function (ev) {
        if(frezze_edit) return;
        Waiting();
        frezze_edit = true;
        function SendRequest() {
            $.ajax({
                type:'post',
                url:`/shops/${shop_id}/set?type=private_key`,
                dataType: 'json',
                contentType: 'application/json',
                timeout: 15000,
                success:function(data) {
                    frezze_edit = false;
                    WaitingStop();
                    DoRender(data.key);
                },
                error:function(e, d, m) {
                    if(e.responseText == undefined) return setTimeout(() => SendRequest(), 1000);
                    if(e.responseText.status == 'successfully') DoRender(e.responseText.key);
                    frezze_edit = false;
                    WaitingStop();
                }
            });
            function DoRender(key) {
                document.getElementById('pk_text').value = key;
                $('#pk_smth').fadeIn();
            }
        }
        SendRequest();
    });
});
window.addEventListener("load", function() {
    RenderSelector();
    function RenderSelector() {
        var x, j, ll, selElmnt, a, b, c;
        x = document.getElementById("withdrawal_div");
        selElmnt = x.getElementsByTagName("select")[0];
        ll = selElmnt.length;
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x.appendChild(a);
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 1; j < ll; j++) {
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function (e) {
                var y, i, k, s, h, sl, yl;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                sl = s.length;
                h = this.parentNode.previousSibling;
                for (i = 0; i < sl; i++) {
                    if (s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        y = this.parentNode.getElementsByClassName("same-as-selected");
                        yl = y.length;
                        for (k = 0; k < yl; k++) {
                            y[k].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                h.click();
            });
            b.appendChild(c);
        }
        x.appendChild(b);
        a.addEventListener("click", function (e) {
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
        function closeAllSelect(elmnt) {
            var x, y, i, xl, yl, arrNo = [];
            x = document.getElementsByClassName("select-items");
            y = document.getElementsByClassName("select-selected");
            xl = x.length;
            yl = y.length;
            for (i = 0; i < yl; i++) {
                if (elmnt == y[i]) {
                    arrNo.push(i)
                } else {
                    y[i].classList.remove("select-arrow-active");
                }
            }
            for (i = 0; i < xl; i++) {
                if (arrNo.indexOf(i)) {
                    x[i].classList.add("select-hide");
                }
            }
        }
        document.addEventListener("click", closeAllSelect);
    }
});
window.addEventListener("load", function() {
    document.getElementById('withdrawal_sum').addEventListener('input', function(){
        this.value = this.value.replace(/[^0-9.]/g, '');
        if(this.value.length > 6) this.value = this.value.substring(0, 6);
    });
    $('#withdrawal_click').on('click', function (ev) {
        $('#withdrawal_el').fadeIn();
    });
    $('#withdrawal_close').on('click', function (ev) {
        $('#withdrawal_el').fadeOut();
    });
    let _frezze = false;
    $('#withdrawal_submit').on('click', function (ev) {
        const el = document.getElementById('withdrawal_input').value;
        const el2 = document.getElementById('withdrawal_sum').value;
        const el3 = parseInt(document.getElementById('withdrawal').value);
        const msg = document.getElementById('withdrawal_msg');
        if(el.length == 0) return msg.innerHTML = 'Укажите номер или ник кошелька или карты, на который надо вывести средства';
        if(el2.length == 0) return msg.innerHTML = 'Укажите cумму вывода';
        if(el3 == 0) return msg.innerHTML = 'Укажите способ вывода';
        if(_frezze) return;
        _frezze = true;
        msg.innerHTML = 'Создание запроса..';
        function SendRequest() {
            $.ajax({
                type:'post',
                url:`/shops/${shop_id}/set?type=withdrawal`,
                dataType: 'json',
                contentType: 'application/json',
                timeout: 15000,
                data: JSON.stringify({sum: el2, to: el, method: el3}),
                success:function(data) {
                    _frezze = false;
                    DoRender();
                },
                error:function(e, d, m) {
                    if(e.responseText == undefined) return setTimeout(() => SendRequest(), 1000);
                    if(e.responseText == 'successfully') DoRender();
                    _frezze = false;
                    WaitingStop();
                }
            });
            function DoRender() {
                msg.innerHTML = 'Запрос на вывод создан';
            }
        }
        SendRequest();
    });
});
window.addEventListener("load", function() {
    setInterval(() => Update(), 1000);
    function Update() {
        const elements = document.getElementsByClassName('totext');
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const text = element.innerHTML.replace(/</g,"&lt;");
            if(element.innerHTML != text) element.innerHTML = text;
        }
    }
});
class syncCharts {
    constructor(charts, syncToolTip, syncCrosshair, syncAxisXRange) {

        if (!this.onToolTipUpdated) {
            this.onToolTipUpdated = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (charts[j] != e.chart)
                        charts[j].toolTip.showAtX(e.entries[0].xValue);
                }
            };
        }

        if (!this.onToolTipHidden) {
            this.onToolTipHidden = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (charts[j] != e.chart)
                        charts[j].toolTip.hide();
                }
            };
        }

        if (!this.onCrosshairUpdated) {
            this.onCrosshairUpdated = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (charts[j] != e.chart)
                        charts[j].axisX[0].crosshair.showAt(e.value);
                }
            };
        }

        if (!this.onCrosshairHidden) {
            this.onCrosshairHidden = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (charts[j] != e.chart)
                        charts[j].axisX[0].crosshair.hide();
                }
            };
        }

        if (!this.onRangeChanged) {
            this.onRangeChanged = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (e.trigger === "reset") {
                        charts[j].options.axisX.viewportMinimum = charts[j].options.axisX.viewportMaximum = null;
                        charts[j].options.axisY.viewportMinimum = charts[j].options.axisY.viewportMaximum = null;
                        charts[j].render();
                    } else if (charts[j] !== e.chart) {
                        charts[j].options.axisX.viewportMinimum = e.axisX[0].viewportMinimum;
                        charts[j].options.axisX.viewportMaximum = e.axisX[0].viewportMaximum;
                        charts[j].render();
                    }
                }
            };
        }

        for (var i = 0; i < charts.length; i++) {

            if (syncToolTip) {
                if (!charts[i].options.toolTip)
                    charts[i].options.toolTip = {};

                charts[i].options.toolTip.updated = this.onToolTipUpdated;
                charts[i].options.toolTip.hidden = this.onToolTipHidden;
            }

            if (syncCrosshair) {
                if (!charts[i].options.axisX)
                    charts[i].options.axisX = { crosshair: { enabled: true } };

                charts[i].options.axisX.crosshair.updated = this.onCrosshairUpdated;
                charts[i].options.axisX.crosshair.hidden = this.onCrosshairHidden;
            }

            if (syncAxisXRange) {
                charts[i].options.zoomEnabled = true;
                charts[i].options.rangeChanged = this.onRangeChanged;
            }
        }
    }
}