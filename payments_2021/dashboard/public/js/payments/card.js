const guid = function(){return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}
const BanksPanel = {
    tinkoff:{
        el:null,
        tippy:null
    },
    rshb:{
        el:null,
        tippy:null
    },
    open:{
        el:null,
        tippy:null
    }
};
window.addEventListener('load', () => {
    const icon = document.getElementById('card.lockIcon');
    const icon1 = tippy(icon, {
        content: "Ваши данные защищены",
    });
    icon.onmouseover = icon.onmouseout = mouseevents;

    const tb = document.getElementById('bank.tinkoff');
    const tb1 = tippy(tb, {
        content: "Тинькофф Банк",
    });
    const tb2 = tippy(tb, {
        content: "Ожидает",
        placement: 'bottom',
    });

    const rshb = document.getElementById('bank.rshb');
    const rshb1 = tippy(rshb, {
        content: "РоссельхозБанк",
        placement: 'top',
    });
    const rshb2 = tippy(rshb, {
        content: "Недоступен",
        placement: 'bottom',
    });

    const ob = document.getElementById('bank.open');
    const ob1 = tippy(ob, {
        content: "Банк Открытие",
        placement: 'top',
    });
    const ob2 = tippy(ob, {
        content: "Недоступен",
        placement: 'bottom',
    });
    BanksPanel.tinkoff.el = tb;
    BanksPanel.tinkoff.tippy = tb2;
    BanksPanel.open.el = ob;
    BanksPanel.open.tippy = ob2;
    BanksPanel.rshb.el = rshb;
    BanksPanel.rshb.tippy = rshb2;
    rshb.onmouseover = rshb.onmouseout = mouseevents;
    tb.onmouseover = tb.onmouseout = mouseevents;
    ob.onmouseover = ob.onmouseout = mouseevents;
    function mouseevents(ev) {
        if (ev.type == 'mouseover') {
            if(ev.target.id == tb.id){
                tb2.show();
                tb1.show();
            }
            else if(ev.target.id == rshb.id){
                rshb2.show();
                rshb1.show();
            }
            else if(ev.target.id == ob.id){
                ob2.show();
                ob1.show();
            }
            
            else if(ev.target.id == icon.id){
                icon1.show();
            }
        }
        else if (ev.type == 'mouseout') {
            if(ev.target.id == tb.id){
                tb2.hide();
                tb1.hide();
            }
            else if(ev.target.id == rshb.id){
                rshb2.hide();
                rshb1.hide();
            }
            else if(ev.target.id == ob.id){
                ob2.hide();
                ob1.hide();
            }
            
            else if(ev.target.id == icon.id){
                icon1.hide();
            }
        }
    }
});
const payId = window.location.pathname.replace('/card/', '');
function GetOrUpdatePayData(){
    const payData = window.localStorage.getItem(`pay.${payId}`);
    if(payData == null || payData == undefined){
        const json = {
            card: '',
            banks:{
                current: 0,
                tinkoff:{
                    commission: -1,
                    skipped: false
                },
                rshb:{
                    commission: -1,
                    skipped: false
                },
                open:{
                    commission: -1,
                    skipped: false
                }
            }
        };
        window.localStorage.setItem(`pay.${payId}`, JSON.stringify(json));
        return json;
    }
    return JSON.parse(payData);
}
function SetPayData(json) {
    window.localStorage.setItem(`pay.${payId}`, JSON.stringify(json));
}
function RefreshPayData() {
    const json = {
        card: '',
        banks:{
            current: 0,
            tinkoff:{
                commission: -1,
                skipped: false
            },
            rshb:{
                commission: -1,
                skipped: false
            },
            open:{
                commission: -1,
                skipped: false
            }
        }
    };
    window.localStorage.setItem(`pay.${payId}`, JSON.stringify(json));
    return json;
}
window.addEventListener('load', () => {
    const mir = 'https://cdn.scpsl.store/qurre.store/img/mir.svg';
    const visa = 'https://cdn.scpsl.store/qurre.store/img/visa.svg';
    const mc = 'https://cdn.scpsl.store/qurre.store/img/mc.svg';
    const logger = new Logger();
    let year = parseInt(new Date().getFullYear().toString().substring(2));
    if(isNaN(year)) year = 20;
    //const fac = new FastAverageColor();
    let uid = '';
    let proccessed = [];
    let commission = false;
    let inProccess = false;
    const cardButton = document.getElementById('card.button');
    const cardNumber = document.getElementById('card.number');
    const cardDate = document.getElementById('card.date');
    const cardCVV = document.getElementById('card.cvv');
    const lockIcon = document.getElementById('card.lockIcon');
    cardButton.innerHTML = 'Расчитать комиссию';
    setInterval(() => {try{
        const PayData = GetOrUpdatePayData();
        const cardNumb = cardNumber.value.replace(/[^0-9]/g, '');
        if(PayData.banks.current < 0 && PayData.banks.current > 3){
            PayData.banks.current = 0;
            cardButton.innerHTML = 'Расчитать комиссию';
            document.getElementById('card.pay.bank').innerHTML = 'Не выбран';
            document.getElementById('card.pay.commission').innerHTML = '?';
            document.getElementById('card.pay.sum').innerHTML = '?';
            SetPayData(PayData);
        }
        else if(PayData.card != cardNumb) cardButton.innerHTML = 'Расчитать комиссию';
        else if(commission) cardButton.innerHTML = 'Оплатить';
    }catch{}}, 2000);
    cardButton.addEventListener('click', function(){
        if(inProccess) return;
        const cardNumb = cardNumber.value.replace(/[^0-9]/g, '');
        if(cardNumb.length < 16) return logger.warn('Укажите действительный номер карты');
        const salt = window.location.host;
        inProccess = true;
        const PayData = GetOrUpdatePayData();
        if(PayData.card != cardNumb) commission = false;
        if(!commission){
            if(PayData.banks.current == 0){
                if(PayData.card == cardNumb && PayData.banks.tinkoff.commission >= 0){
                    inProccess = false;
                    document.getElementById('card.pay.commission').innerHTML = PayData.banks.tinkoff.commission;
                    document.getElementById('card.pay.sum').innerHTML = sum + PayData.banks.tinkoff.commission;
                    document.getElementById('card.pay.bank').innerHTML = 'Тинькофф';
                    cardButton.innerHTML = 'Оплатить';
                    commission = true;
                    BanksPanel.tinkoff.el.className = 'm12 m12-now';
                    BanksPanel.tinkoff.tippy.setContent('Готов');
                    return;
                }
                SendReq('Тинькофф');
            }
            else if(PayData.banks.current == 1){
                if(PayData.card == cardNumb && PayData.banks.rshb.commission >= 0){
                    inProccess = false;
                    document.getElementById('card.pay.commission').innerHTML = PayData.banks.rshb.commission;
                    document.getElementById('card.pay.sum').innerHTML = sum + PayData.banks.rshb.commission;
                    document.getElementById('card.pay.bank').innerHTML = 'РоссельхозБанк';
                    cardButton.innerHTML = 'Оплатить';
                    commission = true;
                    BanksPanel.rshb.el.className = 'm12 m12-now';
                    BanksPanel.rshb.tippy.setContent('Готов');
                    return;
                }
                SendReq('РоссельхозБанк');
            }
            function SendReq(bank) {
                $.ajax({
                    type:'post',
                    url:`/api/card?type=commission`,
                    dataType: 'json',
                    contentType: 'application/json',
                    timeout: 15000,
                    data: JSON.stringify({
                        id: PayData.banks.current,
                        data:{
                            card: CryptoJS.AES.encrypt(cardNumb, salt).toString(),
                            pay: payId, sum
                        }
                    }),
                    success:(data) => GetData(data, PayData.banks.current, bank),
                    error:(e) => GetData(e.responseText, PayData.banks.current, bank),
                });
            }
            function GetData(data, bank, name) {
                const totalSum = parseInt(data);
                inProccess = false;
                if(isNaN(totalSum)){
                    let msg = '';
                    try{
                        const jd = JSON.parse(data);
                        if(jd.message != null && jd.message != undefined) msg = `:\n${jd.message}`;
                    }catch{}
                    logger.warn('Произошла ошибка при получении комиссии' + msg);
                    return;
                }
                document.getElementById('card.pay.commission').innerHTML = totalSum - sum;
                document.getElementById('card.pay.sum').innerHTML = totalSum;
                document.getElementById('card.pay.bank').innerHTML = name;
                cardButton.innerHTML = 'Оплатить';
                commission = true;
                if(bank == 0) PayData.banks.tinkoff.commission = totalSum - sum;
                else if(bank == 1) PayData.banks.rshb.commission = totalSum - sum;
                PayData.card = cardNumb;
                SetPayData(PayData);
                if(bank == 0){
                    BanksPanel.tinkoff.el.className = 'm12 m12-now';
                    BanksPanel.tinkoff.tippy.setContent('Готов');
                }else if(bank == 1){
                    BanksPanel.rshb.el.className = 'm12 m12-now';
                    BanksPanel.rshb.tippy.setContent('Готов');
                }
            }
        }else{
            $.ajax({
                type:'post',
                url:`/api/card?type=pay`,
                dataType: 'json',
                contentType: 'application/json',
                timeout: 15000,
                data: JSON.stringify({
                    id: PayData.banks.current,
                    data:{
                        card: CryptoJS.AES.encrypt(JSON.stringify({num:cardNumb,date:cachedDate,cvv:cachedCVV}), salt+payId).toString(),
                        pay: payId, sum
                    }
                }),
                success:(data) => GetData(data),
                error:(e) => GetData(e.responseText)
            });
            function GetData(data) {
                inProccess = false;
                if(data.status == 'error' || data.status != 'ok'){
                    let msg = '';
                    if(data.message != null && data.message != undefined) msg = `:\n${data.message}`;
                    logger.warn('Произошла ошибка при создании оплаты' + msg);
                    return;
                }
                console.log(data)
                const f1 = document.createElement('form');
                f1.action = data.url;
                f1.method = 'POST';
                f1.name = 'mainform';
                f1.style.display = 'none';
                document.getElementsByTagName('body')[0].appendChild(f1);
                const f2 = document.createElement('input');
                f2.type = 'hidden';
                f2.name = 'PaReq';
                f2.value = data.req;
                f1.appendChild(f2);
                const f3 = document.createElement('input');
                f3.type = 'hidden';
                f3.name = 'MD';
                f3.value = data.md;
                f1.appendChild(f3);
                const f4 = document.createElement('input');
                f4.type = 'hidden';
                f4.name = 'TermUrl';
                f4.value = data.cb;
                f1.appendChild(f4);
                f1.submit();
            }
        }
    });
    let cachedCVV = '';
    cardCVV.addEventListener('input', function(){
        if(inProccess) this.value = cachedCVV;
        this.value = this.value.replace(/[^0-9]/g, '');
        if(this.value.length > 3) this.value = this.value.substring(0, 3);
        cachedCVV = this.value;
    });
    let cachedDate = '';
    cardDate.addEventListener('input', function(){
        if(inProccess) this.value = cachedDate;
        this.value = this.value.replace(/[^0-9]/g, '');
        if(this.value.length > 4) this.value = this.value.substring(0, 4);
        let dostr = '';
        for (let i = 0; i < 2; i++) {
            let dt = this.value.substring(0 + i * 2, 2 + i * 2);
            if(dt?.length == 2){
                if(i == 0){
                    const _numbcd = parseInt(dt);
                    if(_numbcd > 12) dt = '12';
                    else if(_numbcd < 1) dt = '01';
                }else if(i == 1){
                    const _numbcd = parseInt(dt);
                    if(_numbcd < year) dt = '22';
                }
            }
            dostr += dt;
            if(i == 0 && dt?.length == 2){
                dostr += '/';
            }
        }
        this.value = dostr.trim();
        cachedDate = this.value;
        if(this.value.substring(this.value.length-1) == '/') this.value = this.value.substring(0, this.value.length-1)
    });
    let cachedCard = '';
    cardNumber.addEventListener('input', function(){
        if(inProccess) this.value = cachedCard;
        this.value = this.value.replace(/[^0-9]/g, '');
        if(this.value.length > 16) this.value = this.value.substring(0, 16);
        const value = this.value;
        cachedCard = value;
        let dostr = '';
        for (let i = 0; i < 4; i++) {
            const dt = this.value.substring(0 + i * 4, 4 + i * 4);
            dostr += dt;
            if(i != 3 && dt?.length == 4){
                dostr += ' ';
            }
        }
        this.value = dostr.trim();
        if(value.length < 6) return Update(undefined);
        /*if(value.length < 6) {
            const keys = Object.keys(window.localStorage);
            let found = false;
            keys.forEach(key => {
                if(found) return;
                if(key.substring(5, value.length + 5) == value){
                    const __data = window.localStorage.getItem(key);
                    if(__data != null && __data != undefined){
                        found = true;
                        Update(JSON.parse(__data));
                    }
                    return;
                }
            });
            if(!found) Update(undefined);
            return;
        }*/
        const locval = `${value}00000000`.substring(0, 6);
        const _data = window.localStorage.getItem(`card.${locval}`);
        if(_data != null && _data != undefined){
            Update(JSON.parse(_data));
            return;
        }
        if(proccessed.filter(x => x == locval).length > 0) return;
        const luid = guid();
        uid = luid;
        proccessed.push(locval);
        $.ajax({
            type:'post',
            url:`https://api.tinkoff.ru/v1/brand_by_bin?origin=web%2Cib5%2Cplatform&bin=${locval}`,
            dataType: 'json',
            contentType: 'application/json',
            timeout: 15000,
            success:function(data) {
                if(data.resultCode == 'OK') window.localStorage.setItem(`card.${locval}`, JSON.stringify(data.payload));
                proccessed = proccessed.filter(x => x != locval);
                if(uid != luid) return;
                Update(data.payload);
            },
            error:function(e, d, m) {
                if(e.responseJSON.resultCode == 'OK') window.localStorage.setItem(`card.${locval}`, JSON.stringify(e.responseJSON.payload));
                proccessed = proccessed.filter(x => x != locval);
                if(uid != luid) return;
                Update(e.responseJSON.payload);
            },
        });
    });
    {
        const _payData = GetOrUpdatePayData();
        if(_payData.card != null && _payData.card != undefined && _payData.card != ''){
            cardNumber.value = _payData.card;
            var event;
            if(document.createEvent){
                event = document.createEvent("HTMLEvents");
                event.initEvent("input");
                event.eventName = "input";
                cardNumber.dispatchEvent(event);
            } else {
                event = document.createEventObject();
                event.eventName = "input";
                event.eventType = "input";
                cardNumber.fireEvent("on" + event.eventType, event);
            }
            if(_payData.banks.tinkoff.skipped){
                BanksPanel.tinkoff.el.className = 'm12 m12-error';
                BanksPanel.tinkoff.tippy.setContent('Пропущен');
                _payData.banks.current = 1;
            }
            else if(_payData.banks.rshb.skipped){
                BanksPanel.rshb.el.className = 'm12 m12-error';
                BanksPanel.rshb.tippy.setContent('Пропущен');
                _payData.banks.current = 2;
            }
            else if(_payData.banks.open.skipped){
                BanksPanel.open.el.className = 'm12 m12-error';
                BanksPanel.open.tippy.setContent('Пропущен');
                _payData.banks.current = 0;
            }
            console.log(_payData)
            SetPayData(_payData);
        }
    }
    function Update(data) {
        console.log(data);
        const text = document.getElementById('card.text');
        const color = document.getElementById('card.color');
        const img = document.getElementById('card.img');
        const bank = document.getElementById('card.bank');
        const paysystem = document.getElementById('card.paysystem');
        const inputnumber = document.getElementById('card.number');
        img.style = '';
        bank.innerHTML = '';
        text.style.color = '#fff';
        color.style = '';
        paysystem.style = '';
        inputnumber.style = '';
        cardDate.style = '';
        cardCVV.style = '';
        lockIcon.style = '';
        if(data == null || data == undefined) return;
        if(data.name == '' && data.bank != undefined) data.name = data.bank;
        bank.innerHTML = data.name;
        let isDark = true;
        if(data.bank == 'Tinkoff Bank'){
            color.style.background = 'linear-gradient(to right, rgb(29, 37, 60), rgb(62, 71, 87))';
            img.style.background = `url(https://cdn.scpsl.store/qurre.store/img/tinkoff.svg) center center / 100% no-repeat`;
        }
        else{
            if(data.baseColor){
                color.style.backgroundColor = `#${data.baseColor}`;
                try{
                    isDark = isDarkColor(data.baseColor);
                    text.style.color = isDark ? '#fff' : '#000';
                }catch{text.style.color = '#fff'}
            }
            if(data.logoFile != 'default.png') img.style.background = `url(https://brands-prod.cdn-tinkoff.ru/general_logo/${data.logoFile}) center center / 100% no-repeat`;
        }
        const inpsColor = isDark ? '#b6b6b6' : '#414141';
        inputnumber.style.color = inpsColor;
        cardDate.style.color = inpsColor;
        cardCVV.style.color = inpsColor;
        lockIcon.style.color = inpsColor;
        let mt = '';
        const psl = data.paymentSystem?.toLowerCase();
        if(psl == 'mir') mt = `url(${mir}) center center / 100% no-repeat`;
        else if(psl == 'visa') mt = `url(${visa}) center center / 100% no-repeat`;
        if(psl == 'mastercard') paysystem.style.background = `url(${mc}) center center / 100% no-repeat`;
        else if(mt != '') paysystem.style = `background-color: ${isDark ? '#fff' : '#000'}; -webkit-mask: ${mt}; mask: ${mt};`;
        if(data.bank == 'QIWI Bank' && psl == 'mir'){
            img.style = '';
            bank.innerHTML = '';
            color.style.background = `url(https://cdn.scpsl.store/qurre.store/img/qiwi-mir.svg) center center / 100% no-repeat`;
        }
        if(data.bank == 'VTB'){
            img.style = '';
            bank.innerHTML = '';
            color.style.background = `url(https://cdn.scpsl.store/qurre.store/img/vtb_card.png) center center / 100% no-repeat`;
            if(window.innerWidth < 1024 && window.innerWidth > 600){
                color.style.backgroundPositionX = '-42px';
                color.style.backgroundSize = '120%';
            }else if(window.innerWidth < 600){
                color.style.backgroundPositionX = '-42px';
                color.style.backgroundSize = '126%';
            }
        }
    }
    {
        const errlog = getUrlVars()['error'];
        if(errlog != undefined && errlog != null && errlog != ''){
            logger.error('Произошла ошибка при оплате:<br>'+errlog);
            window.history.pushState('Qurre Pay', 'Qurre Pay', window.location.href.split('?')[0]);
        }
    }
});
const isDarkColor = (hexColor, options) => {
    if(hexColor == undefined || hexColor == null || hexColor.toLowerCase() == '21a038' || hexColor.toLowerCase() == '00bef1') return true;
    if (options && options.override) {
        const overridedColor = Object.keys(options.override).find(k => k.toLowerCase() === hexColor.toLowerCase())
      if (overridedColor !== undefined) {
        return options.override[overridedColor]
      }
    }
  
    const { r, g, b } = hexToRgb(hexColor)
  
    let colorArray = [r / 255, g / 255, b / 255].map(v => {
      if (v <= 0.03928) {
        return v / 12.92
      }
  
      return Math.pow((v + 0.055) / 1.055, 2.4)
    })
  
    const luminance = 0.2126 * colorArray[0] + 0.7152 * colorArray[1] + 0.0722 * colorArray[2]
  
    return luminance <= 0.179
}
const hexToRgb = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null
}
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = decodeURIComponent(hash[1]);
    }
    return vars;
}