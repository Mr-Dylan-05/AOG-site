.fl-node-<?php echo $id; ?> .devices-label span {
<?php if ( !empty($settings->label_color) ) { ?>
	color: #<?php echo $settings->label_color; ?>;
<?php } ?>
}

<?php
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'label_typography',
	'selector' 	=> ".fl-node-$id .devices-label",
) );