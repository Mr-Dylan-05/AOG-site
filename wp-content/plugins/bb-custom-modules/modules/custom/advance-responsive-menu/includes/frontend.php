<div id="main" class="<?php $module->get_classname(); ?> clearfix">
	
    <?php echo $module->get_menu( $settings, $module ); ?>
    
    <button id="responsive-menu" class="hamburger <?php echo $settings->animation; ?>" type="button">
        <span class="hamburger-box">
            <span class="hamburger-inner"></span>
        </span>
    </button>
</div>

<nav id="responsive-menu-wrapper">
    <?php
        if( $settings->partial_full === 'partial' ) {?>
            <div id="responsive-menu-inner">
                <?php echo $module->get_menu( $settings, $module ); ?>
            </div>
    <?php } ?>

    <div id="responsive-row-content">
        <?php 
    		$content_type = $settings->content_type;
    		switch ( $content_type ) {
    			case 'content':
    				global $wp_embed;
    				echo wpautop( $wp_embed->autoembed( $settings->ct_content ) );
    			break;
    			case 'photo':
    				if ( isset( $settings->ct_photo_src ) ) {
    					echo '<img src="' . $settings->ct_photo_src . '" />';
    				}
    				echo '<img src="" />';
    			break;
    			case 'video':
    				global $wp_embed;
    				return $wp_embed->autoembed( $settings->ct_video );
    			break;
    			case 'saved_rows':
    				// ob_start();
    				echo '[fl_builder_insert_layout id="' . $settings->ct_saved_rows . '" type="fl-builder-template"]';
    				// return ob_get_clean();
    			case 'saved_modules':
    				// ob_start();
    				echo '[fl_builder_insert_layout id="' . $settings->ct_saved_modules . '" type="fl-builder-template"]';
    				// return ob_get_clean();
    			case 'saved_page_templates':
    				// ob_start();
    				echo '[fl_builder_insert_layout id="' . $settings->ct_page_templates . '" type="fl-builder-template"]';
    				// return ob_get_clean();
    			break;
    			default:
    				return;
    			break;
    		}
        ?>
    </div>
</nav>