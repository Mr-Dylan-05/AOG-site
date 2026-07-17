<?php

?>

#main .main-menu li a,
#responsive-menu-wrapper #primary-menu > li a{
<?php if ( !empty($settings->menu_item_color) ) { ?>
	color: #<?php echo $settings->menu_item_color; ?>;
<?php } ?>
}

<?php
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'menu_typography',
	'selector' 	=> ".fl-node-$id #main .main-menu li a",
) );

?>

.fl-node-<?php echo $id; ?> .custom_facebook{
    text-align: <?php echo $settings->fb_align; ?>;
}