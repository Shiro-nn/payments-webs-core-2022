window.oncontextmenu = function () {
  return false;
}
document.onkeydown = function(e) {
  if(window.event.keyCode == 123) {
    return false;
  }
  if(e.button == 2) {
    return false;
  }
  if(e.ctrlKey && e.shiftKey && window.event.keyCode == 'I'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && e.shiftKey && window.event.keyCode == 'J'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && e.shiftKey && window.event.keyCode == 'C'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && e.shiftKey && window.event.keyCode == 'M'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && window.event.keyCode == 'U'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && window.event.keyCode == 'S'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && window.event.keyCode == 'P'.charCodeAt(0)){
    return false;
  }
}
window.addEventListener("load", function(ev) {try{document.getElementById("wm-ipp-base").outerHTML = ''}catch{}});
document.ondragstart = () => {return false};
document.oncontextmenu = () => {return false};
document.oncut = () => {return false};
document.ondrop = () => {return false};