<?php	
$output = '<div class="'.$module->get_classname().' owl-carousel '.$settings->height.' '.$settings->loop_animation.'">';
	for($i = 0; $i < count($settings->items); $i++) : if(!is_object($settings->items[$i])) continue;
		$mobile_bg = '';
		if ( !empty( $settings->items[$i]->slider_bg_image_mobile ) ) {
			$mobile_bg = ' mobile-bg-enable';
		}
		$img_delay 			= ' animation-delay-01';
		$title_delay 		= ' animation-delay-05';
		$desc_delay 		= ' animation-delay-10';
		$btn_title_delay 	= ' animation-delay-15';
		$btn_delay 			= ' animation-delay-20';
		$img_delay_bottom 	= ' animation-delay-25';
		if ( $settings->loop_animation == 'slide' ) {
			$img_delay 			= ' animation-delay-10';
			$title_delay 		= ' animation-delay-15';
			$desc_delay 		= ' animation-delay-20';
			$btn_title_delay 	= ' animation-delay-25';
			$btn_delay 			= ' animation-delay-30';
			$img_delay_bottom 	= ' animation-delay-35';
		}
		if ($settings->items[$i]->slider_style == 'left' ) {
			$animation = ' animation owl_ani_right-to-left';
		} else if ($settings->items[$i]->slider_style == 'right' ) {
			$animation = ' animation owl_ani_left-to-right';
		} else {
			$animation = ' animation owl_ani_appear';
		}
		$slideImage = $slideBottomImage = '';
		if ( !empty( $settings->items[$i]->slider_image ) ) $slideImage = ' slide-image-enable';
		if ( !empty( $settings->items[$i]->slider_bottom_image ) ) $slideBottomImage = ' slide-image-bottom-enable';
		if ( !empty( $settings->items[$i]->slider_bg_offset ) ) $sliderBGoffset = ' slider-bg-offset';
		$output .= '<div class="slide-item slide-'.($i+1).' '.$settings->items[$i]->slider_style.$mobile_bg.$sliderBGoffset.'">';
				$output .= '<div class="fl-row-fixed-width">';
					$output .= '<div class="slider-info'.$slideImage.$slideBottomImage.'">';
						$output .='<div class="slider-info-content">';
						    if ( !empty( $settings->items[$i]->slider_image ) ) {
    							$output .='<div class="slider-image'.$animation.$img_delay.'"><img src="'.$settings->items[$i]->slider_image_src.'" alt="'.$settings->items[$i]->slider_title.'"></div>';
    						}
							if ( !empty( $settings->items[$i]->slider_video_button ) ) {
								$output .= '<a href="'.$settings->items[$i]->slider_video_button.'" class="slider-video-button" aria-label="Play Video"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="105px" height="105px"> <path fill-rule="evenodd"  stroke="rgb(255, 255, 255)" stroke-width="5px" stroke-linecap="butt" stroke-linejoin="miter" fill="none" d="M52.500,2.500 C80.114,2.500 102.500,24.885 102.500,52.500 C102.500,80.114 80.114,102.500 52.500,102.500 C24.886,102.500 2.500,80.114 2.500,52.500 C2.500,24.885 24.886,2.500 52.500,2.500 Z"/> <path fill-rule="evenodd"  fill="rgb(255, 255, 255)" d="M70.968,54.639 L45.065,70.061 C44.589,70.351 44.065,70.495 43.541,70.495 C43.018,70.495 42.494,70.351 42.018,70.110 C41.065,69.531 40.494,68.519 40.494,67.411 L40.494,36.566 C40.494,35.457 41.065,34.445 42.018,33.867 C42.970,33.337 44.160,33.337 45.065,33.915 L70.968,49.337 C71.921,49.868 72.492,50.880 72.492,51.988 C72.492,53.097 71.921,54.109 70.968,54.639 Z"/></svg></a>';
							}
							if ( !empty( $settings->items[$i]->slider_prefix ) ) {
								$desc = '';
								if ( empty( $settings->items[$i]->slider_text ) ) { $desc =' no-desc'; }
								$output .='<span class="slider-prefix'.$animation.$desc.$title_delay.'">'.$settings->items[$i]->slider_prefix.'</span>';
							}
                            if ( !empty( $settings->items[$i]->slider_title ) ) {
								$desc = '';
								if ( empty( $settings->items[$i]->slider_text ) ) { $desc =' no-desc'; }
								$output .='<h2 class="slider-title'.$animation.$desc.$title_delay.'">'.$settings->items[$i]->slider_title.'</h2>';
							}
							if ( !empty( $settings->items[$i]->slider_text ) ) {
								$output .='<p class="slider-text'.$animation.$desc_delay.'">';
									$output .= $settings->items[$i]->slider_text;
								$output .='</p>';
							}
							if ( !empty( $settings->items[$i]->slider_btn_title ) ) {
								$output .='<h3 class="slider-button-title'.$animation.$btn_title_delay.'">'.$settings->items[$i]->slider_btn_title.'</h3>';
							}
							if ( !empty( $settings->items[$i]->slider_btn_1_link ) ) {
								$output .='<div class="display-inline'.$animation.$btn_delay.'">';
									$output .='<a class="slider-button btn btn-lg btn-rounded slider-button-1 highlight" href="'.$settings->items[$i]->slider_btn_1_link.'" title="'.$settings->items[$i]->slider_btn_1_label.'">'.$settings->items[$i]->slider_btn_1_label.'</a>';
								$output .='</div>';
							}
							if ( !empty( $settings->items[$i]->slider_btn_2_link ) ) {
								$output .='<div class="display-inline'.$animation.$btn_delay.'">';
									$output .='<a class="slider-button btn btn-lg btn-rounded slider-button-2" href="'.$settings->items[$i]->slider_btn_2_link.'" title="'.$settings->items[$i]->slider_btn_2_label.'">'.$settings->items[$i]->slider_btn_2_label.'</a>';
								$output .='</div>';
							}
							if ( !empty( $settings->items[$i]->slider_bottom_image ) ) {
								$output .='<div class="slider-image-bottom'.$animation.$img_delay_bottom.'"><img src="'.$settings->items[$i]->slider_bottom_image_src.'" alt="'.$settings->items[$i]->slider_title.'"></div>';
							}
						$output .='</div>';
						if ( $settings->items[$i]->slider_scroller === 'true' ) {
							$output .='<a class="slider-scroller" href="#'.$settings->items[$i]->slider_scroller_target.'"><svg width="25px" height="42px"> <path fill-rule="evenodd"  stroke="rgb(255, 255, 255)" stroke-width="2px" stroke-linecap="butt" stroke-linejoin="miter" fill="none" d="M12.000,1.000 C18.075,1.000 23.000,5.925 23.000,12.000 L23.000,29.000 C23.000,35.075 18.075,40.000 12.000,40.000 C5.925,40.000 1.000,35.075 1.000,29.000 L1.000,12.000 C1.000,5.925 5.925,1.000 12.000,1.000 Z"/> <path fill-rule="evenodd"  fill="rgb(88, 91, 96)" d="M12.500,9.000 C13.328,9.000 14.000,9.672 14.000,10.500 L14.000,18.500 C14.000,19.328 13.328,20.000 12.500,20.000 C11.672,20.000 11.000,19.328 11.000,18.500 L11.000,10.500 C11.000,9.672 11.672,9.000 12.500,9.000 Z"/></svg></a>';
						}
					$output .= '</div>';
				$output .= '</div>';
		$output .= '</div>';
	endfor;
$output .= '</div>';
echo $output;
?>