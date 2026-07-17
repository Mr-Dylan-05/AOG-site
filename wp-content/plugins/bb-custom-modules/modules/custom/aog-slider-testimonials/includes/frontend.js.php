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
            equalheight('.testimonial-post .equalHeight');
		});

        $(window).resize(function(){
            equalheight('.testimonial-post .equalHeight');
        });

        <?php
        $autoplay = ($settings->autoplay_speed <> '' ? $settings->autoplay_speed : $settings->autoplay);
        $attraction = ($settings->attraction <> '' ? $settings->attraction : '1')/100;
        $friction = ($settings->friction <> '' ? $settings->friction : '15')/100;
        $cells = ($settings->testimonial_column <> '' ? $settings->testimonial_column : '1');
        $nav = ($settings->nav_arrows <> '' ? $settings->nav_arrows : 'false');
        $dots = ($settings->nav_dots <> '' ? $settings->nav_dots : 'false');
        ?>
        
        var options = {
            imagesLoaded: true,
            percentPosition: false,
            prevNextButtons: <?php echo $nav; ?>,
            pageDots: <?php echo $dots; ?>,
            wrapAround: true,
            autoPlay: <?php echo $autoplay; ?>,
            selectedAttraction: <?php echo $attraction; ?>, 
            friction: <?php echo $friction; ?>,
            groupCells: <?php echo $cells; ?>,
            
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