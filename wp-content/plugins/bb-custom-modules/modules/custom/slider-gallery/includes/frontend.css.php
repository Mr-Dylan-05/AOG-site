<?php
if ( ($settings->custom_height <> '') && ($settings->main_slider_height == 'customHeight') && ($settings->adaptive_height == 'false') ) {
    FLBuilderCSS::responsive_rule( array(
    	'settings'     => $settings,
    	'setting_name' => 'custom_height',
    	'selector'     => ".fl-node-$id .carousel-main .carousel-cell",
    	'prop'         => 'height'
    ) );
} 
if ( ($settings->main_slider_height == 'fullHeight') && ($settings->adaptive_height == 'true') ) {
    ?>
    .fl-node-<?php echo $id; ?> .carousel-main .carousel-cell {
        object-fit: contain;
        padding: 0;
        height: auto;
    }
    <?php
}

if ( ($settings->nav_slider_height <> '') && ($settings->main_slider_height == 'customHeight') ) {
    FLBuilderCSS::responsive_rule( array(
    	'settings'     => $settings,
    	'setting_name' => 'nav_slider_height',
    	'selector'     => ".fl-node-$id .carousel-nav .carousel-cell",
    	'prop'         => 'height'
    ) );
}

?>

<?php if ($settings->main_slider_height == 0) { ?>
.fl-node-<?php echo $id; ?> .slider-gallery .flickity-page-dots {
    display: none;
}
<?php } ?>

<?php if ($settings->adaptive_height == 'true') { ?>
.fl-node-<?php echo $id; ?> .carousel-main .carousel-cell {
    height: auto;
}
.fl-node-<?php echo $id; ?> .carousel-nav .carousel-cell {
    height: 0;
}
<?php } ?>

<?php if ($settings->nav_slider_column <> '') { ?>
.fl-node-<?php echo $id; ?> .carousel-nav .carousel-cell {
    <?php if ($settings->nav_slider_column == '2') { ?>
        width: 50%;
    <?php } ?>
    <?php if ($settings->nav_slider_column == '3') { ?>
        width: 33.33%;
    <?php } ?>
    <?php if ($settings->nav_slider_column == '4') { ?>
        width: 25%;
    <?php } ?>
    <?php if ($settings->nav_slider_column == '5') { ?>
        width: 20%;
    <?php } ?>
    <?php if ($settings->nav_slider_column == '6') { ?>
        width: 16.67%;
    <?php } ?>
}
<?php } ?>

<?php if ($settings->image_main_size == 'contain') { ?>
.fl-node-<?php echo $id; ?> .slider-gallery .gallery-image {
    object-fit: contain;
    height: auto;
}
<?php } ?>

<?php if ($settings->image_nav_size == 'contain') { ?>
.fl-node-<?php echo $id; ?> .slider-gallery .gallery-image-nav {
    object-fit: contain;
}
<?php } ?>

<?php
if ($settings->image_main_size == 'contain') {
FLBuilderCSS::dimension_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'image_main_padding',
	'selector' 	=> ".fl-node-$id .slider-gallery .gallery-image",
	'props'		=> array(
		'padding-top' 	 => 'image_main_padding_top',
		'padding-right'   => 'image_main_padding_right',
		'padding-bottom'  => 'image_main_padding_bottom',
		'padding-left' 	 => 'image_main_padding_left',
	),
) );
}

if ($settings->image_nav_size == 'contain') {
FLBuilderCSS::dimension_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'image_nav_padding',
	'selector' 	=> ".fl-node-$id .slider-gallery .gallery-image-nav",
	'props'		=> array(
		'padding-top' 	 => 'image_nav_padding_top',
		'padding-right'   => 'image_nav_padding_right',
		'padding-bottom'  => 'image_nav_padding_bottom',
		'padding-left' 	 => 'image_nav_padding_left',
	),
) );
}

if (!empty($settings->nav_bg_color)) {
FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .slider-gallery .flickity-button",
	'props'    => array(
		'background-color' => FLBuilderColor::hex_or_rgb($settings->nav_bg_color),
	),
) );
}

if (!empty($settings->nav_icon_color)) {
FLBuilderCSS::rule( array(
    'selector' => ".fl-node-$id .slider-gallery .flickity-button svg > *",
    'props'    => array(
        'fill' => FLBuilderColor::hex_or_rgb($settings->nav_icon_color),
    ),
) );
}
?>

@media (min-width: 769px) and (max-width: 1024){
    .fl-node-<?php echo $id; ?> .carousel-nav .carousel-cell{
        <?php if ($settings->nav_slider_column_tablet == '1') { ?>
            width: 100% !important;
        <?php } ?>
        <?php if ($settings->nav_slider_column_tablet == '2') { ?>
            width: 50% !important; !important;
        <?php } ?>
        <?php if ($settings->nav_slider_column_tablet == '3') { ?>
            width: 33.33% !important;
        <?php } ?>
        <?php if ($settings->nav_slider_column_tablet == '4') { ?>
            width: 25% !important;
        <?php } ?>
        <?php if ($settings->nav_slider_column_tablet == '5') { ?>
            width: 20% !important;
        <?php } ?>
        <?php if ($settings->nav_slider_column_tablet == '6') { ?>
            width: 16.67% !important;
        <?php } ?>
    }
}

@media (max-width: 768px){
    .fl-node-<?php echo $id; ?> .carousel-nav .carousel-cell{
        <?php if ($settings->nav_slider_column_mobile == '1') { ?>
            width: 100% !important;
        <?php } ?>
        <?php if ($settings->nav_slider_column_mobile == '2') { ?>
            width: 50% !important; !important;
        <?php } ?>
        <?php if ($settings->nav_slider_column_mobile == '3') { ?>
            width: 33.33% !important;
        <?php } ?>
        <?php if ($settings->nav_slider_column_mobile == '4') { ?>
            width: 25% !important;
        <?php } ?>
        <?php if ($settings->nav_slider_column_mobile == '5') { ?>
            width: 20% !important;
        <?php } ?>
        <?php if ($settings->nav_slider_column_mobile == '6') { ?>
            width: 16.67% !important;
        <?php } ?>
    }
}