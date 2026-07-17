<?php
/**
 * Custom fields - slider
 */
add_action('fl_builder_control_slider', 'fl_slider_field', 1, 4);
function fl_slider_field($name, $value, $field, $settings) {
	$value = ($value <> '') ? $value : $field['placeholder'];
    echo '<input type="range" class="slider" size="' . $field['size'] . '" min="' . $field['minlength'] . '" max="' . $field['maxlength'] . '" step="' . $field['step'] . '" id="' . $name . '" oninput="outputUpdate(value)" name="' . $name . '" value="' . $value . '" />';
	echo '<output for="' . $name . '" id="' . $name . '">' . $value . '</output>';
    echo '<script src="'. FL_MODULE_THEME_URL . 'assets/js/slider_input.js'.'"></script>';
}
?>