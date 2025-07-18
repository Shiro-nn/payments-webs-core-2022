class Logger{
    constructor() {
        const e1 = document.createElement('div');
        e1.className = 'logger_1';
        document.getElementsByTagName('body')[0].appendChild(e1);
        const e2 = document.createElement('logger-menu');
        e2.className = 'logger_2';
        e2.style.display = 'none';
        e1.appendChild(e2);
        this.menu = e2;
        const e3 = document.createElement('div');
        e3.className = 'logger_3';
        e2.appendChild(e3);
        const e4 = document.createElement('div');
        e4.className = 'logger_4';
        e3.appendChild(e4);
        const e5 = document.createElement('span');
        e5.className = 'logger_5';
        e5.innerHTML = 'Список логов';
        e4.appendChild(e5);
        const stl = document.createElement('style');
        stl.innerHTML = `
.logger_1{
    margin: 0;
    font-family: "Source Sans Pro";
    font-size: .875rem;
    font-weight: 400;
    line-height: 1.6;
    color: #ccc;
    text-align: left;
    background-color: #131d27;
}
.logger_1{
    position: absolute;
    z-index: 1050;
    top: 0px;
    right: 0px;
    will-change: transform;
    transform: translate(-140px, 39px);
}
.logger_2{
    position: static;
    display: block;
    right: auto;
    bottom: auto;
    min-width: 300px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 0 1rem rgb(0 0 0 / 25%), 0 1px 1px rgb(0 0 0 / 12%);
    top: 100%;
    left: 0;
    z-index: 1000;
    float: left;
    padding: .5rem 0;
    margin: .125rem 0 0;
    font-size: 12px;
    color: #ccc;
    text-align: left;
    list-style: none;
    background-color: #1D272D;
    background-clip: padding-box;
    border: 1px solid rgba(0,0,0,0.15);
    border-radius: .4rem;
}
.logger_3{
    align-items: center !important;
    display: flex !important;
}
.logger_4{
    display: block;
    padding: .5rem 1.5rem;
    margin-bottom: 0;
    font-size: .85rem;
    color: #adb5bd;
    white-space: nowrap;
}
.logger_5{
    cursor: url(/cursors/green/select.cur), text !important;
}
.logger_6, .logger_6 *{
    cursor: url(/cursors/green/pointer.cur), pointer !important;
}
.logger_7{
    flex: none;
    display: inline-flex;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow: hidden;
    margin: 0;
    margin-left: auto !important;
    font-weight: 400;
    color: #ced4da;
    text-decoration: none;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    background-color: transparent;
    border: 2px solid transparent;
    padding: .3rem .9rem;
    font-size: .875rem;
    line-height: 1.6;
    border-radius: .4rem;
    transition: all 0.15s ease-in-out;
    -webkit-appearance: button;
    text-transform: none;
}
.logger_7 svg{
    overflow: hidden;
    vertical-align: middle;
    pointer-events: none;
    width: 16px;
    height: 16px;
}
.logger_8{
    display: flex;
    align-items: center;
    padding: 5px 0 5px 25px;
    width: 100%;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.logger_9{
    padding: 4px 7px;
    width: 36px;
    height: 32px;
    background: rgba(0,0,0,0.25);
    margin-right: 12px;
}
.logger_10{
    margin-top: 3px;
    height: 14px;
    overflow: hidden;
    vertical-align: middle;
    margin-left: auto;
    margin-right: auto;
    display: block;
}
.logger_11{
    display: flex;
    flex-direction: column;
    min-width: 0;
    margin-right: auto;
    margin-bottom: 3px;
    width: 100%;
}
.logger_12{
    margin: 0;
    max-width: 183px;
    /*white-space: nowrap;*/
    text-overflow: ellipsis;
    overflow: hidden;
    display: inline-block;
}`;
        e1.appendChild(stl);
        this.logsCount = 0;
    }
    log(message) { this.create(message, 1); }
    warn(message) { this.create(message, 2); }
    error(message) { this.create(message, 3); }
    create(message, type) {
        if(type < 1 || type > 3) return;
        if(this.logsCount == 0) this.menu.style = '';
        this.logsCount++;
        const _new = document.createElement("div");
        {
            _new.className = 'logger_8';
            {
                const __new = document.createElement("div");
                __new.className = 'logger_9';
                if(type == 1) __new.innerHTML = `<yes class="logger_10 fa-solid fa-info"></yes>`;
                else if(type == 2) __new.innerHTML = `<yes class="logger_10 fa-solid fa-brake-warning"></yes>`;
                else if(type == 3) __new.innerHTML = `<yes class="logger_10 fa-solid fa-bug"></yes>`;
                _new.appendChild(__new);
            }
            {
                const __new = document.createElement("div");
                __new.className = 'logger_11';
                {
                    const ___new = document.createElement("label");
                    ___new.className = 'logger_12';
                    ___new.innerHTML = message;
                    __new.appendChild(___new);
                }
                _new.appendChild(__new);
            }
            {
                const __new = document.createElement("button");
                __new.className = 'logger_7 logger_6';
                __new.innerHTML = '<svg class="fa-times" aria-hidden="true"focusable="false" role="img" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">'+
                    '<path d="M193.94 256L296.5 153.44l21.15-21.15c3.12-3.12 3.12-8.19 0-11.31l-22.63-22.63c-3.12-3.12-8.19-3.12-11.31 0L160 222.06 36.29 98.34c-3.12-'+
                    '3.12-8.19-3.12-11.31 0L2.34 120.97c-3.12 3.12-3.12 8.19 0 11.31L126.06 256 2.34 379.71c-3.12 3.12-3.12 8.19 0 11.31l22.63 22.63c3.12 3.12 8.19 3.12 '+
                    '11.31 0L160 289.94 262.56 392.5l21.15 21.15c3.12 3.12 8.19 3.12 11.31 0l22.63-22.63c3.12-3.12 3.12-8.19 0-11.31L193.94 256z" fill="currentColor"></path></svg>';
                _new.appendChild(__new);
                __new.onclick = () => {
                    _new.outerHTML = ''
                    this.logsCount--;
                    if(this.logsCount == 0) this.menu.style.display = 'none';
                };
            }
        }
        this.menu.appendChild(_new);
    }
}