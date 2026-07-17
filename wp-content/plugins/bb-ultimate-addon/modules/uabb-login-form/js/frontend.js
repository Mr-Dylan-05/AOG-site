(function ($) {

	var is_google_button_clicked = false;
	var ajaxurl = '';
	var uabb_lf_dashboard_url = '';
	var uabb_lf_google_redirect_login_url = '';
	var uabb_lf_facebook_redirect_login_url = '';
	var uabb_facebook_app_id = '';
	var uabb_social_google_client_id = '';
	var uabb_lf_nonce = '';

	// Global reCAPTCHA callback function for Login Form
	window.onLoadUABBLoginReCaptcha = function() {
		var reCaptchaFields = $( '.uabb-lf-grecaptcha' ),
			widgetID;
		if ( reCaptchaFields.length > 0 ) {
			reCaptchaFields.each(function(){
				var self 		= $( this ),
				 	attrWidget 	= self.attr('data-widgetid'),
					sitekey     = self.data('sitekey'),
					theme       = self.data('theme');


				// Avoid re-rendering as it's throwing API error
				if ( (typeof attrWidget !== typeof undefined && attrWidget !== false) ) {
					return;
				}
				else {
					try {
						widgetID = grecaptcha.render( self.attr('id'), { 
							sitekey : sitekey,
							theme: theme,
							callback: function( response ) {
							 	if ( response != '' ) {
							 		self.attr( 'data-uabb-lf-grecaptcha-response', response );
							 	}
							}
						});
						self.attr( 'data-widgetid', widgetID );
					} catch (error) {
						console.error(error);
					}
				}
			});
		}
	};

	UABBLoginForm = function (settings) {


		this.settings = settings;
		this.nodeClass = '.fl-node-' + settings.id;
		this.uabb_lf_ajaxurl = settings.uabb_lf_ajaxurl;
		node_module = $('.fl-node-' + settings.id);
		this.uabb_lf_wp_form_redirect_toggle = settings.uabb_lf_wp_form_redirect_toggle;
		this.uabb_lf_wp_form_redirect_login_url = settings.uabb_lf_wp_form_redirect_login_url;
		this.uabb_lf_dashboard_url = settings.uabb_lf_dashboard_url;
		this.uabb_lf_google_redirect_url = settings.uabb_lf_google_redirect_url;
		this.uabb_lf_facebook_redirect_url = settings.uabb_lf_facebook_redirect_url;
		this.uabb_social_facebook_app_id = settings.uabb_social_facebook_app_id;
		this.uabb_social_google_client_id = settings.uabb_social_google_client_id;
		this.google_login_select = settings.google_login_select;
		this.facebook_login_select = settings.facebook_login_select;
		this.uabb_lf_nonce = node_module.find('.uabb-lf-form-wrap').data('nonce');
		this.uabb_lf_username_empty_err_msg = settings.uabb_lf_username_empty_err_msg;
		this.uabb_lf_password_empty_err_msg = settings.uabb_lf_password_empty_err_msg;
		this.uabb_lf_both_empty_err_msg = settings.uabb_lf_both_empty_err_msg;
		this.uabb_lf_username_invalid_err_msg = settings.uabb_lf_username_invalid_err_msg;
		this.uabb_lf_password_invalid_err_msg = settings.uabb_lf_password_invalid_err_msg;
		// reCAPTCHA settings
		this.recaptcha_toggle = settings.recaptcha_toggle;
		this.recaptcha_version = settings.recaptcha_version;
		this.recaptcha_site_key_v2 = settings.recaptcha_site_key_v2;
		this.recaptcha_site_key_v3 = settings.recaptcha_site_key_v3;
		this.recaptcha_theme = settings.recaptcha_theme;
		this.recaptcha_score = settings.recaptcha_score;
		this.badge_position = settings.badge_position;
		this.username = $(this.nodeClass + ' .uabb-lf-login-form').find('.uabb-lf-username');
		this.password = $(this.nodeClass + ' .uabb-lf-login-form').find('.uabb-lf-password');
		this.rememberme = $(this.nodeClass + ' .uabb-lf-login-form').find('.uabb-lf-remember-me-checkbox');
		this.errormessage = $(this.nodeClass + ' .uabb-lf-form-wrap').find('.uabb-lf-error-message');
		this.errormessagewrap = $(this.nodeClass + ' .uabb-lf-form-wrap').find('.uabb-lf-error-message-wrap');
		uabb_lf_dashboard_url = this.uabb_lf_dashboard_url;
		ajaxurl = this.uabb_lf_ajaxurl;
		uabb_lf_google_redirect_login_url = this.uabb_lf_google_redirect_url;
		uabb_lf_facebook_redirect_login_url = this.uabb_lf_facebook_redirect_url;
		uabb_facebook_app_id = this.uabb_social_facebook_app_id;
		uabb_social_google_client_id = this.uabb_social_google_client_id;
		uabb_lf_nonce = this.uabb_lf_nonce;
		button_text = node_module.find('.uabb-login-form-button-text');
		form_wrap = node_module.find('.uabb-lf-login-form');
		this._init();

	}
	window.handleCredentialResponse = (response) => {

		var google_data = {
			'clientId': response.clientId,
			'id_token': response.credential,
		};
		var data = {
			'action': 'uabb-lf-google-submit',
			'nonce': uabb_lf_nonce,
			'data': google_data,
		};
		$.post(ajaxurl, data, function (response) {

			google_button_text = node_module.find('.uabb-google-text');

			google_button_text.find('.uabb-login-form-loader').remove();
			
			if ( response && response.success ) {
				// Redirect to the dashboard if login is successful
				if ( typeof uabb_lf_google_redirect_login_url === 'undefined' ) {
					location.reload();
				} else {
					$(location).attr('href', uabb_lf_google_redirect_login_url);
				}
			} else {
			    // Handle error case
				var errorMessage = response && response.data && response.data.error ? response.data.error : 'An error occurred during login.';
				is_google_button_clicked = false;
			}

		});
	}

	UABBLoginForm.prototype = {



		_init: function () {
			var nodeClass = this.nodeClass;
			$(".toggle-password").click(function () {
				$(this).toggleClass("fa-eye fa-eye-slash");
				var input = $($(this).attr("toggle"));
				if (input.attr("type") == "password") {
					input.attr("type", "text");
				} else {
					input.attr("type", "password");
				}
			});

			$(nodeClass + ' .uabb-google-login').click($.proxy(this._googleClick, this));
			$(nodeClass + ' .uabb-lf-submit-button').click($.proxy(this._submit, this));
			$(nodeClass + ' .uabb-facebook-content-wrapper').click($.proxy(this._fbClick, this));

			// Initialize reCAPTCHA v3 if enabled
			if ( 'show' === this.recaptcha_toggle && 'v3' === this.recaptcha_version ) {
				var reCaptchaField = $(nodeClass + '-uabb-lf-grecaptcha');
				if ( reCaptchaField.length > 0 ) {
					var self = this;
					grecaptcha.ready( function () {
						var recaptcha_id = reCaptchaField.attr( 'data-widgetid' );
						if ( recaptcha_id ) {
							grecaptcha.execute( recaptcha_id, { action: 'LoginForm' } );
						}
					});
				}
			}

			// Accessibility for Checkbox - Remember me.
            const $scope = jQuery(".uabb-lf-form-wrap"); 
			const inputs = $scope.find(".uabb-lf-remember-me-checkbox");

			inputs.each(function () {
				const input = jQuery(this);

				input.on("focus", function () {
					const label = jQuery(`label[for="${this.id}"]`);
					if (label.length) {
						label.addClass("uabb-checkbox-focus");
					}
				});

				input.on("blur", function () {
					const label = jQuery(`label[for="${this.id}"]`);
					if (label.length) {
						label.removeClass("uabb-checkbox-focus");
					}
				});

			});

			/**
			 * Login with Facebook.
			 *
			 */
			window.fbAsyncInit = function () {
				// FB JavaScript SDK configuration and setup.
				FB.init({
					appId: uabb_facebook_app_id, // FB App ID.
					cookie: true,  // enable cookies to allow the server to access the session.
					xfbml: true,  // parse social plugins on this page.
					version: 'v2.8' // use graph api version 2.8.
				});
			};
			if ('yes' === this.facebook_login_select) {
				// Load the JavaScript SDK asynchronously.
				(function (d, s, id) {
					var js, fjs = d.getElementsByTagName(s)[0];
					if (d.getElementById(id)) {
						return;
					}
					js = d.createElement(s);
					js.id = id;
					js.src = '//connect.facebook.net/en_US/sdk.js';
					fjs.parentNode.insertBefore(js, fjs);
				}(document, 'script', 'facebook-jssdk'));
			}

		},
		_fbClick: function () {
			FB.login(function (response) {

				fb_button_text = node_module.find('.uabb-facebook-text');

				form_wrap.animate({
					opacity: '0.45'
				}, 500).addClass('uabb-form-waiting');

				fb_button_text.append('<span class="uabb-login-form-loader"></span>');

				if (response.status === 'connected') {
					FB.api('/me', { fields: 'id, email, name , first_name, last_name,link, gender, locale, picture' },
						function (response) {

							var access_token = FB.getAuthResponse()['accessToken'];
							var userID = FB.getAuthResponse()['userID'];

							var fb_data = {
								'action': 'uabb-lf-facebook-submit',
								'userID': userID,
								'name': response.name,
								'first_name': response.first_name,
								'last_name': response.last_name,
								'email': response.email,
								'link': response.link,
								'nonce': uabb_lf_nonce,
								'security_string': access_token,
							};

							$.post(ajaxurl, fb_data, function (response) {

								fb_button_text.find('.uabb-login-form-loader').remove();

								$(location).attr('href', uabb_lf_facebook_redirect_login_url);

							});
						});

				}
			}, {
				scope: 'email',
				return_scopes: true
			});
		},
		_googleClick: function () {
			google_button_text = node_module.find('.uabb-google-text');

			is_google_button_clicked = true;

			form_wrap.animate({
				opacity: '0.45'
			}, 500).addClass('uabb-form-waiting');

			google_button_text.append('<span class="uabb-login-form-loader"></span>');
		},
		_submit: function (event) {
			event.preventDefault();
			
			var self = this,
				username = self.username.val(),
				password = self.password.val(),
				nodeClass = self.nodeClass,
				node_module = $(nodeClass),
				theForm = node_module.find('.uabb-lf-login-form'),
				post_id = theForm.closest( '.fl-builder-content' ).data( 'post-id' ),
				template_id = theForm.data( 'template-id' ),
				template_node_id = theForm.data( 'template-node-id' ),
				node_id = theForm.closest( '.fl-module' ).data( 'node' ),
				honeypot_field = node_module.find( 'input[name=uabb-lf-honeypot]' ),
				reCaptchaField = node_module.find('.uabb-lf-grecaptcha'),
				reCaptchaValue = reCaptchaField.data( 'uabb-lf-grecaptcha-response' );

			// Clear previous error messages
			self.errormessagewrap.css("display", "none");
			node_module.find('.uabb-lf-recaptcha-error').hide();

			if ('' === username) {
				self.errormessagewrap.css("display", "inline-block");
				self.errormessage.text(self.uabb_lf_username_empty_err_msg);
				return false;
			}
			if ('' === password) {
				self.errormessagewrap.css("display", "inline-block");
				self.errormessage.text(self.uabb_lf_password_empty_err_msg);
				return false;
			}
			if ('' === username && '' === password) {
				self.errormessagewrap.css("display", "inline-block");
				self.errormessage.text(self.uabb_lf_both_empty_err_msg);
				return false;
			}

			// Validate reCAPTCHA if enabled
			if ( 'show' === self.recaptcha_toggle && 'v2' === self.recaptcha_version ) {
				if ( 'undefined' === typeof reCaptchaValue || reCaptchaValue === false || reCaptchaValue === '' ) {
					node_module.find('.uabb-lf-recaptcha-error').show();
					return false;
				}
			}

			if ('' !== username && '' !== password) {

				var data = {
					'action': 'uabb-lf-form-submit',
					'username': username,
					'password': password,
					'rememberme': self.rememberme.val(),
					'nonce': self.uabb_lf_nonce,
					'node_id': node_id,
					'post_id': post_id,
					'template_id': template_id,
					'template_node_id': template_node_id
				};

				// Add honeypot field value
				if ( honeypot_field.length > 0 ) {
					data.honeypot = honeypot_field.val();
				}

				// Add reCAPTCHA response
				if ( 'show' === self.recaptcha_toggle ) {
					if ( 'v3' === self.recaptcha_version ) {
						// For v3, execute reCAPTCHA and get response
						if ( reCaptchaField.length > 0 ) {
							var recaptcha_id = reCaptchaField.attr( 'data-widgetid' );
							if ( recaptcha_id ) {
								grecaptcha.ready( function() {
									grecaptcha.execute( recaptcha_id, { action: 'LoginForm' } ).then( function( token ) {
										data.recaptcha_response = token;
										self._performSubmit( data );
									});
								});
								return;
							}
						}
					} else {
						// For v2, use the stored response
						data.recaptcha_response = reCaptchaValue;
					}
				}

				self._performSubmit( data );
			}
		},

		_performSubmit: function( data ) {
			var self = this;
			
			form_wrap.animate({
				opacity: '0.45'
			}, 500).addClass('uabb-form-waiting');

			button_text.append('<span class="uabb-login-form-loader"></span>');

			$.post(self.uabb_lf_ajaxurl, data, $.proxy(this._submitComplete, this))
				.fail(function(xhr, status, error) {
					console.error('UABB Login Form - AJAX request failed:', {
						status: status,
						error: error,
						responseText: xhr.responseText
					});
				});
		},
		_submitComplete: function (response) {
			var self = this;
			var nodeClass = self.nodeClass;
			var node_module = $(nodeClass);
			
			button_text.find('.uabb-login-form-loader').remove();

			form_wrap.animate({
				opacity: '1'
			}, 100).removeClass('uabb-form-waiting');

			if (true === response.success) {

				if ('default' === self.uabb_lf_wp_form_redirect_toggle) {
					$(location).attr('href', self.uabb_lf_dashboard_url);
				} else if ('custom' === self.uabb_lf_wp_form_redirect_toggle) {
					$(location).attr('href', self.uabb_lf_wp_form_redirect_login_url);
				}
			} else if (false === response.success) {
				// Handle different types of errors
				var errorMessage = response.data;
				
				
				if ( 'Incorrect Password' === errorMessage ) {
					self.errormessagewrap.css("display", "inline-block");
					self.errormessage.text(self.uabb_lf_password_invalid_err_msg);
				} else if ( 'Incorrect Username' === errorMessage ) {
					self.errormessagewrap.css("display", "inline-block");
					self.errormessage.text(self.uabb_lf_username_invalid_err_msg);
				} else if ( errorMessage && errorMessage.indexOf('reCAPTCHA') !== -1 ) {
					// reCAPTCHA error
					node_module.find('.uabb-lf-recaptcha-error').text(errorMessage).show();
					
					// Reset reCAPTCHA if v2
					if ( 'v2' === self.recaptcha_version ) {
						var reCaptchaField = node_module.find('.uabb-lf-grecaptcha');
						if ( reCaptchaField.length > 0 ) {
							var recaptcha_id = reCaptchaField.attr( 'data-widgetid' );
							if ( recaptcha_id ) {
								try {
									grecaptcha.reset( recaptcha_id );
									reCaptchaField.removeAttr( 'data-uabb-lf-grecaptcha-response' );
								} catch (error) {
									console.error('UABB Login Form - Error resetting reCAPTCHA widget:', error);
								}
							}
						}
					}
				} else if ( 'Spam detected' === errorMessage ) {
					self.errormessagewrap.css("display", "inline-block");
					self.errormessage.text('Security validation failed. Please try again.');
				} else {
					// Generic error
					self.errormessagewrap.css("display", "inline-block");
					self.errormessage.text(errorMessage || 'An error occurred. Please try again.');
				}
			}
		},
	}
	
})(jQuery);


