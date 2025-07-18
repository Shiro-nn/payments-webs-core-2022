window.oncontextmenu = function () {
    return false;
}
document.onkeydown = function (e) { 
    if (window.event.keyCode == 123 || e.button==2)
    return false;
};
document.onkeydown = function(e) {
   if(event.keyCode == 123) {
       return false;
   }
   if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)){
       return false;
   }
   if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)){
       return false;
   }
   if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)){
       return false;
   }
   if(e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)){
       return false;
   }
   if(e.ctrlKey && e.keyCode == 'P'.charCodeAt(0)){
       return false;
   }
}
document.ondragstart = false;
document.onselectstart = false;
document.oncontextmenu = false;

function ip(){
    newopen({url: '/ip', title: 'IP сервиса', w: 900, h: 500});
}
const newopen = ({url, title, w, h}) => {
    const dualScreenLeft = window.screenLeft !==  undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !==  undefined   ? window.screenTop  : window.screenY;

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft
    const top = (height - h) / 2 / systemZoom + dualScreenTop
    const newWindow = window.open(url, title, 
      `
      scrollbars=yes,
      width=${w / systemZoom}, 
      height=${h / systemZoom}, 
      top=${top}, 
      left=${left}
      `
    )

    if (window.focus) newWindow.focus();
}