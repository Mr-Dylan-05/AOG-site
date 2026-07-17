<?php

ob_start();

if ( current_theme_supports( 'block-templates' ) ) {
	include 'frontend.blocks.php';
	$comments = do_blocks( ob_get_clean() );
} else {
	comments_template( '', true );
	$comments = ob_get_clean();
}

if ( empty( $comments ) && FLBuilderModel::is_builder_active() ) {
	echo '<div class="fl-builder-module-placeholder-message">';
	_e( 'Comments', 'bb-theme-builder' );
	echo '</div>';
} else {
	echo $comments;
}
