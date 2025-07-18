window.addEventListener("load", function(event) {
    $('.q9').on('click', function (ev) {
        const el = document.getElementsByClassName('q10')[0];
        el.style = '';
        if(el.className.includes('closed')) el.className = el.className.replace('closed', 'opened');
        else el.className += ' opened';
        //for low-level browsers, ex: safari, yandex
        var styles = getComputedStyle(el);
        var itWorks = !!(styles.animation || styles.webkitAnimation);
        if(!itWorks) el.style.opacity = 1;
    });
    $('.q15').on('click', function (ev) {
        const el = document.getElementsByClassName('q10')[0];
        if(el.className.includes('opened')) el.className = el.className.replace('opened', 'closed');
        else el.className += ' closed';
        //for low-level browsers, ex: safari, yandex
        var styles = getComputedStyle(el);
        var itWorks = !!(styles.animation || styles.webkitAnimation);
        if(!itWorks) el.style.opacity = 0;
        document.getElementsByClassName('q18')[0].value = '';
        const mssg = document.getElementsByClassName('q20')[0];
        if(mssg.className.includes(' animate')) mssg.className = mssg.className.replace(' animate', '');
        mssg.innerHTML = '';
    });
    let already = false;
    $('.q17').on('click', function (ev) {
        const el = document.getElementsByClassName('q18')[0];
        const mssg = document.getElementsByClassName('q20')[0];
        if(el.value.length < 4){
            mssg.innerHTML = 'Название магазина должно быть более 4х символов.'
            if(!mssg.className.includes(' animate')) mssg.className += ' animate';
            return;
        }
        if(already) return;
        already = true;
        $.ajax({
            type:'post',
            url:'/shops/create',
            dataType: 'json',
            contentType: 'application/json',
            timeout: 15000,
            data: JSON.stringify({name: el.value}),
            success: (data) => location.href = data.link,
            error:function(e, d, m) {
                if(e.responseText == undefined) return;
                if(e.responseText.status == 'successfully') return location.href = e.responseText.link;
                already = false;
                const _mssg = document.getElementsByClassName('q20')[0];
                if(!_mssg.className.includes(' animate')) _mssg.className += ' animate';
                if(e.responseText == 'name-few-length') _mssg.innerHTML = 'Название магазина должно быть более 4х символов.';
                else if(e.responseText == 'name-many-length') _mssg.innerHTML = 'Название магазина должно быть не более 20ти символов.';
                else if(e.responseText == '401') location.reload();
            }
        });
    });
});