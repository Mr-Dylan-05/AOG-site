<?php if ( !empty($settings->label_color1) ) { ?>
.fl-node-<?php echo $id; ?> .caption span.label1 {
	color: #<?php echo $settings->label_color1; ?>;
}
<?php } ?>

<?php if ( !empty($settings->label_color2) ) { ?>
.fl-node-<?php echo $id; ?> .caption span.label2 {
	color: #<?php echo $settings->label_color2; ?>;
}
<?php } ?>

<?php
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'caption_typography',
	'selector' 	=> ".fl-node-$id .caption",
) );