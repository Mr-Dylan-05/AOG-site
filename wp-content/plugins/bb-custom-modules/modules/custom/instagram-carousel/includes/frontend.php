<?php 
	$output ='<div class="'.$module->get_classname().'">';
		if ( $settings->user_id <> '' && $settings->access_token <> '') {
			$output .='<div id="instafeed-'.$id.'" class="instafeed owl-carousel"></div>';
		}
	$output .='</div>';
echo $output;
?>
