<script type="text/html" id="tmpl-fl-theme-builder-header-footer-message">
	<div id="theme-builder-header-footer-message">
		<strong><?php _e( 'Note:', 'bb-theme-builder' ); ?> </strong>
		<# if ( data.message == 'header' ) { #>
			<?php /* translators: %s: Link to open in Themer */ ?>
			<?php printf( __( 'The header for this page was created with a Themer layout. Some of these settings may not apply.%s', 'bb-theme-builder' ), '<br /><a class="customizer-themer-edit-header" href="#">Edit with Themer &rarr;</a>' ); ?>
		<# } else { #>
			<?php /* translators: %s: Link to open in Themer */ ?>
			<?php printf( __( 'The footer for this page was created with a Themer layout. Some of these settings may not apply.%s', 'bb-theme-builder' ), '<br /><a class="customizer-themer-edit-footer" href="#">Edit with Themer &rarr;</a>' ); ?>
		<# } #>
	</div>
</script>
