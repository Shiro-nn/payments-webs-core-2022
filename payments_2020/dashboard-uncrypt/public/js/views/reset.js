
$(document).ready(function(){
	
	var rv = new ResetValidator();
	
	$('#set-password-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){;
			rv.hideAlert();
			if (rv.validatePassword($('#pass-tf').val()) == false){
				return false;
			} 	else{
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			$('#set-password-submit').addClass('disabled');
			$('#set-password-submit').prop('disabled', true);
			rv.showSuccess("Ваш пароль был сброшен.");
			setTimeout(function(){ window.location.href = '/'; }, 3000);
		},
		error : function(){
			rv.showAlert("Извините, что-то пошло не так, попробуйте еще раз.");
		}
	});

	$('#set-password').modal('show');
	$('#set-password').on('shown', function(){ $('#pass-tf').focus(); })

});