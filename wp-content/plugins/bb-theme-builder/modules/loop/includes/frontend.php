<?php

$data_source = isset( $settings->data_source ) ? $settings->data_source : 'custom_query';
$post_type   = isset( $settings->post_type ) ? $settings->post_type : 'post';
$paged       = '';
if ( 'numbers' === $settings->pagination && boolval( $settings->pagination_auto_scroll ) && FLBuilderLoop::get_paged() > 0 ) {
	$paged = ' fl-loop-paged-scroll';
}
if ( class_exists( 'FLBuilderModuleDataRepeater' ) ) {
	?>
<div <?php $module->render_attributes(); ?>>
	<ul class="fl-loop-grid<?php echo $paged; ?>">
		<?php
		$repeater = new FLBuilderModuleDataRepeater( $settings );
		if ( $repeater->has_items() ) {
			while ( $repeater->has_items() ) {
				$repeater->setup_item();
				$module->render_item();
			}
			$repeater->cleanup();
		} elseif ( FLBuilderModel::is_builder_active() ) {
			// Render a dummy item for editing.
			$module->render_item();
		}
		?>
	</ul>
	<?php if ( $repeater->can_paginate() && 'none' !== $settings->pagination ) : ?>
		<div class="fl-builder-pagination"<?php echo ( 'scroll' == $settings->pagination ) ? ' style="display:none;"' : ''; ?>>
			<?php $repeater->pagination(); ?>
		</div>
	<?php endif ?>
	<?php
	if ( ! $repeater->has_items() && ! FLBuilderModel::is_builder_active() ) {
		?>
		<div class="fl-loop-grid-empty">
			<p><?php echo $settings->no_results_message; ?></p>
			<?php
			if ( $settings->show_search ) {
				get_search_form();
			}
			?>
		</div>
	<?php } ?>
	<?php
	if ( $repeater->has_items() && ! FLBuilderModel::is_builder_active() ) {
		$module->print_json_ld( $repeater );
	}
	?>
</div>
<?php } ?>
