.fl-node-<?php echo $id; ?> .audio-heading {
<?php if ( !empty($settings->name_color) ) { ?>
	color: #<?php echo $settings->name_color; ?>;
<?php } ?>
<?php if ( !empty($settings->icon_size) || !empty($settings->padding_right) || !empty($settings->padding_left) ) { ?>
    width: calc(100% - (<?php echo $settings->icon_size; ?>px + <?php echo ($settings->padding_right <> '' ? $settings->padding_right : '0'); ?>px + <?php echo ($settings->padding_left <> '' ? $settings->padding_left : '0'); ?>px) );
<?php } else { ?>
    width: calc(100% - 50px);
<?php } ?>
}

<?php
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'name_typography',
	'selector' 	=> ".fl-node-$id .audio-heading",
) );
?>

.fl-node-<?php echo $id; ?> .audio-post .audioControl {
<?php if ( !empty($settings->padding_top) || !empty($settings->padding_right) || !empty($settings->padding_bottom) || !empty($settings->padding_left) ) { ?>
    padding-top: <?php echo ($settings->padding_top <> '' ? $settings->padding_top : '0'); ?>px;
    padding-right: <?php echo ($settings->padding_right <> '' ? $settings->padding_right : '0'); ?>px;
    padding-bottom: <?php echo ($settings->padding_bottom <> '' ? $settings->padding_bottom : '0'); ?>px;
    padding-left: <?php echo ($settings->padding_left <> '' ? $settings->padding_left : '0'); ?>px;
<?php } ?>
}
.fl-node-<?php echo $id; ?> .audio-post .audioControl img {
    <?php if ( !empty($settings->icon_size) ) { ?>
	width: <?php echo $settings->icon_size; ?>px;
	height: <?php echo $settings->icon_size; ?>px;
    <?php } ?>
}