var bool = false;
$('#closeplsp').click(function(){
    if(bool) return;
    $('.justify-content-center').fadeIn(0);
    $('#premiumdiv').fadeOut(0);
});
$('#premiumbutton').click(function(){ 
    if(bool) return;
	$('.justify-content-center').fadeOut(0);
    $('#premiumdiv').fadeIn(0);
    $('#premiumdiv .justify-content-center').fadeIn(0);
});
$('#premiumrules').click(function(){ 
    if(bool) return;
    $('#prules').fadeIn(500);
    $('#pinfo').fadeOut(0);
});
$('#premiuminfo').click(function(){ 
    if(bool) return;
    $('#pinfo').fadeIn(500);
    $('#prules').fadeOut(0);
});
$('#pinfoclose').click(function(){ 
    if(bool) return;
    $('#pinfo').fadeOut(500);
});
$('#prulesclose').click(function(){ 
    if(bool) return;
    $('#prules').fadeOut(500);
});
$('#buypremium').click(function(){ 
    if(bool) return;
    $.ajax({
        url: '/donate/premium',
        type: 'POST'
    });
    $('#antiblur').fadeIn(500);
    waittwo();
    wait();
});






$('#closeplsv').click(function(){
    if(bool) return;
    $('.justify-content-center').fadeIn(0);
    $('#vipdiv').fadeOut(0);
});
$('#vipbutton').click(function(){ 
    if(bool) return;
	$('.justify-content-center').fadeOut(0);
    $('#vipdiv').fadeIn(0);
    $('#vipdiv .justify-content-center').fadeIn(0);
});
$('#viprules').click(function(){ 
    if(bool) return;
    $('#vrules').fadeIn(500);
    $('#vinfo').fadeOut(0);
});
$('#vipinfo').click(function(){ 
    if(bool) return;
    $('#vinfo').fadeIn(500);
    $('#vrules').fadeOut(0);
});
$('#vinfoclose').click(function(){ 
    if(bool) return;
    $('#vinfo').fadeOut(500);
});
$('#vrulesclose').click(function(){ 
    if(bool) return;
    $('#vrules').fadeOut(500);
});
$('#buyvip').click(function(){ 
    if(bool) return;
    $.ajax({
        url: '/donate/vip',
        type: 'POST'
    });
    $('#antiblur').fadeIn(500);
    waittwo();
    wait();
});






$('#closeplsvp').click(function(){
    if(bool) return;
    $('.justify-content-center').fadeIn(0);
    $('#viplusdiv').fadeOut(0);
});
$('#viplusbutton').click(function(){ 
    if(bool) return;
	$('.justify-content-center').fadeOut(0);
    $('#viplusdiv').fadeIn(0);
    $('#viplusdiv .justify-content-center').fadeIn(0);
});
$('#viplusrules').click(function(){ 
    if(bool) return;
    $('#vprules').fadeIn(500);
    $('#vpinfo').fadeOut(0);
});
$('#viplusinfo').click(function(){ 
    if(bool) return;
    $('#vpinfo').fadeIn(500);
    $('#vprules').fadeOut(0);
});
$('#vpinfoclose').click(function(){ 
    if(bool) return;
    $('#vpinfo').fadeOut(500);
});
$('#vprulesclose').click(function(){ 
    if(bool) return;
    $('#vprules').fadeOut(500);
});
$('#buyviplus').click(function(){ 
    if(bool) return;
    $.ajax({
        url: '/donate/vipplus',
        type: 'POST'
    });
    $('#antiblur').fadeIn(500);
    waittwo();
    wait();
});






$('#closeplse').click(function(){
    if(bool) return;
    $('.justify-content-center').fadeIn(0);
    $('#elitediv').fadeOut(0);
});
$('#elitebutton').click(function(){ 
    if(bool) return;
	$('.justify-content-center').fadeOut(0);
    $('#elitediv').fadeIn(0);
    $('#elitediv .justify-content-center').fadeIn(0);
});
$('#eliterules').click(function(){ 
    if(bool) return;
    $('#erules').fadeIn(500);
    $('#einfo').fadeOut(0);
});
$('#eliteinfo').click(function(){ 
    if(bool) return;
    $('#einfo').fadeIn(500);
    $('#erules').fadeOut(0);
});
$('#einfoclose').click(function(){ 
    if(bool) return;
    $('#einfo').fadeOut(500);
});
$('#erulesclose').click(function(){ 
    if(bool) return;
    $('#erules').fadeOut(500);
});
$('#buyelite').click(function(){ 
    if(bool) return;
    $.ajax({
        url: '/donate/elite',
        type: 'POST'
    });
    $('#antiblur').fadeIn(500);
    waittwo();
    wait();
});






$('#closeplsr').click(function(){
    if(bool) return;
    $('.justify-content-center').fadeIn(0);
    $('#rainbowdiv').fadeOut(0);
});
$('#rainbowbutton').click(function(){ 
    if(bool) return;
	$('.justify-content-center').fadeOut(0);
    $('#rainbowdiv').fadeIn(0);
    $('#rainbowdiv .justify-content-center').fadeIn(0);
});
$('#rainbowinfo').click(function(){ 
    if(bool) return;
    $('#rinfo').fadeIn(500);
    $('#rrules').fadeOut(0);
});
$('#rinfoclose').click(function(){ 
    if(bool) return;
    $('#rinfo').fadeOut(500);
});
$('#buyrainbow').click(function(){ 
    if(bool) return;
    $.ajax({
        url: '/donate/rainbow',
        type: 'POST'
    });
    $('#antiblur').fadeIn(500);
    waittwo();
    wait();
});

function waittwo() {
    bool = true;
    $('.navbar-custom').fadeOut(500);
    $(".blurstyle").append(`
    <link href="/css/loader.css" rel="stylesheet">
    <style>
    .loader {
        width : $size;
        height: $size;
        border-radius: 50%;
        display: inline-block;
        position: relative;
        border: 3px solid;
        border-color: $lite $lite transparent transparent;
        animation: rotation 1s linear infinite;
        &:after , &:before{
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          border: 3px solid;
          border-color: transparent transparent $brand $brand;
          width:  $size - 8px;
          height:  $size - 8px;
          border-radius: 50%;
          animation: rotationBack 0.5s linear infinite;
          transform-origin: center center;
        }
        &:before{
          width:  $size - 16px;
          height:  $size - 16px;
          border-color:$lite $lite transparent transparent;
           animation: rotation 1.5s linear infinite;
        }
    }
    .modal-body {
        filter: blur(2px);
    }
    #antiblur #antiblur * {
        filter: blur(0px);
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    body {
        overflow: hidden;
    }
    </style>`);
};
function wait() {
    setTimeout(redirect, 5000);
};
function redirect() {
    window.location.href = "/settings";
    setTimeout(console.log('Поздравляю с покупкой🎉'), 1000);
};
$(document).ready(function () {
    $.ajaxForm({
        success	: function(responseText, status, xhr, $form){
            if (status == 'success') window.location.href = '/settings';
        }
    });
});