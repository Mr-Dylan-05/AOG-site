<?php

// Clock Height
FLBuilderCSS::responsive_rule( array(
	'settings'     => $settings,
	'setting_name' => 'size',
	'selector'     => ".fl-node-$id .fl-module-content .hero-circle",
	'prop'         => 'height',
) );

// Clock Width
FLBuilderCSS::responsive_rule( array(
	'settings'     => $settings,
	'setting_name' => 'size',
	'selector'     => ".fl-node-$id .fl-module-content .hero-circle",
	'prop'         => 'width',
) );

// Clock Background & Border Colors

if( $settings->clock_bg_type === 'color' ){
    FLBuilderCSS::rule( array(
    	'selector' => ".fl-node-$id .fl-module-content .hero-circle",
    	'props'    => array(
    		'background-color' => $settings->clock_bg_color,
    	),
    ) );
}
else if( $settings->clock_bg_type === 'gradient' ){
    FLBuilderCSS::rule( array(
    	'selector' => ".fl-node-$id .fl-module-content .hero-circle",
    	'props'    => array(
    		'background-image' => FLBuilderColor::gradient( $settings->clock_gradient_color ) ,
    	),
    ) );
}
else if( $settings->clock_bg_type === 'image' ){
    FLBuilderCSS::rule( array(
    	'selector' => ".fl-node-$id .fl-module-content .hero-circle",
    	'props'    => array(
    		'background-image' => $settings->clock_image_bg_src,
    	),
    ) );
    
    ?>
    
    .fl-node-<?php echo $id; ?> .fl-module-content .hero-circle{
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
    }
    
    
    <?php
}

FLBuilderCSS::border_field_rule( array(
	'settings' 	=> $settings,
	'setting_name' 	=> 'clock_border_color',
	'selector' 	=> ".fl-node-$id .fl-module-content .hero-circle",
) );


// Clock Hour Colors
FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .fl-module-content .hero-hour",
	'props'    => array(
		'background-color' => $settings->hour_color,
	),
) );

// Clock Minute Colors
FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .fl-module-content .hero-minute",
	'props'    => array(
		'background-color' => $settings->minute_color,
	),
) );

// Clock Seconds Colors
FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .fl-module-content .hero-second",
	'props'    => array(
		'background-color' => $settings->second_color,
	),
) );

foreach ( array( '', 'medium', 'responsive' ) as $device ) {

	$key      = empty( $device ) ? 'size' : "size_{$device}";
	$unit_key = "{$key}_unit";

	if ( isset( $settings->{ $key } ) && ! empty( $settings->{ $key } ) ) {

		if ( $settings->bg_color ) {
			FLBuilderCSS::rule( array(
				'media'    => $device,
				'selector' => ".fl-node-$id .fl-module-content .fl-icon i",
				'props'    => array(
					'line-height' => array(
						'value' => $settings->{ $key } * 1.75,
						'unit'  => $settings->{ $unit_key },
					),
					'height'      => array(
						'value' => $settings->{ $key } * 1.75,
						'unit'  => $settings->{ $unit_key },
					),
					'width'       => array(
						'value' => $settings->{ $key } * 1.75,
						'unit'  => $settings->{ $unit_key },
					),
				),
			) );
			FLBuilderCSS::rule( array(
				'media'    => $device,
				'selector' => ".fl-node-$id .fl-module-content .fl-icon i::before",
				'props'    => array(
					'line-height' => array(
						'value' => $settings->{ $key } * 1.75,
						'unit'  => $settings->{ $unit_key },
					),
				),
			) );
		}
	}
}

// Digital Clock Alignment
FLBuilderCSS::responsive_rule( array(
	'settings'     => $settings,
	'setting_name' => 'time_text_align',
	'selector'     => ".fl-node-$id .custom-time-cont",
	'prop'         => 'margin',
) );

// Clock Icon Alignment
FLBuilderCSS::responsive_rule( array(
	'settings'     => $settings,
	'setting_name' => 'time_align',
	'selector'     => ".fl-node-$id .hero-circle",
	'prop'         => 'margin',
) );


