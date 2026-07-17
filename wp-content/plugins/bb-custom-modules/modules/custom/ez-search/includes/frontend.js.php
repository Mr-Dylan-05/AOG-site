<?php ?>
(function($) {
	$(function() {
        /*search toggle*/
        if ($('#header-search').length ) {
            var htmlClick = true;
            $('#header-search > button').click(function(){ 
                if ($('#header-search').hasClass('toggled')) {
                    $('#header-search').removeClass('toggled');
                } else {
                    $('#header-search').addClass('toggled');
                }
                setTimeout(function(){
                    $('#search-box-input').focus();
                    $('#search-box-submit').attr('disabled', true);
                    function validateValue() {
                        if($('#search-box-input').val().length !=0) {
                            $('#search-box-submit').attr('disabled', false);
                        } else {
                            $('#search-box-submit').attr('disabled',true);
                        }
                    }
                    validateValue();
                    $('#search-box-input').keyup(function(){
                        validateValue();
                    })
                }, 100);
                htmlClick = false;
            });
            $('#header-search').click(function(){ 
                htmlClick = false;
            });
            $("html").click(function () {
                if ( htmlClick ) {
                    $('#header-search').removeClass('toggled');
                }
                htmlClick = true;
            });
        }
    });
})(jQuery);