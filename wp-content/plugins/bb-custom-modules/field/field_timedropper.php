<?php
/**
 * Custom fields - TimeDropper
 */
add_action('fl_builder_control_timedropper', 'fl_timedropper_field', 1, 5);
function fl_timedropper_field($name, $value, $field, $settings) {
    echo '<input type="text" class="timedropper text-full" name="' . $name . '" value="' . $value . '" />';
    echo '<script src="'. FL_MODULE_THEME_URL . 'assets/js/timedropper.js'.'"></script>';
}
add_action( 'wp_enqueue_scripts', 'fl_timedropper' );
function fl_timedropper() {
    if ( class_exists( 'FLBuilderModel' ) && FLBuilderModel::is_builder_active() ) {
        wp_enqueue_style( 'fl-timedropper-fields', FL_MODULE_THEME_URL . 'assets/css/timedropper.css', array(), '' );
    }
}
?>