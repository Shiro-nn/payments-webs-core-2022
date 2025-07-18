
$(document).ready(function () {
    setTimeout(() => {
        $('.content-page').fadeOut(1000);
        setTimeout(() => {
            $('.container').fadeIn(1000);
        }, 1000);
    }, 2000);
    var clk = 0;
    setInterval(() => {
        clk++;
        if(clk === 1){
            $('.ps_logo_full_visa').fadeOut(1000);
            setTimeout(() => {
                $('.ps_logo_full_mastercard').fadeIn(1000);
            }, 1000);
        }else if(clk === 2){
            $('.ps_logo_full_mastercard').fadeOut(1000);
            setTimeout(() => {
                $('.ps_logo_full_maestro').fadeIn(1000);
            }, 1000);
        }else if(clk === 3){
            $('.ps_logo_full_maestro').fadeOut(1000);
            setTimeout(() => {
                $('.ps_logo_full_mir').fadeIn(1000);
            }, 1000);
        }else if(clk === 4){
            $('.ps_logo_full_mir').fadeOut(1000);
            setTimeout(() => {
                $('.ps_logo_full_visa').fadeIn(1000);
            }, 1000);
            clk = 0;
        }
    }, 5000);
});