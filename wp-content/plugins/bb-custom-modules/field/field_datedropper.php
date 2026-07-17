<?php
/**
 * Custom fields - DateDropper
 */
add_action('fl_builder_control_datedropper', 'fl_datedropper_field', 1, 4);
function fl_datedropper_field($name, $value, $field, $settings) {
    echo '<input type="text" class="datedropper text-full" name="' . $name . '" value="' . $value . '" />';
    echo '<script src="'. BB_CUSTOM_MODULES_URL . 'assets/js/datedropper.js'.'"></script>';
}
add_action( 'wp_enqueue_scripts', 'fl_datedropper' );
function fl_datedropper() {
    if ( class_exists( 'FLBuilderModel' ) && FLBuilderModel::is_builder_active() ) {
        wp_enqueue_style( 'fl-datedropper-fields', BB_CUSTOM_MODULES_URL . 'assets/css/datedropper.css', array(), '' );
    }
}
?>