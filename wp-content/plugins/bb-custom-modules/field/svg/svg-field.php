<?php
/**
 * Custom fields - svg
 */
add_action('fl_builder_control_svg', 'fl_svg_field', 1, 4 );
function fl_svg_field( $name, $value, $field ) { ?>
<?php $svg = FLBuilderPhoto::get_attachment_data($value); ?>
<div class="fl-svg-field fl-builder-custom-field<?php if(empty($value) || !$svg) echo ' fl-svg-empty'; if(isset($field['class'])) echo ' ' . $field['class']; ?>">
	<a class="fl-svg-select" href="javascript:void(0);" onclick="return false;"><?php _e('Select SVG', 'fl-builder'); ?></a>
	<div class="fl-svg-preview">
		<?php if(!empty($value) && $svg) : ?>
		<div class="fl-svg-preview-img">
			<img src="<?php echo FLBuilderPhoto::get_thumb( $svg ); ?>">
		</div>
		<span class="fl-svg-preview-filename"><?php echo $svg->filename; ?></span>
		<?php else : ?>
		<div class="fl-svg-preview-img">
			<img src="<?php echo FL_BUILDER_URL; ?>img/spacer.png">
		</div>
		<span class="fl-svg-preview-filename"></span>
		<?php endif; ?>
		<br />
		<a class="fl-svg-replace" href="javascript:void(0);" onclick="return false;"><?php _e('Edit', 'fl-builder'); ?></a>
		<a class="fl-svg-remove" href="javascript:void(0);" onclick="return false;"><?php _e('Remove', 'fl-builder'); ?></a>
		<div class="fl-clear"></div>
	</div>
	<input name="<?php echo $name; ?>" type="hidden" value='<?php echo $value; ?>' />
</div>
<?php
}
add_action( 'wp_enqueue_scripts', 'fl_svg_field_assets' );
function fl_svg_field_assets() {
    if ( class_exists( 'FLBuilderModel' ) && FLBuilderModel::is_builder_active() ) {
    	wp_enqueue_style( 'svg-field', BB_CUSTOM_MODULES_URL . 'field/svg/svg-field.css', array(), '' );
        wp_enqueue_script( 'svg-field', BB_CUSTOM_MODULES_URL . 'field/svg/svg-field.js', array(), '', true );
    }
}