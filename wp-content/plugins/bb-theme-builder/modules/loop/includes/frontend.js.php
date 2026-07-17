(function($) {

	$(function() {

		new FLBuilderLoop({
			id: '<?php echo $id; ?>',
			pagination: '<?php echo $settings->pagination; ?>',
		});
	});

})(jQuery);
