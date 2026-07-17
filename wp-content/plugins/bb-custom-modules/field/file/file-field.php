<?php
/**
 * Custom fields - file
 */
add_action('fl_builder_control_file', 'fl_file_field', 1, 4 );
function fl_file_field( $name, $value, $field ) { ?>
<?php $file = FLBuilderPhoto::get_attachment_data($value); ?>
<div class="fl-file-field fl-builder-custom-field<?php if(empty($value) || !$file) echo ' fl-file-empty'; if(isset($field['class'])) echo ' ' . $field['class']; ?>">
	<a class="fl-file-select" href="javascript:void(0);" onclick="return false;"><?php _e('Select File', 'fl-builder'); ?></a>
	<div class="fl-file-preview">
		<?php if(!empty($value) && $file) : ?>
		<div class="fl-file-preview-img">
			<img src="<?php echo $file->icon; ?>">
		</div>
		<span class="fl-file-preview-filename"><?php echo $file->filename; ?></span>
		<?php else : ?>
		<div class="fl-file-preview-img">
			<img src="<?php echo FL_BUILDER_URL; ?>img/spacer.png">
		</div>
		<span class="fl-file-preview-filename"></span>
		<?php endif; ?>
		<br />
		<a class="fl-file-replace" href="javascript:void(0);" onclick="return false;"><?php _e('Edit', 'fl-builder'); ?></a>
		<a class="fl-file-remove" href="javascript:void(0);" onclick="return false;"><?php _e('Remove', 'fl-builder'); ?></a>
		<div class="fl-clear"></div>
	</div>
	<input name="<?php echo $name; ?>" type="hidden" value='<?php echo $value; ?>' />
</div>
<?php
}
add_action( 'wp_enqueue_scripts', 'fl_file_field_assets' );
function fl_file_field_assets() {
    if ( class_exists( 'FLBuilderModel' ) && FLBuilderModel::is_builder_active() ) {
    	wp_enqueue_style( 'file-field', FL_MODULE_THEME_URL . 'field/file/file-field.css', array(), '' );
        wp_enqueue_script( 'file-field', FL_MODULE_THEME_URL . 'field/file/file-field.js', array(), '', true );
    }
}