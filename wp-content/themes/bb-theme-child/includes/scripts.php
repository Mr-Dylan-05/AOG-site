<script type="text/javascript">
(function($) {
    console.log('access')
    equalheight = function(container){
        maxheight=0;
        var viewportWidth = $(window).outerWidth();
        if (viewportWidth > 768) {
            $(container).each(function(){
                maxheight = $(this).height() > maxheight ? $(this).height() : maxheight;
            })
            $(container).height(maxheight);
        } else {
            $(container).css('height','auto');
        }
    }

    $(window).load(function() {
        equalheight('.fl-col .stimulus-benefits');
    });

    $(window).resize(function(){
        equalheight('.fl-col .stimulus-benefits');
    });

    $(window).on('load', function() {
        var btn = $('.cta-enquire-btn a.fl-button');
        var h2 = $('.aog-product-title h2');

        $.each(btn, function(index, value) {
            $(this).click(function(){
                var i = index; 
                $.each(h2, function(index, value) {
                    if(i == index) {
                        var productType = $(this).text();

                        productType = productType.toLowerCase();

                        $('.popform-container-overlay form select option').each(function(){
                            var optionValue = $(this).attr('value');
                            optionValue = optionValue.toLowerCase();

                            if(productType === optionValue || productType == optionValue){
                                $('.popform-container-overlay form select option').removeAttr('selected');
                                $(this).attr('selected','selected');
                            }
                        });
                    }
                });
            });
        });
	});


    setInterval(function(){
        var seeIfExist = $('.popform-container-overlay #caldera_notices_1 > div').length;
        
        if( $('.popform-container-overlay > div.uabb-modal').hasClass('uabb-show') ){
            if( seeIfExist !== 0 || seeIfExist != 0 ){
                if ( $('.popform-container-overlay #caldera_notices_1 > div').hasClass('alert-success') ){
                    $('.popform-container-overlay form#CF5ceb6616634cc_1').addClass('hide');
                }
            }
        }
        else{
            $('.popform-container-overlay #caldera_notices_1 > div').remove();
            $('.popform-container-overlay form#CF5ceb6616634cc_1').removeClass('hide');
            
        }
    });

    var formCount = 1;
	$(window).on('cf.form.init', function(event, data) {
        $('.'+data.formId).each(function() {
            $('.form-group:not(.upload-field):not(.radio-field-group)', this).each(function() {
                if( $(this).find('.intl-tel-input').length === 0 ){
                    var tempInput = $('label',this).next('div').children().first().clone();
                    $('label',this).next('div').remove();

                    $(this).append(tempInput);
                }
                else{
                    if( $('.intl-tel-input', this).find('input').length > 0 ){
                        $(this).find('input').appendTo( $(this) );
                    }
                }

                var tempSubmit = $(this).find('.btn.btn-default').clone();
                $('.btn.btn-default',this).remove();
                $(this).append(tempSubmit);

                $('label',this).appendTo($(this));
                $('.form-control, label', this).wrapAll( "<div class='form-group-wrapper' />");

            });

            $('.form-group:not(.upload-field):not(.radio-field-group)', this).each(function() {

                if($('.form-control',this).val() !== ''){
                    $(this).addClass("input--filled");
                } 

                if( $(this).find('.intl-tel-input').length === 0 ){
                    if( $('select',this).length !== 0 ){
                        $('.form-control',this).click(function(){

                            if($(this).val() !== ''){
                                $(this).closest('.form-group').addClass("input--filled");
                            } else{
                                $(this).closest('.form-group').removeClass("input--filled");
                            }

                        });
                    }
                    else{
                        $('.form-control',this).keyup(function(){

                            if($(this).val() !== ''){
                                $(this).closest('.form-group').addClass("input--filled");
                            } else{
                                $(this).closest('.form-group').removeClass("input--filled");
                            }

                        });
                    }

                }
                else{
                    $(this).addClass("input--filled");
                }
            });
        });
        
        $('.caldera-grid form').css('opacity', '1');
        
        formCount++;
    });
})(jQuery);
</script>