// Text Color
FLBuilderCSS::rule( array(
	'selector' => ".fl-node-$id .fl-icon-text, .fl-node-$id .fl-icon-text-link",
	'props'    => array(
		'color' => $settings->text_color,
	),
) );

// Text Typography
FLBuilderCSS::typography_field_rule( array(
	'selector'     => ".fl-node-$id .ampm-container",
	'setting_name' => 'ampm_typography',
	'settings'     => $settings,
) );

// AMPM Typography
FLBuilderCSS::typography_field_rule( array(
	'selector'     => ".fl-node-$id span.time-flex",
	'setting_name' => 'text_typography',
	'settings'     => $settings,
) );


// Background and border colors
if ( $settings->three_d ) {
	$bg_grad_start = FLBuilderColor::adjust_brightness( $settings->bg_color, 30, 'lighten' );
	$border_color  = FLBuilderColor::adjust_brightness( $settings->bg_color, 20, 'darken' );
}
if ( $settings->three_d && ! empty( $settings->bg_hover_color ) ) {
	$bg_hover_grad_start = FLBuilderColor::adjust_brightness( $settings->bg_hover_color, 30, 'lighten' );
	$border_hover_color  = FLBuilderColor::adjust_brightness( $settings->bg_hover_color, 20, 'darken' );
}

?>
<?php if ( $settings->color ) : ?>
.fl-node-<?php echo $id; ?> .fl-module-content .fl-icon i,
.fl-node-<?php echo $id; ?> .fl-module-content .fl-icon i:before {
	color: <?php echo FLBuilderColor::hex_or_rgb( $settings->color ); ?>;
}
<?php endif; ?>
<?php if ( $settings->bg_color ) : ?>
.fl-node-<?php echo $id; ?> .fl-module-content .fl-icon i {
	background: <?php echo FLBuilderColor::hex_or_rgb( $settings->bg_color ); ?>;
	border-radius: 100%;
	-moz-border-radius: 100%;
	-webkit-border-radius: 100%;
	text-align: center;
	<?php if ( $settings->three_d ) : ?>
	background: linear-gradient(to bottom,  <?php echo FLBuilderColor::hex_or_rgb( $bg_grad_start ); ?> 0%, <?php echo FLBuilderColor::hex_or_rgb( $settings->bg_color ); ?> 100%);
	border: 1px solid <?php echo FLBuilderColor::hex_or_rgb( $border_color ); ?>;
	<?php endif; ?>
}
<?php endif; ?>
<?php if ( ! empty( $settings->hover_color ) ) : ?>
.fl-node-<?php echo $id; ?> .fl-module-content .fl-icon i:hover,
.fl-node-<?php echo $id; ?> .fl-module-content .fl-icon i:hover:before,
.fl-node-<?php echo $id; ?> .fl-module-content .fl-icon a:hover i,
.fl-node-<?php echo $id; ?> .fl-module-content .fl-icon a:hover i:before {
	color: <?php echo FLBuilderColor::hex_or_rgb( $settings->hover_color ); ?>;
}
<?php endif; ?>
<?php if ( ! empty( $settings->bg_hover_color ) ) : ?>
.fl-node-<?php echo $id; ?> .fl-module-content .fl-icon i:hover,
.fl-node-<?php echo $id; ?> .fl-module-content .fl-icon a:hover i {
	background: <?php echo FLBuilderColor::hex_or_rgb( $settings->bg_hover_color ); ?>;
	<?php if ( $settings->three_d ) : ?>
	background: linear-gradient(to bottom,  <?php echo FLBuilderColor::hex_or_rgb( $bg_hover_grad_start ); ?> 0%, <?php echo FLBuilderColor::hex_or_rgb( $settings->bg_hover_color ); ?> 100%);
	border: 1px solid <?php echo FLBuilderColor::hex_or_rgb( $border_hover_color ); ?>;
	<?php endif; ?>
}
<?php endif; ?>

<?php if( !empty( $settings->ampm_vertical_align ) ) : ?>
.fl-node-<?php echo $id; ?> .fl-module-content .ampm-container{
    vertical-align: <?php echo $settings->ampm_vertical_align; ?>;
}
<?php endif; ?>
