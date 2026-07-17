(function($) {
	$(function() {
		<?php 
			$autoplay = ( $settings->autoplay <> '' ) ? $settings->autoplay : 'false';
			$dots = ( $settings->show_dots <> '' ) ? $settings->show_dots : 'true';
			$nav = ( $settings->show_nav <> '' ) ? $settings->show_nav : 'true';
			$delay = $settings->autoplay_delay <> '' ? $settings->autoplay_delay : '7000';
			$speed = $settings->autoplay_speed <> '' ? $settings->autoplay_speed : '1500'; 
		?>
		if ( $(".fl-node-<?php echo $id; ?> .owl-carousel .slide-item").length < 2 ) {
			var loopSet = false;
			var touchDragSet = false;
			var mouseDragSet = false;
			var dotsSet = false;
			var navSet = false;
		} else {
			var loopSet = true;
			var touchDragSet = true;
			var mouseDragSet = true;
			var dotsSet = <?php echo $dots; ?>;
			var navSet = <?php echo $nav; ?>;
		}
		var owl = $(".fl-node-<?php echo $id; ?> .owl-carousel");
		owl.owlCarousel({
			items: 1,
			margin: 0,
			navText: ['',''],
			autoplay: <?php echo $autoplay; ?>,
			autoplayTimeout: <?php echo $delay ?>,
			autoplaySpeed: <?php echo $speed ?>,
			dragEndSpeed: <?php echo $speed ?>,
			autoplayHoverPause: <?php echo $autoplay; ?>,
			dotsSpeed: <?php echo $speed ?>,
			navSpeed: <?php echo $speed ?>,
			fluidSpeed: <?php echo $speed ?>,
			smartSpeed: <?php echo $speed ?>,
			loop: loopSet,
			dots: dotsSet,
			nav: navSet,
			touchDrag: touchDragSet,
			mouseDrag: mouseDragSet,
			<?php if ( $settings->loop_animation == 'fade' ) { ?>
			animateOut: 'fadeOut',
			responsive : {
				0 : {
					mouseDrag: true,
				},
				1280 : {
					mouseDrag: false,
				}
			}
			<?php } ?>
		});
		setTimeout(function(){
			owl.trigger('refresh.owl.carousel');
		}, 300);
		$(window).on("load", function(){
			owl.trigger('refresh.owl.carousel');
		});
		if ($('.fl-builder-edit').length ) {
			$(".fl-builder-content").on("fl-builder.preview-rendered", function(){
				owl.trigger('refresh.owl.carousel');
			});
			$('body').on('click','.fl-field-responsive-toggle, .fl-lightbox-footer .fl-builder-button', function(){
				setTimeout(function(){
					owl.trigger('refresh.owl.carousel');
				}, 300);
			});
		}
		
		<?php if ( $autoplay === 'true' ) { ?>
			$.fn.visible = function(partial) {		
				var $t            = $(this),
					$w            = $(window),
					viewTop       = $w.scrollTop(),
					viewBottom    = viewTop + $w.height(),
					_top          = $t.offset().top,
					_bottom       = _top + $t.height(),
					compareTop    = partial === true ? _bottom : _top,
					compareBottom = partial === true ? _top : _bottom;		
				return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
			};
			$(window).on("load scroll resize", function(){
				if (owl.visible(true)) {
					owl.trigger('play.owl.autoplay');
				} else {
					owl.trigger('stop.owl.autoplay');
				}
			});
		<?php } ?>
	});
	
})(jQuery);