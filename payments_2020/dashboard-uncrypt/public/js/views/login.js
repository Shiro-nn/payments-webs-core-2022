
$(document).ready(function(){

	var lv = new LoginValidator();
	var lc = new LoginController();

// main login form //

	$('#login').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (lv.validateForm() == false){
				return false;
			} 	else{
			// append 'remember-me' option to formData to write local cookie //
				formData.push({name:'remember-me', value:$('#btn_remember').find('span').hasClass('fa-check-square')});
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') window.location.href = '/';
		},
		error : function(e){
			lv.showLoginError('Ошибка входа', 'Пожалуйста, проверьте ваше имя пользователя и/или пароль');
		}
	}); 

	$("input:text:visible:first").focus();
	$('#btn_remember').click(function(){
		var span = $(this).find('span');
		if (span.hasClass('fa-minus-square')){
			span.removeClass('fa-minus-square');
			span.addClass('fa-check-square');
		}	else{
			span.addClass('fa-minus-square');
			span.removeClass('fa-check-square');
		}
	});

// login retrieval form via email //
	
	var ev = new EmailValidator();
	
	$('#get-credentials-form').ajaxForm({
		url: '/lost-password',
		beforeSubmit : function(formData, jqForm, options){
			if (ev.validateEmail($('#email-tf').val())){
				ev.hideEmailAlert();
				return true;
			}	else{
				ev.showEmailAlert("Пожалуйста, введите действительный email");
				return false;
			}
		},
		success	: function(responseText, status, xhr, $form){
			$('#cancel').html('OK');
			$('#retrieve-password-submit').hide();
			ev.showEmailSuccess("Ссылка для сброса пароля была отправлена вам по электронной почте.");
		},
		error : function(e){
			if (e.responseText == 'email-not-found'){
				ev.showEmailAlert("Электронная почта не найдена. Вы уверены, что правильно ввели?");
			}	else{
				$('#cancel').html('OK');
				$('#retrieve-password-submit').hide();
				ev.showEmailAlert("О нет! Возникла ошибка. Повторите попытку позже.");
			}
		}
	});
	
});
