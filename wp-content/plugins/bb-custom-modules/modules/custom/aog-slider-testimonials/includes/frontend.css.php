<?php if ( ($settings->custom_height <> '') && ($settings->main_slider_height == 'customHeight') ) { ?>
.fl-node-<?php echo $id; ?> .carousel-main .carousel-cell {
    height: <?php echo $settings->custom_height; ?>px;
}
<?php } ?>


<?php if (  ($settings->main_slider_height == 'defaultHeight') ) { ?>
.fl-node-<?php echo $id; ?> .carousel-main .carousel-cell {
    height: auto;
}
<?php } ?>


<?php if ( ($settings->nav_slider_height <> '') && ($settings->main_slider_height == 'customHeight') ) { ?>
.fl-node-<?php echo $id; ?> .carousel-nav .carousel-cell {
    height: <?php echo $settings->nav_slider_height; ?>px;
}
<?php } ?>

<?php if ($settings->testimonial_column <> '') { ?>
.fl-node-<?php echo $id; ?> .carousel-main .carousel-cell {
    <?php if ($settings->testimonial_column == '1') { ?>
        width: 100%;
    <?php } ?>
    <?php if ($settings->testimonial_column == '2') { ?>
        width: 50%;
    <?php } ?>
    <?php if ($settings->testimonial_column == '3') { ?>
        width: 33.33%;
    <?php } ?>
    <?php if ($settings->testimonial_column == '4') { ?>
        width: 25%;
    <?php } ?>
    <?php if ($settings->testimonial_column == '5') { ?>
        width: 20%;
    <?php } ?>
    <?php if ($settings->testimonial_column == '6') { ?>
        width: 16.67%;
    <?php } ?>
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

<?php
FLBuilderCSS::border_field_rule( array(
	'settings' 	=> $settings,
	'setting_name' 	=> 'avatar_shape',
	'selector' 	=> ".fl-node-$id .aog-slider-testimonials .testimonial-avatar",
) );


FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'name_typography',
	'selector' 	=> ".fl-node-$id .author",
) );

FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'content_typography',
	'selector' 	=> ".fl-node-$id .message",
) );

if (!empty($settings->nav_bg_color)) {
FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .aog-slider-testimonials .flickity-button",
	'props'    => array(
		'background-color' => FLBuilderColor::hex_or_rgb($settings->nav_bg_color),
	),
) );
}

if (!empty($settings->nav_icon_color)) {
FLBuilderCSS::rule( array(
    'selector' => ".fl-node-$id .aog-slider-testimonials .flickity-button svg > *",
    'props'    => array(
        'fill' => FLBuilderColor::hex_or_rgb($settings->nav_icon_color),
    ),
) );
}
?>

.fl-node-<?php echo $id; ?> .rating {
<?php if ( !empty($settings->rating_color) ) { ?>
	color: #<?php echo $settings->rating_color; ?>;
<?php } ?>
}
.fl-node-<?php echo $id; ?> .author {
<?php if ( !empty($settings->name_color) ) { ?>
	color: #<?php echo $settings->name_color; ?>;
<?php } ?>
}
.fl-node-<?php echo $id; ?> .message {
<?php if ( !empty($settings->content_color) ) { ?>
	color: #<?php echo $settings->content_color; ?>;
<?php } ?>
}

.fl-node-<?php echo $id; ?> .carousel-cell {
    padding-left: <?php echo $settings->column_gutter_width/2; ?>px;
    padding-right: <?php echo $settings->column_gutter_width/2; ?>px;
}

.fl-node-<?php echo $id; ?> .aog-slider-testimonials .carousel-nav {
    margin-left: <?php echo $settings->column_gutter_width/2; ?>px;
    margin-right: <?php echo $settings->column_gutter_width/2; ?>px;
}
