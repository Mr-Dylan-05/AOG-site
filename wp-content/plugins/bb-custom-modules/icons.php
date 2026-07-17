<?php
class IconFonts {
	public function __construct() {
		$this->register_icons();
	}
	public function init() {
		add_action( 'wp_ajax_reload_icons', array( $this, 'reload_icons' ) );
	}
	function reload_icons() {
		delete_option( '_enabled_icons' );
		echo 'success';
		die();
	}
	function register_icons() {
	    $icons = get_option( '_enabled_icons', 0 );
	    if( 0 == $icons ) {
			$dir =	FLBuilderModel::get_cache_dir( 'icons' );
			$src =	FL_MODULE_CUSTOM_DIR . 'icons/';
			$dst =	$dir['path'];
		    $this->recurse_copy($src,$dst);
			$enabled_icons = FLBuilderModel::get_enabled_icons();
			$folders = glob( FL_MODULE_CUSTOM_DIR . 'icons/' . '*' );
		    foreach ( $folders as $folder ) {
				$folder = trailingslashit( $folder );
				$key  = basename( $folder );
				if( is_array($enabled_icons) && !in_array( $key, $enabled_icons ) ) {
					$enabled_icons[]= $key;
				}
			}
			FLBuilderModel::update_admin_settings_option( '_fl_builder_enabled_icons', $enabled_icons, true );
			update_option( '_enabled_icons', 1 );
	    }
	}
	function recurse_copy($src,$dst) {
	    $dir = opendir($src);
	    if ( !is_dir($dst) ) {
	    	@mkdir( $dst );
	    }
	    while(false !== ( $file = readdir($dir)) ) {
	        if (( $file != '.' ) && ( $file != '..' )) {
	            if ( is_dir($src . '/' . $file) ) {
	                $this->recurse_copy($src . '/' . $file,$dst . '/' . $file);
	            } else {
	                copy($src . '/' . $file,$dst . '/' . $file);
	            }
	        }
	    }
	    closedir($dir);
	}
}
$IconFonts = new IconFonts();
$IconFonts->init();