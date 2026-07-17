(function($) {
	$(function() {
		<?php 
			$autoplay = ( $settings->autoplay <> '' ) ? $settings->autoplay : 'false';
			for($i = 0; $i < count($settings->items); $i++) : if(!is_object($settings->items[$i])) continue; 
			endfor;
		?>
		$(".fl-node-<?php echo $id; ?> .owl-carousel").owlCarousel({
			items: <?php echo $settings->grid; ?>,
			margin: 0,
			dots: true,
			nav: false,
			navText: ['',''],
			autoplay: <?php echo $autoplay; ?>,
			autoplayTimeout: 7000,
			<?php if ( $i > 1 ) { ?>loop: true,<?php } else { ?>loop: false,<?php } ?>
			autoHeight: true,
			animateOut: 'fadeOut',
			mouseDrag: false,
            responsiveClass:true,
                responsive:{
                    0:{
                        items: 1,
                        nav:true
                    },
                    460:{
                        items:1,
                        nav:false
                    },
                    768:{
                        items:3,
                        nav:false
                    },
                    1024:{
                        items:<?php echo $settings->grid; ?>,
                        nav:true,
                        loop:false
                    }
                }
		});
	});
})(jQuery);