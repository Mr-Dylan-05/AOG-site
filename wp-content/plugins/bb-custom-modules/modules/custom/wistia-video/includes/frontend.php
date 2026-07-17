<div class="fl-video fl-wistia-video">
    <div class="wistia-container">
    	<?php
    
    	global $wp_embed;
    	    if( !empty( $settings->wistia_id ) && !$settings->autoplay && !$settings->visible_control ){
    	        echo $wp_embed->autoembed( 'https://fast.wistia.net/embed/iframe/'. trim($settings->wistia_id) );
    	    }
    	    else if( !empty( $settings->wistia_id ) && $settings->autoplay && !$settings->visible_control ){
    	        echo $wp_embed->autoembed( 'https://fast.wistia.net/embed/iframe/'. trim($settings->wistia_id) .'?&autoPlay='.$settings->autoplay );
    	    }
    	    else{
    	        echo $wp_embed->autoembed( 'https://fast.wistia.net/embed/iframe/'. trim($settings->wistia_id) .'?&autoPlay='.$settings->autoplay.'&controlsVisibleOnLoad='.$settings->visible_control );
    	    }
            
    	?>
	</div>
</div>
