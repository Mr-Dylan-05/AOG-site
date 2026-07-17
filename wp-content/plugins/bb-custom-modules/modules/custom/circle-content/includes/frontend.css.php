<?php if ( !empty($settings->label_color) ) { ?>
.fl-node-<?php echo $id; ?> .ring-title {
	color: #<?php echo $settings->label_color; ?>;
}
<?php } ?>

<?php
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'label_typography',
	'selector' 	=> ".fl-node-$id .ring-title",
) );

FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'main_title_typography',
	'selector' 	=> ".fl-node-$id .main-title",
) );

FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'main_content_typography',
	'selector' 	=> ".fl-node-$id .main-content",
) );

FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .r-outer",
	'props'    => array(
		'background-color' => $settings->main_color,
	),
) );
?>

<?php if ( !empty($settings->icon_color) ) { ?>
.fl-node-<?php echo $id; ?> .r-center i {
	color: #<?php echo $settings->icon_color; ?>;
}
<?php } ?>

<?php if ( !empty($settings->icon1_color) ) { ?>
.fl-node-<?php echo $id; ?> .r-outer i {
	color: #<?php echo $settings->icon1_color; ?>;
}
<?php } ?>

<?php if ( !empty($settings->icon2_color) ) { ?>
.fl-node-<?php echo $id; ?> .r-middle i {
	color: #<?php echo $settings->icon2_color; ?>;
}
<?php } ?>

<?php if ( !empty($settings->icon3_color) ) { ?>
.fl-node-<?php echo $id; ?> .r-inner i {
	color: #<?php echo $settings->icon3_color; ?>;
}
<?php } ?>