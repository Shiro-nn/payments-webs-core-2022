window.addEventListener("load", function() {
    var _link = window.location.href;
    var lastChar = _link.substr(_link.length - 1);
    if(lastChar == '/') _link = _link.substring(0, _link.length - 1);
    var array = _link.split('/');
    const pay_id = array[array.length - 1];
    let CardId = 1;
    setTimeout(() => LoopCard(), 5000);
    async function LoopCard() {
        const el = document.getElementsByClassName('card')[0];
        if(el == null || el == undefined) return;
        CardId++;
        let url = '';
        if(CardId == 1) url = '/img/visa.png';
        else if(CardId == 2) url = '/img/mc.png';
        else if(CardId == 3) url = '/img/maestro.png';
        else if(CardId == 4) url = '/img/mir.png';
        else{
            CardId = 0;
            LoopCard();
            return;
        }
        $(el).fadeOut(1000);
        setTimeout(() => {
            el.style.backgroundImage = `url('${url}')`;
            $(el).fadeIn(1000);
            setTimeout(() => LoopCard(), 5000);
        }, 1000);
    }
    let TelephoneId = 1;
    setTimeout(() => LoopTelephone(), 5000);
    async function LoopTelephone() {
        const el = document.getElementsByClassName('telephone')[0];
        if(el == null || el == undefined) return;
        TelephoneId++;
        let url = '';
        if(TelephoneId == 1) url = '/img/beeline.png';
        else if(TelephoneId == 2) url = '/img/mtc.png';
        else if(TelephoneId == 3) url = '/img/tele2.png';
        else{
            TelephoneId = 0;
            LoopTelephone();
            return;
        }
        $(el).fadeOut(1000);
        setTimeout(() => {
            el.style.backgroundImage = `url('${url}')`;
            $(el).fadeIn(1000);
            setTimeout(() => LoopTelephone(), 5000);
        }, 1000);
    }
    let CryptoId = 1;
    setTimeout(() => LoopCrypto(), 5000);
    async function LoopCrypto() {
        const el = document.getElementsByClassName('crypto')[0];
        if(el == null || el == undefined) return;
        CryptoId++;
        let url = '';
        if(CryptoId == 1) url = '/img/BTC.svg';
        else if(CryptoId == 2) url = '/img/ETH.svg';
        else if(CryptoId == 3) url = '/img/LTC_big.svg';
        else if(CryptoId == 4) url = '/img/USDT.svg';
        else{
            CryptoId = 0;
            LoopCrypto();
            return;
        }
        $(el).fadeOut(1000);
        setTimeout(() => {
            el.style.backgroundImage = `url('${url}')`;
            $(el).fadeIn(1000);
            setTimeout(() => LoopCrypto(), 5000);
        }, 1000);
    }
    document.querySelectorAll('#qiwi').forEach((el) => el.addEventListener('click', () => SendRequest('qiwi')));
    document.querySelectorAll('#yoomoney').forEach((el) => el.addEventListener('click', () => SendRequest('yoomoney')));
    document.querySelectorAll('#qurre_card').forEach((el) => el.addEventListener('click', () => SendRequest('card')));
    document.querySelectorAll('#crypto').forEach((el) => el.addEventListener('click', () => SendRequest('crypto')));
    $('#card').on('click', () => $('#card_panel').fadeIn());//SendRequest('card');
    $('#card_close').on('click', () => $('#card_panel').fadeOut());
    $('#tl_first').on('click', function () {
        document.getElementById('tl_error').innerHTML = '';
        $('#tl_smth').fadeIn();
    });
    $('#tl_close').on('click', () => $('#tl_smth').fadeOut());
    $('#telephone').on('click', function () {
        const telephone = document.getElementById('telephone_input').value;
        if(telephone.length != 12) return document.getElementById('tl_error').innerHTML = '<br>В номере телефона должно быть 10 символов (без учета +7)'
        SendRequest('telephone', {telephone});
    });
    document.getElementById('telephone_input').addEventListener('input', function(){
        this.value = '+'+this.value.replace(/[^0-9.]/g, '');
        if(this.value.length < 3) this.value = '+7';
        if(this.value.length > 12) this.value = this.value.substring(0, 12);
        if(this.value.substring(0, 2) != '+7') this.value = '+7'+this.value.substring(2, 12);
    });
    frezze_edit = false;
    function SendRequest(_type, params = {}) {
        if(frezze_edit) return;
        frezze_edit = true;
        Waiting();
        $.ajax({
            type:'post',
            url:`/pay/${pay_id}?type=${_type}`,
            dataType: 'json',
            contentType: 'application/json',
            timeout: 15000,
            data: JSON.stringify(params),
            success:function(data) {
                frezze_edit = false;
                WaitingStop();
                if(data.status == 'successfully') window.top.location.href = data.link;
            },
            error:function(e, d, m) {
                if(e.responseText == undefined) return setTimeout(() => SendRequest(_type), 1000);
                if(e.responseText.status == 'successfully') window.top.location.href = e.responseText.link;
                frezze_edit = false;
                WaitingStop();
            }
        });
    }
    var socket = io();
    socket.on("get_pay", (paid, canceled) => DoRender(paid, canceled));
    setInterval(() => GetPaidValue(), 5000);
    function GetPaidValue() {
        socket.emit('get_pay', pay_id);
    }
    function DoRender(paid, canceled) {
        if(paid || canceled) try{document.getElementById('pay2').outerHTML = ''}catch{}
        try{
            const el = document.getElementById('pay1');
            if(paid){
                el.innerHTML = 'Успешно оплачен';
                el.className = 'q7 q11';
            }else if(canceled){
                el.innerHTML = 'Отменен';
                el.className = 'q7 canceled';
            }
        }catch{}
    }
});

function Waiting() {
    var coord = getPosition();
    if(coord.x > ($(window).width() - 300)) coord.x = $(window).width() - 300;
    document.getElementById('waiting').style = `top: ${coord.y}px; left: ${coord.x}px;`;
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
}
function WaitingStop() {
    document.getElementById('waiting').style = `display:none;`;
}