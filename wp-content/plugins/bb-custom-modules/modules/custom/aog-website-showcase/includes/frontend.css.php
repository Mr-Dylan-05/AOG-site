<?php if ( !empty($settings->overall_height) ) { 
$valueHeight = $settings->overall_height . $settings->overall_height_unit;
?>
.fl-node-<?php echo $id; ?> .aog-web-showcase .image-wrapper img {
	height: <?php echo $valueHeight; ?>;
}
<?php } ?>

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

<?php if ( !empty($settings->caption_box_width) ) { 
$valueWidth = $settings->caption_box_width . $settings->caption_box_width_unit;
?>
.fl-node-<?php echo $id; ?> .aog-web-showcase .caption-column {
	width: <?php echo $valueWidth; ?>;
}
<?php } ?>

<?php if ( !empty($settings->caption_box_color) ) { ?>
.fl-node-<?php echo $id; ?> .aog-web-showcase .caption {
	background-color: <?php echo FLBuilderColor::hex_or_rgb( $settings->caption_box_color ); ?>;
}
<?php } ?>

<?php if ( !empty($settings->link_color) ) { ?>
.fl-node-<?php echo $id; ?> .aog-web-showcase .aog-icon,
.fl-node-<?php echo $id; ?> .aog-web-showcase .btn .btn-label {
	color: <?php echo FLBuilderColor::hex_or_rgb( $settings->link_color ); ?>;
}
.fl-node-<?php echo $id; ?> .aog-web-showcase .btn.btn-outline {
	border-color: <?php echo FLBuilderColor::hex_or_rgb( $settings->link_color ); ?>;
}
<?php } ?>

<?php if ( ($settings->label1 <> '') || ($settings->label2 <> '') ) { ?>
.fl-node-<?php echo $id; ?> .aog-web-showcase .btn-wrapper {
	margin-top: 20px;
}
<?php } ?>

<?php if ( !empty($settings->icon_size) ) {
$iconWidthVal = $settings->icon_size . $settings->icon_size_unit; ?>
.fl-node-<?php echo $id; ?> .aog-web-showcase .aog-icon {
	font-size: <?php echo $iconWidthVal; ?>;
}
<?php } ?>

<?php if ( !empty($settings->image_size) ) {
$widthVal = $settings->image_size . $settings->image_size_unit; ?>
.fl-node-<?php echo $id; ?> .aog-web-showcase .img-icon {
	width: <?php echo $widthVal; ?>;
	height: <?php echo $widthVal; ?>;
}
<?php } ?>

<?php
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'caption_typography',
	'selector' 	=> ".fl-node-$id .caption",
) );

FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'btn_typography',
	'selector' 	=> ".fl-node-$id .aog-web-showcase .btn .btn-label",
) );

FLBuilderCSS::border_field_rule( array(
    'settings'  => $settings,
    'setting_name'  => 'btn_border',
    'selector'  => ".fl-node-$id .aog-web-showcase .btn.btn-outline",
) );