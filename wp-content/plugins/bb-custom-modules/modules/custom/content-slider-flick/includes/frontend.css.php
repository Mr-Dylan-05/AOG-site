<?php 

// Content Background Color
FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .flickity-viewport",
	'props'    => array(
		'background-color' => $settings->content_bg_color,
	),
) );

// Content Background Photo
FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .flickity-viewport",
	'props'    => array(
		'background-image' => $settings->content_bg_photo_src,
		'background-size'   => 'cover',
		'background-repeat' => 'no-repeat',
		'background-position'   => 'center'
	),
) );

// Content Background Gradient
FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .flickity-viewport",
	'props'    => array(
		'background-image' => FLBuilderColor::gradient( $settings->my_gradient ),
	),
) );

// Heading
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'slider_text_typography',
	'selector' 	=> ".fl-node-$id .carousel-heading",
) );
FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .carousel-heading",
	'props'    => array(
		'color' => $settings->slider_text_color,
	),
) );

// Content
FLBuilderCSS::typography_field_rule( array(
	'settings'	=> $settings,
	'setting_name' 	=> 'slider_content_typography',
	'selector' 	=> ".fl-node-$id .carousel-content",
) );
FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .carousel-content",
	'props'    => array(
		'color' => $settings->slider_content_color,
	),
) );

?>

.fl-node-<?php echo $id; ?> .carousel-cell:not(.navigation-cell){
    <?php if ( $settings->height_type === 'full_height' ){ ?>  
    height: 100vh; 
    <?php } else if( $settings->height_type === 'min_height' ) { ?>
    min-height: <?php echo $settings->content_min_height; echo $settings->content_min_height_unit; ?>;
    <?php } else if( $settings->height_type === 'custom_height' ){?>
    height: <?php echo $settings->content_custom_height; echo $settings->content_custom_height_unit;?>;
    <?php } ?>
    margin-right: <?php echo $settings->gap_between; ?>px;
}  
