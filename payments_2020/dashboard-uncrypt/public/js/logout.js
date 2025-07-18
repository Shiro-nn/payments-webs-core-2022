$('#btn-logout').click(function(){ 
    $.ajax({
        url: '/logout',
        type: 'POST',
        data: {logout : true},
        success: function(){
          location.reload();
        },
        error: function(jqXHR){
          console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
        }
    }); 
});