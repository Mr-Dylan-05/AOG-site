(function($) {
	$(function() {

        <?php
        $autoplay = ($settings->autoplay_speed <> '' ? $settings->autoplay_speed : $settings->autoplay);
        $attraction = ($settings->attraction <> '' ? $settings->attraction : '1')/100;
        $friction = ($settings->friction <> '' ? $settings->friction : '15')/100;
        $adaptiveHeight = ($settings->adaptive_height <> '' ? $settings->adaptive_height : 'true');
        $cells = ($settings->nav_slider_column <> '' ? $settings->nav_slider_column : '3');
        ?>

        $(window).load(function() {
            var viewportWidth = $(window).width();
            if (viewportWidth > 991) {
                <?php $cells = ($settings->nav_slider_column_mobile <> '' ? $settings->nav_slider_column_mobile : '3'); ?>
            }
            if (viewportWidth <= 991) {
                <?php $cells = ($settings->nav_slider_column_tablet <> '' ? $settings->nav_slider_column_tablet : '3'); ?>
            }
            if (viewportWidth < 480) {
                <?php $cells = ($settings->nav_slider_column_mobile <> '' ? $settings->nav_slider_column_mobile : '3'); ?>
            }
		});

        $(window).resize(function(){
            var viewportWidth = $(window).width();
            if (viewportWidth > 991) {
                <?php $cells = ($settings->nav_slider_column_mobile <> '' ? $settings->nav_slider_column_mobile : '3'); ?>
            }
            if (viewportWidth <= 991) {
                <?php $cells = ($settings->nav_slider_column_tablet <> '' ? $settings->nav_slider_column_tablet : '3'); ?>
            }
            if (viewportWidth < 480) {
                <?php $cells = ($settings->nav_slider_column_mobile <> '' ? $settings->nav_slider_column_mobile : '3'); ?>
            }
        });
        
        var $carousel = $('.fl-node-<?php echo $id; ?> .carousel-main').flickity({
            imagesLoaded: true,
            percentPosition: false,
            prevNextButtons: false,
            pageDots: true,
            autoPlay: <?php echo $autoplay; ?>,
            selectedAttraction: <?php echo $attraction; ?>, 
            friction: <?php echo $friction; ?>,
            adaptiveHeight: <?php echo $adaptiveHeight; ?>,
        });

        var $imgs = $carousel.find('.carousel-cell img');
        // get transform property
        var docStyle = document.documentElement.style;
        var transformProp = typeof docStyle.transform == 'string' ?
          'transform' : 'WebkitTransform';
        // get Flickity instance
        var flkty = $carousel.data('flickity');

        $carousel.on( 'scroll.flickity', function() {
          flkty.slides.forEach( function( slide, i ) {
            var img = $imgs[i];
            var x = ( slide.target + flkty.x ) * -1/3;
            img.style[ transformProp ] = 'translateX(' + x  + 'px)';
          });
        });
        
        $('.fl-node-<?php echo $id; ?> .carousel-nav').flickity({
            asNavFor: '.fl-node-<?php echo $id; ?> .carousel-main',
            prevNextButtons: true,
            contain: true,
            pageDots: false,
            autoPlay: <?php echo $autoplay; ?>,
            groupCells: <?php echo $cells; ?>,
            arrowShape: { x0: 10, x1: 60, y1: 50, x2: 70, y2: 40, x3: 30 }
        });

	});
})(jQuery);