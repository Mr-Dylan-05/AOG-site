(function($) {
	$(function() {
        
        <?php
        $autoplay = ($settings->autoplay_speed <> '' ? $settings->autoplay_speed : $settings->autoplay);
        $attraction = ($settings->attraction <> '' ? $settings->attraction : '1')/100;
        $friction = ($settings->friction <> '' ? $settings->friction : '15')/100;
        ?>
        
        var $carousel = $('.fl-node-<?php echo $id; ?> .carousel-main').flickity({
            imagesLoaded: true,
            percentPosition: false,
            prevNextButtons: false,
            pageDots: true,
            autoPlay: <?php echo $autoplay; ?>,
            selectedAttraction: <?php echo $attraction; ?>, 
            friction: <?php echo $friction; ?>
        });

        var $imgs = $carousel.find('.carousel-cell .slide');
        // get transform property
        var docStyle = document.documentElement.style;
        var transformProp = typeof docStyle.transform == 'string' ?
          'transform' : 'WebkitTransform';
        // get Flickity instance
        var flkty = $carousel.data('flickity');

        $carousel.on( 'change.flickity', function( event, index ) {
          $('.carousel-cell .slide-prefix, .carousel-cell .slide-title, .carousel-cell .slide-content').removeClass('animated fadeInDown');
          $('.carousel-cell .slide-btn.btn1, .carousel-cell .slide-btn.btn2').removeClass('animated fadeInRight');
          
          $('.slide-' + index ).find('.slide-prefix, .slide-title, .slide-content').addClass('animated fadeInDown');
          $('.slide-' + index ).find('.slide-btn.btn1, .slide-btn.btn2').addClass('animated fadeInRight');
        });

        $carousel.on( 'scroll.flickity', function() {
          flkty.slides.forEach( function( slide, i ) {
            var img = $imgs[i];
            var x = ( slide.target + flkty.x ) * -1/3;
            img.style[ transformProp ] = 'translateX(' + x  + 'px)';
          });
        });

	});
})(jQuery);