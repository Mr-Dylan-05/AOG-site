(function($) {
	$(function() {

        equalheight = function(container){
            maxheight=0;
            $(container).each(function(){
                maxheight = $(this).height() > maxheight ? $(this).height() : maxheight;
            })
            $(container).height(maxheight);
        }

		$(window).load(function() {
            equalheight('.testimonial-post .message');
		});

        $(window).resize(function(){
            equalheight('.testimonial-post .message');
        });

        <?php
        $autoplay = ($settings->autoplay_speed <> '' ? $settings->autoplay_speed : $settings->autoplay);
        $attraction = ($settings->attraction <> '' ? $settings->attraction : '1')/100;
        $friction = ($settings->friction <> '' ? $settings->friction : '15')/100;
        $cells = ($settings->testimonial_column <> '' ? $settings->testimonial_column : '1');
        ?>
        
        var options = {
            imagesLoaded: true,
            percentPosition: false,
            prevNextButtons: false,
            pageDots: false,
            autoPlay: <?php echo $autoplay; ?>,
            selectedAttraction: <?php echo $attraction; ?>, 
            friction: <?php echo $friction; ?>,
            groupCells: <?php echo $cells; ?>
        };
        
        if ( matchMedia('screen and (max-width: 480px)').matches ) {
            options.groupCells = 1;
        }
        
        $('.fl-node-<?php echo $id; ?> .carousel-main').flickity( options );
        
        $('.fl-node-<?php echo $id; ?> .carousel-nav').flickity({
            asNavFor: '.fl-node-<?php echo $id; ?> .carousel-main',
            prevNextButtons: false,
            contain: true,
            pageDots: false
        });

	});
})(jQuery);