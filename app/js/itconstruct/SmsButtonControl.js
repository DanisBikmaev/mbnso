BX.namespace('BX.Itconstruct');
(function() {
    BX.Itconstruct.SmsButtonControl = {
        parameters: false,
        form: false,
        init: function (parameters, form) {
            this.parameters = parameters;
            this.form = form;
            this.inited = true;
            this.initControls();
        },
        initControls: function () {
            var app = this;
            
            $(app.form).on('submit', function (event) {
                //event.preventDefault();
                return false;
            });
            
            $('.js-get-sms-code', app.form).on('click', function () {
                var self = this;
                let phoneInput = $('#' + app.parameters['PHONE_INPUT']),
                    phoneNumber = phoneInput.val();
                let codeInput = $('#' + app.parameters['CODE_INPUT']),
                    code = $(codeInput).val();

                $('.buttons .alert-danger', app.form).hide();
                if ($(app.form).valid()) {
                    var request = BX.ajax.runComponentAction('itconstruct:sms.codes.controller', app.parameters['ACTION'], {
                        mode: 'class',
                        data: {
                            phone: phoneNumber,
                        }
                    }).then(function (response) {
                        if (response['data']) {
                            if (response['data']['WAIT'] && response['data']['WAIT'].length) {
                                $(codeInput).attr('aria-describedby', app.parameters['CODE_INPUT'] + '-error');
                                $(codeInput).parent().addClass('error').find('span.error').remove();
                                $(codeInput).before('<span id="' + app.parameters['CODE_INPUT'] + '-error" class="error">' + response['data']['WAIT'][0] + '</span>');
                            } else if (response['data']['WAIT']) {
                                if ($('.alert', app.form).length) {
                                    $('.alert', app.form).remove();
                                }
                                // поправить баг с отсчётом подождать
                            } else if (response['data']['SUCCESS']) {
                                if ($('.alert', app.form).length) {
                                    $('.alert', app.form).remove();
                                }
                                self.classList.add('hidden');
                                self.type = 'button';
                                $('[data-sid="' + app.parameters['CODE_INPUT_SID'] + '"]', app.form).removeClass('hidden');
                                $('.buttons__inner', app.form).removeClass('hidden');
                                $('.sms-code-check', app.form)[0].type = 'submit';
                                if (response['data']['BLOCK_BUTTON'] == 'Y') {
                                    $('.' + app.parameters['SEND_AGAIN_BUTTON_CLASS']).hide();
                                } else {
                                    initCountdown();
                                }
                            } else if (response['data']['BLOCKED']) {
                                $('.buttons', app.form).prepend('<div class="alert alert-danger">Отправка заблокирована</div>');
                            } else if (response['data']['ERRORS'] && response['data']['ERRORS'].length) {
                                $(phoneInput).attr('aria-describedby', app.parameters['PHONE_INPUT'] + '-error');
                                $(phoneInput).parent().addClass('error').find('span.error').remove();
                                if ($('.alert', app.form).length) {
                                    $('.alert', app.form).html(response['data']['ERRORS'][0]);
                                } else {
                                    if($('.form-top-anchor', app.form).length) {
                                        $('.form-top-anchor', app.form).after('<div class="alert alert-danger">' + response['data']['ERRORS'][0] + '</div>');
                                    } else {
                                        $(app.form).prepend('<div class="alert alert-danger">' + response['data']['ERRORS'][0] + '</div>');
                                    }
                                }
                                if($('.form-top-anchor', app.form).length) {
                                    if ('scrollIntoView' in document.body) {
                                        $('.form-top-anchor', app.form)[0].scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                            inline: "nearest"
                                        });
                                    } else {
                                        document.scrollingElement.scrollTop = document.scrollingElement.scrollTop + $('.form-top-anchor', app.form)[0].getBoundingClientRect().top;
                                    }
                                }
                                //$(phoneInput).before('<span id="'+app.parameters['PHONE_INPUT']+'-error" class="error">'+response['data']['ERRORS'][0]+'</span>');
                            }
                        }
                    });
                }
                
                return false;
            });

            $('.sms-code-check', app.form).on('click', function () {
                var self = this;
                let phoneInput = $('#' + app.parameters['PHONE_INPUT']),
                    phoneNumber = $(phoneInput).val();
                let codeInput = $('#' + app.parameters['CODE_INPUT']),
                    code = $(codeInput).val();
                
                if (phoneInput.valid()) {
                    if (codeInput.valid()) {
                        var request = BX.ajax.runComponentAction('itconstruct:sms.codes.controller', app.parameters['CODE_ACTION'], {
                            mode: 'class',
                            data: {
                                phone: phoneNumber,
                                code: code
                            }
                        }).then(function (response) {
                            let handlerName = app.parameters['CODE_ACTION'] + 'Handler';
                            app[handlerName](response, app);
                        });
                    }
                }

                return false;
            });

            // Запуск таймера на повторную отправку
            var sendAgainButton = $('.' + app.parameters['SEND_AGAIN_BUTTON_CLASS'], app.form),
                secondsInTimer = Number(sendAgainButton.data('seconds'));

            $(sendAgainButton).on('click', function () {
                sendAgainButton.addClass('inactive');
                initCountdown();
            });

            function initCountdown() {
                if (sendAgainButton.length && sendAgainButton.hasClass('inactive')) {
                    var timeStamp = (new Date()).getTime() + (!secondsInTimer ? app.parameters['SECONDS_IN_TIMER'] : secondsInTimer) * 1000;
                    sendAgainButton.countdown({
                        timestamp: timeStamp,
                        callback: function (minutes, seconds) {
                            if (minutes <= 0 && seconds <= 0) {
                                if (sendAgainButton.hasClass('inactive')) {
                                    sendAgainButton.removeClass('inactive').addClass('active');
                                    sendAgainButton.find('.countdownHolder').remove();
                                }
                            }
                        }
                    });
                }
            }

            $(document).off('click', '.' + app.parameters['SEND_AGAIN_BUTTON_CLASS'] + '.active');
            $(document).on('click', '.' + app.parameters['SEND_AGAIN_BUTTON_CLASS'] + '.active', function (event) {
                var sendAgainButton = $(this);
                let phoneNumber = $('#' + app.parameters['PHONE_INPUT']).val();
                $('.alert-danger', app.form).hide();
                var request = BX.ajax.runComponentAction('itconstruct:sms.codes.controller', app.parameters['ACTION'], {
                    mode: 'class',
                    data: {
                        phone: phoneNumber,
                    }
                }).then(function (response) {
                    if (response['data']['SUCCESS']) {
                        if (response['data']['BLOCK_BUTTON'] == 'Y') {
                            sendAgainButton.hide();
                        } else {
                            sendAgainButton.removeClass('active').addClass('inactive');
                            sendAgainButton = $('.js_send-sms-again.inactive');
                            var secondsInTimer = Number(sendAgainButton.data('seconds'));
                            if (!secondsInTimer) {
                                secondsInTimer = app.parameters['SECONDS_IN_TIMER'];
                            }
                            var timeStamp = (new Date()).getTime() + secondsInTimer * 1000;
                            sendAgainButton.countdown({
                                timestamp: timeStamp,
                                callback: function (minutes, seconds) {
                                    if (minutes <= 0 && seconds <= 0) {
                                        if (sendAgainButton.hasClass('inactive')) {
                                            sendAgainButton.removeClass('inactive').addClass('active');
                                            sendAgainButton.find('.countdownHolder').remove();
                                        }
                                    }
                                }
                            });
                        }
                    } else {
                        $('.buttons', app.form).prepend('<div class="alert alert-danger">У Вас закончились попытки, попробуйте, пожалуйста, снова через 30 минут.</div>');
                    }
                });
            });
        },
        processAuthCodeHandler: function (response, app) {
            let phoneInput = $('#' + app.parameters['PHONE_INPUT']),
                phoneNumber = $(phoneInput).val();
            let codeInput = $('#' + app.parameters['CODE_INPUT']),
                code = $(codeInput).val();
            
            if (response['data']['SUCCESS']) {
                window.location.reload();
            } else {
                $(codeInput).attr('aria-describedby', app.parameters['CODE_INPUT'] + '-error');
                $(codeInput).parent().addClass('error').find('span.error').remove();
                $(codeInput).before('<span id="' + app.parameters['CODE_INPUT'] + '-error" class="error">' + response['data']['ERRORS'][0] + '</span>');
            }
        },
        processForgotCodeHandler: function (response, app) {
            let phoneInput = $('#' + app.parameters['PHONE_INPUT']),
                phoneNumber = $(phoneInput).val();
            let codeInput = $('#' + app.parameters['CODE_INPUT']),
                code = $(codeInput).val();
            
            if (response['data']['SUCCESS']) {
                $('.js-form-body', app.form).html('<div class="alert alert-success">Новый пароль ушел по SMS</div>');
            } else {
                $(codeInput).attr('aria-describedby', app.parameters['CODE_INPUT'] + '-error');
                $(codeInput).parent().addClass('error').find('span.error').remove();
                $(codeInput).before('<span id="' + app.parameters['CODE_INPUT'] + '-error" class="error">' + response['data']['ERRORS'][0] + '</span>');
            }
        },
        processRegisterCodeHandler: function (response, app) {
            let phoneInput = $('#' + app.parameters['PHONE_INPUT']),
                phoneNumber = $(phoneInput).val();
            let codeInput = $('#' + app.parameters['CODE_INPUT']),
                code = $(codeInput).val();
            
            if (response['data']['SUCCESS']) {
                app.form.submit();
            } else {
                $(codeInput).attr('aria-describedby', app.parameters['CODE_INPUT'] + '-error');
                $(codeInput).parent().addClass('error').find('span.error').remove();
                $(codeInput).before('<span id="' + app.parameters['CODE_INPUT'] + '-error" class="error">' + response['data']['ERRORS'][0] + '</span>');
            }
        },
		processSaveUserCodeHandler: function (response, app) {
            let phoneInput = $('#' + app.parameters['PHONE_INPUT']),
                phoneNumber = $(phoneInput).val();
            let codeInput = $('#' + app.parameters['CODE_INPUT']),
                code = $(codeInput).val();
            
            if (response['data']['SUCCESS']) {
				app.form.unbind('submit');
				app.form.append('<input type="hidden" name="name" value="Y" />');
				app.form.append('<input type="hidden" name="apply" value="Y" />');
                app.form.submit();
            } else {
                $(codeInput).attr('aria-describedby', app.parameters['CODE_INPUT'] + '-error');
                $(codeInput).parent().addClass('error').find('span.error').remove();
                $(codeInput).before('<span id="' + app.parameters['CODE_INPUT'] + '-error" class="error">' + response['data']['ERRORS'][0] + '</span>');
            }
        }
    }
})();