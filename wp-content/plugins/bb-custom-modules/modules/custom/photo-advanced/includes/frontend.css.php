<?php if ( $settings->style == 'shadow' && !empty($settings->shadow_color) ) { ?>
	<?php 
		$horizontal = $settings->shadow_distance_x <> '' ? $settings->shadow_distance_x : '0';
		$vertical = $settings->shadow_distance_y <> '' ? $settings->shadow_distance_y : '0';
		$size = $settings->shadow_size <> '' ? $settings->shadow_size : '0';
		$color = '';
		if ( !empty($settings->shadow_color) && $settings->shadow_color_opacity <> '' ) {
			$color = 'rgba('. implode(',', FLBuilderColor::hex_to_rgb($settings->shadow_color)) .', '. $settings->shadow_color_opacity/100 .')';
		} else if ( !empty($settings->shadow_color) && $settings->shadow_color_opacity == '' ) {
			$color = '#'.$settings->shadow_color;
		}
	?>
	.fl-node-<?php echo $id; ?> .fl-photo-<?php echo $settings->style; ?> img{ 
		box-shadow: <?php echo $horizontal; ?>px <?php echo $vertical; ?>px <?php echo $size; ?>px <?php echo $color; ?>;
	}
<?php } ?>