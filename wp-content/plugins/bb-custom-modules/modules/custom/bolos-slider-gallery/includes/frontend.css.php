<?php if ( ($settings->custom_height <> '') && ($settings->main_slider_height == 'customHeight') ) { ?>
.fl-node-<?php echo $id; ?> .carousel-main .carousel-cell {
    height: <?php echo $settings->custom_height; ?>px;
}
<?php } ?>

<?php if ( ($settings->nav_slider_height <> '') && ($settings->main_slider_height == 'customHeight') ) { ?>
.fl-node-<?php echo $id; ?> .carousel-nav .carousel-cell {
    height: <?php echo $settings->nav_slider_height; ?>px;
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


.fl-node-<?php echo $id; ?> .carousel-text-content{
    margin-bottom: 0 !important;
    <?php if( $settings->slider_text_vertical_align === '0' || $settings->slider_text_vertical_align === '50%' ){ ?>
    
    top: <?php echo $settings->slider_text_vertical_align; ?>;
    
    <?php } else if( $settings->slider_text_vertical_align === '100%' ) { ?>
    
    bottom: 0;    
    
    <?php } ?>
    
    <?php if($settings->slider_text_vertical_align === '50%' ){ ?>
    
    transform: translateY(-50%);
    
    <?php } ?>
    
    
}

<?php 

FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'slider_text_typography',
	'selector' 	=> ".fl-node-$id .carousel-text-content",
) );


FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .carousel-text-content",
	'props'    => array(
		'color' => $settings->slider_text_color,
	),
) );

?>

.fl-node-<?php echo $id; ?> .carousel-main .flickity-viewport::before{
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-image: <?php echo FLBuilderColor::gradient( $settings->slider_overlay_color ); ?>;
    z-index: 1;
}

.fl-node-<?php echo $id; ?> .carousel-cell:not(.navigation-cell){
    <?php if ( $settings->wrap_round == true ) {?>
    width: 66%;
    <?php }?>
    margin-right: <?php echo $settings->gap_between; ?>px;
}  
