<?php $global_settings = FLBuilderModel::get_global_settings(); ?>

<?php if ( ($settings->slide_content_width == 'fixed') && ($settings->slide_max_content_width == '') ) { ?>
.fl-node-<?php echo $id; ?> .slider-banner .carousel-main .carousel-cell .slide {
    width: <?php echo $global_settings->row_width; ?><?php echo $global_settings->row_width_unit; ?>;
}
<?php } ?>

<?php
if ( ($settings->slide_content_width == 'fixed') && ($settings->slide_max_content_width <> '') ) {
FLBuilderCSS::responsive_rule( array(
	'settings'     => $settings,
	'setting_name' => 'slide_max_content_width',
	'selector'     => ".fl-node-$id .slider-banner .carousel-main .carousel-cell .slide",
	'prop'         => 'width',
) );
}

if ($settings->slide_full_height == 'custom') {
FLBuilderCSS::responsive_rule( array(
	'settings'     => $settings,
	'setting_name' => 'slide_min_height',
	'selector'     => ".fl-node-$id .slider-banner .carousel-main .carousel-cell",
	'prop'         => 'height',
) );
}
?>

<?php if ($settings->slide_full_height == 'full') { ?>
.fl-node-<?php echo $id; ?> .slider-banner .carousel-main .carousel-cell {
    height: 100vh;
}
<?php } ?>

<?php if ( !empty($settings->prefix_color) ) { ?>
.fl-node-<?php echo $id; ?> .slide-prefix {
	color: #<?php echo $settings->prefix_color; ?>;
}
<?php } ?>

<?php if ( !empty($settings->title_color) ) { ?>
.fl-node-<?php echo $id; ?> .slide-title {
	color: #<?php echo $settings->title_color; ?>;
}
<?php } ?>

<?php if ( !empty($settings->content_color) ) { ?>
.fl-node-<?php echo $id; ?> .slide-content {
	color: #<?php echo $settings->content_color; ?>;
}
<?php } ?>

<?php
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'prefix_typography',
	'selector' 	=> ".fl-node-$id .slide-prefix",
) );

FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'title_typography',
	'selector' 	=> ".fl-node-$id .slide-title",
) );

FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'content_typography',
	'selector' 	=> ".fl-node-$id .slide-content",
) );

FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .slider-banner .carousel-main .carousel-cell:after",
	'enabled'  => 'none' !== $settings->bg_overlay_type,
	'props'    => array(
		'background-color' => 'color' === $settings->bg_overlay_type ? $settings->bg_overlay_color : '',
		'background-image' => 'gradient' === $settings->bg_overlay_type ? FLBuilderColor::gradient( $settings->bg_overlay_gradient ) : '',
	),
) );
?>

<?php for($i = 0; $i < count($settings->items); $i++) : if(!is_object($settings->items[$i])) continue; ?>
<?php if ( ($settings->items[$i]->bg_image_src <> '') || ($settings->items[$i]->bg_repeat <> '') || ($settings->items[$i]->bg_position <> '') || ($settings->items[$i]->bg_attachment <> '') || ($settings->items[$i]->bg_size <> '') ) { ?>
.fl-node-<?php echo $id; ?> .slide-<?php echo $i; ?> {
    background-image: url("<?php echo $settings->items[$i]->bg_image_src; ?>");
    background-repeat: <?php echo $settings->items[$i]->bg_repeat; ?>;
    background-position: <?php echo $settings->items[$i]->bg_position; ?>;
    background-attachment: <?php echo $settings->items[$i]->bg_attachment; ?>;
    background-size: <?php echo $settings->items[$i]->bg_size; ?>;
}
<?php } ?>

<?php
if ( ($settings->items[$i]->slide_column_content_width == 'custom') && ($settings->items[$i]->slide_column_max_width <> '') ) {
FLBuilderCSS::responsive_rule( array(
	'settings'     => $settings->items[$i],
	'setting_name' => 'slide_column_max_width',
	'selector'     => ".fl-node-$id .slider-banner .carousel-main .slide-$i .slide > *",
	'prop'         => 'width',
) );
}

FLBuilderCSS::responsive_rule( array(
	'settings'	=> $settings->items[$i],
	'setting_name' 	=> 'slide_column_align',
	'selector' 	=> ".fl-node-$id .slider-banner .carousel-main .carousel-cell.slide-$i .slide",
    'prop'		=> 'justify-content',
) );

FLBuilderCSS::responsive_rule( array(
	'settings'	=> $settings->items[$i],
	'setting_name' 	=> 'slide_text_align',
	'selector' 	=> ".fl-node-$id .slide-$i .slide-column > *",
    'prop'		=> 'text-align',
) );

FLBuilderCSS::responsive_rule( array(
	'settings'	=> $settings->items[$i],
	'setting_name' 	=> 'slide_btns_align',
	'selector' 	=> ".fl-node-$id .slide-$i .slide-column .slide-btns",
    'prop'		=> 'justify-content',
) );
?>
<?php endfor; ?>