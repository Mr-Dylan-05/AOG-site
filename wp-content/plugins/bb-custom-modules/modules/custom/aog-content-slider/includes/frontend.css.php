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

<?php if ($settings->box_column <> '') { ?>
.fl-node-<?php echo $id; ?> .aog-content-slider .carousel-main .carousel-cell {
    <?php if ($settings->box_column == '2') { ?>
        width: 50%;
    <?php } ?>
    <?php if ($settings->box_column == '3') { ?>
        width: 33.33%;
    <?php } ?>
    <?php if ($settings->box_column == '4') { ?>
        width: 25%;
    <?php } ?>
    <?php if ($settings->box_column == '5') { ?>
        width: 20%;
    <?php } ?>
    <?php if ($settings->box_column == '6') { ?>
        width: 16.67%;
    <?php } ?>
}
<?php } ?>

@media (min-width: 481px) and (max-width: 1024px){
    .fl-node-<?php echo $id; ?> .aog-content-slider .carousel-main .carousel-cell {
        <?php if ($settings->box_column_tablet == '1') { ?>
            width: 100% !important;
        <?php } ?>
        <?php if ($settings->box_column_tablet == '2') { ?>
            width: 50% !important;
        <?php } ?>
        <?php if ($settings->box_column_tablet == '3') { ?>
            width: 33.33% !important;
        <?php } ?>
        <?php if ($settings->box_column_tablet == '4') { ?>
            width: 25% !important;
        <?php } ?>
        <?php if ($settings->box_column_tablet == '5') { ?>
            width: 20% !important;
        <?php } ?>
        <?php if ($settings->box_column_tablet == '6') { ?>
            width: 16.67% !important;
        <?php } ?>
    }
}

@media (max-width: 480px){
    .fl-node-<?php echo $id; ?> .aog-content-slider .carousel-main .carousel-cell {
        <?php if ($settings->box_column_mobile == '1') { ?>
            width: 100% !important;
        <?php } ?>
        <?php if ($settings->box_column_mobile == '2') { ?>
            width: 50% !important;
        <?php } ?>
        <?php if ($settings->box_column_mobile == '3') { ?>
            width: 33.33% !important;
        <?php } ?>
        <?php if ($settings->box_column_mobile == '4') { ?>
            width: 25% !important;
        <?php } ?>
        <?php if ($settings->box_column_mobile == '5') { ?>
            width: 20% !important;
        <?php } ?>
        <?php if ($settings->box_column_mobile == '6') { ?>
            width: 16.67% !important;
        <?php } ?>
    }
}

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

FLBuilderCSS::border_field_rule( array(
    'settings'  => $settings,
    'setting_name'  => 'box_border',
    'selector'  => ".fl-node-$id .aog-content-slider .carousel-main .carousel-cell .slide",
) );

FLBuilderCSS::dimension_field_rule( array(
	'settings'    => $settings,
	'setting_name'    => 'box_margin',
	'selector'    => ".fl-node-$id .aog-content-slider .carousel-main .content-box-wrapper",
	'unit'        => 'px',
	'props'       => array(
		'margin-top'    => 'box_margin_top',
		'margin-right'  => 'box_margin_right',
		'margin-bottom' => 'box_margin_bottom',
		'margin-left'   => 'box_margin_left',
	),
) );

FLBuilderCSS::dimension_field_rule( array(
	'settings'    => $settings,
	'setting_name'    => 'box_padding',
	'selector'    => ".fl-node-$id .aog-content-slider .carousel-main .content-box-wrapper",
	'unit'        => 'px',
	'props'       => array(
		'padding-top'    => 'box_padding_top',
		'padding-right'  => 'box_padding_right',
		'padding-bottom' => 'box_padding_bottom',
		'padding-left'   => 'box_padding_left',
	),
) );
?>



<?php for($i = 0; $i < count($settings->items); $i++) { ?>
.fl-node-<?php echo $id; ?> .aog-content-slider .carousel-main .carousel-cell.slide-<?php echo $i; ?> .slide {
	<?php if ($settings->items[$i]->bg_overlay_type != 'none' || $settings->items[$i]->bg_overlay_type == 'color' || $settings->items[$i]->bg_overlay_color <> '') { ?>
	background: <?php echo FLBuilderColor::hex_or_rgb( $settings->items[$i]->bg_overlay_color ); ?>;
	<?php } ?>
	<?php if ($settings->items[$i]->bg_overlay_type != 'none' || $settings->items[$i]->bg_overlay_type == 'gradient' || $settings->items[$i]->bg_overlay_gradient1 <> '' || $settings->items[$i]->bg_overlay_gradient2 <> '') { ?>
	background: <?php echo FLBuilderColor::hex_or_rgb( $settings->items[$i]->bg_overlay_gradient1 ); ?>;
	background: linear-gradient(120deg, <?php echo FLBuilderColor::hex_or_rgb( $settings->items[$i]->bg_overlay_gradient1 ); ?> 0%, <?php echo FLBuilderColor::hex_or_rgb( $settings->items[$i]->bg_overlay_gradient2 ); ?> 100%);
	<?php } ?>
}

<?php if ( !empty($settings->items[$i]->icon_color) ) { ?>
.fl-node-<?php echo $id; ?> .aog-content-slider .slide-<?php echo $i; ?> .aog-icon {
	color: #<?php echo $settings->items[$i]->icon_color; ?>;
}
<?php } ?>

<?php if ( !empty($settings->items[$i]->icon_size) ) {
$iconWidthVal = $settings->items[$i]->icon_size . $settings->items[$i]->icon_size_unit; ?>
.fl-node-<?php echo $id; ?> .aog-content-slider .slide-<?php echo $i; ?> .aog-icon {
	font-size: <?php echo $iconWidthVal; ?>;
}
<?php } ?>

<?php if ( !empty($settings->items[$i]->image_size) ) {
$widthVal = $settings->items[$i]->image_size . $settings->items[$i]->image_size_unit; ?>
.fl-node-<?php echo $id; ?> .aog-content-slider .slide-<?php echo $i; ?> .img-icon {
	width: <?php echo $widthVal; ?>;
	height: <?php echo $widthVal; ?>;
}
<?php } ?>

<?php
FLBuilderCSS::responsive_rule( array(
	'settings'	=> $settings->items[$i],
	'setting_name' 	=> 'slide_column_align',
	'selector' 	=> ".fl-node-$id .aog-content-slider .carousel-main .carousel-cell.slide-$i .slide",
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
<?php } ?>