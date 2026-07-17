(function($) {
	$(function() {

        if (window.matchMedia("(max-width: 480px)").matches) {
            $('.tooltips').each( function() {
                $(this).on('click', function(e){
                    $(this).next('.tooltip-content').css({
                        left:  '50%',
                        top:   '50%',
                        width: '80vw',
                        transform: 'translate(-50%, -50%)',
                    });
                });
            });
        } else {
            $('.tooltips').each( function() {
                $(this).bind('mousemove', function(e){
                    if (e.offsetX < ($(this).width()/2)) {
                        $(this).next('.tooltip-content').css({
                           left:  (e.offsetX + 40) + ($(this).offset().left - $('.donut-button').offset().left),
                           top:   (e.offsetY + 40) + ($(this).offset().top - $('.donut-button').offset().top),
                           right: 'unset',
                        });
                    } else {
                        $(this).next('.tooltip-content').css({
                            top:   (e.offsetY + 40) + ($(this).offset().top - $('.donut-button').offset().top), 
                            right: (($(this).width() - e.offsetX) + 40) + ($(this).offset().left - $('.donut-button').offset().left), 
                            left:  'unset'
                        });
                    }
                });
            });
        }

	});
})(jQuery);