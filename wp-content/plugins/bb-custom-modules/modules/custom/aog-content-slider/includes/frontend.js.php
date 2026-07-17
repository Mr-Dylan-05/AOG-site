(function($) {
	$(function() {
        
        <?php
        $autoplay = ($settings->autoplay_speed <> '' ? $settings->autoplay_speed : $settings->autoplay);
        $attraction = ($settings->attraction <> '' ? $settings->attraction : '1')/100;
        $friction = ($settings->friction <> '' ? $settings->friction : '15')/100;
        $cells = ($settings->box_column <> '' ? $settings->box_column : '3');
        $nav = ($settings->nav_arrows <> '' ? $settings->nav_arrows : 'false');
        $dots = ($settings->nav_dots <> '' ? $settings->nav_dots : 'false');
        ?>

        equalheight = function(container){
            maxheight=0;
            $(container).each(function(){
                maxheight = $(this).height() > maxheight ? $(this).height() : maxheight;
            })
            $(container).height(maxheight);
        }

		$(window).load(function() {
            equalheight('.fl-node-<?php echo $id; ?> .aog-content-slider .carousel-main .carousel-cell');
		});

        $(window).resize(function(){
            equalheight('.fl-node-<?php echo $id; ?> .aog-content-slider .carousel-main .carousel-cell');
        });

        $(window).load(function() {
            var viewportWidth = $(window).outerWidth();
            if (viewportWidth > 991) {
                <?php $cells = ($settings->box_column <> '' ? $settings->box_column : '3'); ?>
            }
            if (viewportWidth <= 991) {
                <?php $cells = ($settings->box_column_tablet <> '' ? $settings->box_column_tablet : '2'); ?>
            }
            if (viewportWidth < 480) {
                <?php $cells = ($settings->box_column_mobile <> '' ? $settings->box_column_mobile : '1'); ?>
            }
		    });

        $(window).resize(function(){
            var viewportWidth = $(window).outerWidth();
            if (viewportWidth > 991) {
                <?php $cells = ($settings->box_column <> '' ? $settings->box_column : '3'); ?>
            }
            if (viewportWidth <= 991) {
                <?php $cells = ($settings->box_column_tablet <> '' ? $settings->box_column_tablet : '2'); ?>
            }
            if (viewportWidth < 480) {
                <?php $cells = ($settings->box_column_mobile <> '' ? $settings->box_column_mobile : '1'); ?>
            }
        });
        
        var $carousel = $('.fl-node-<?php echo $id; ?> .carousel-main').flickity({
            imagesLoaded: true,
            percentPosition: false,
            prevNextButtons: <?php echo $nav; ?>,
            pageDots: <?php echo $dots; ?>,
            wrapAround: true,
            autoPlay: <?php echo $autoplay; ?>,
            selectedAttraction: <?php echo $attraction; ?>, 
            friction: <?php echo $friction; ?>,
            groupCells: <?php echo $cells; ?>
        });

        

	});
})(jQuery);