(function($) {
	$(function() {
        
        var $carousel = $('.carousel-main').flickity({
            autoPlay: <?php if( empty( $settings->autoplay_speed ) && $settings->autoplay_speed === true  ){ echo 1500; } else{ echo $settings->autoplay; } ?>,
            pauseAutoPlayOnHover: <?php echo $settings->pause_hover; ?>,
            imagesLoaded: true,
            percentPosition: false,
            prevNextButtons: <?php echo $settings->show_nav; ?>,
            pageDots: <?php echo $settings->show_dots; ?>,
            freeScroll: <?php echo $settings->free_scroll; ?>,
            contain: <?php echo $settings->contain; ?>,
            wrapAround: <?php echo $settings->wrap_round; ?>,
        });

        var $imgs = $carousel.find('.carousel-cell img');
        // get transform property
        var docStyle = document.documentElement.style;
        var transformProp = typeof docStyle.transform == 'string' ?
          'transform' : 'WebkitTransform';
        // get Flickity instance
        var flkty = $carousel.data('flickity');
        
        <?php if ( !$settings->wrap_round ){ ?>
            $carousel.on( 'scroll.flickity', function() {
              flkty.slides.forEach( function( slide, i ) {
                var img = $imgs[i];
                var x = ( slide.target + flkty.x ) * -1/3;
                img.style[ transformProp ] = 'translateX(' + x  + 'px)';
              });
            });
        <?php } ?>
        
        <?php if( $settings->nav_type === 'slider' ){ ?>
        
            $('.carousel-nav').flickity({
                asNavFor: '.carousel-main',
                prevNextButtons: false,
                contain: true,
                pageDots: false,
                freeScroll: <?php echo $settings->free_scroll; ?>,
                wrapAround: <?php echo $settings->wrap_round; ?>,
            });
        
        <?php } ?>

        var textContent = $('.carousel-text-content').clone();
        $('.carousel-text-content').remove();
        $('.carousel-main').append(textContent);
	});
})(jQuery);