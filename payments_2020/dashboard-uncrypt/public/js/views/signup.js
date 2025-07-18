
$(document).ready(function(){
	
	var av = new AccountValidator();
	var sc = new SignupController();
	
	$('#account-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			return av.validateForm();
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') $('.modal-alert').modal('show');
		},
		error : function(e){
			if (e.responseText == 'email-taken'){
				av.showInvalidEmail();
			}	else if (e.responseText == 'username-taken'){
				av.showInvalidUserName();
			}
		}
	});
	$('#name-tf').focus();
	
	
	$('#account-form h2').text('Регистрация');
	$('#account-form-btn1').html('Отмена');
	$('#account-form-btn2').html('Регистрация');
	$('#account-form-btn2').addClass('btn-primary');
	

	$('.modal-alert').modal({ show:false, keyboard : false, backdrop : 'static' });
	$('.modal-alert .modal-header h4').text('Аккаунт создан!');
	$('.modal-alert .modal-body p').html('Ваш аккаунт был создан.</br>Нажмите OK, чтобы вернуться на страницу входа.');

});