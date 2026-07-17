<?php
/**
 * Plugin Name: Fligno Builder Custom Modules
 * Description: Custom modules for Fligno Builder.
 * Version: 2.0
 * Author: <a href="https://fligno.com/" target="_blank">Fligno</a>
 */
define( 'BB_CUSTOM_MODULES_DIR', plugin_dir_path( __FILE__ ) );
define( 'BB_CUSTOM_MODULES_URL', plugins_url( '/', __FILE__ ) );

/**
 * Custom modules
 */

	function bb_load_custom_modules() {
        if ( class_exists( 'FLBuilder' ) ) {
            global $customcategory;
            $customcategory = 'Custom Modules';
            global $customDIR;
            $customDIR = 'custom';

            
            /*custom modules---------------------------------------------------*/
            
            /*header*/
            require_once 'modules/'.$customDIR.'/advance-responsive-menu/advance-responsive-menu.php';
            require_once 'modules/'.$customDIR.'/ez-search/ez-search.php';
            
            /*content*/
            require_once 'modules/'.$customDIR.'/text-advance/text-advance.php';
            require_once 'modules/'.$customDIR.'/downloadable-posts-list/downloadable-posts-list.php';
            require_once 'modules/'.$customDIR.'/teams/teams.php';
            require_once 'modules/'.$customDIR.'/teams-carousel/teams-carousel.php';
            require_once 'modules/'.$customDIR.'/testimonials-posttype/testimonials-posttype.php';
            require_once 'modules/'.$customDIR.'/typing-text/typing-text.php';
            require_once 'modules/'.$customDIR.'/slider-testimonials/slider-testimonials.php';
            
            /*media*/
            require_once 'modules/'.$customDIR.'/photo-advanced/photo-advanced.php';
            require_once 'modules/'.$customDIR.'/sound-play/sound-play.php';
            require_once 'modules/'.$customDIR.'/slider-gallery/slider-gallery.php';
            require_once 'modules/'.$customDIR.'/wistia-video/wistia-video.php';
            
            /*slider*/
            require_once 'modules/'.$customDIR.'/slider/slider.php';
            require_once 'modules/'.$customDIR.'/slider-banner/slider-banner.php';
            require_once 'modules/'.$customDIR.'/content-slider-flick/content-slider-flick.php';
            
            /*social media*/
            require_once 'modules/'.$customDIR.'/instagram-gridder/instagram-gridder.php';
            require_once 'modules/'.$customDIR.'/instagram-carousel/instagram-carousel.php';
            require_once 'modules/'.$customDIR.'/custom-facebook-feed/custom-facebook-feed.php';
            require_once 'modules/'.$customDIR.'/youtube-feed/youtube-feed.php';
            
            
            /*special*/
            require_once 'modules/'.$customDIR.'/devices-showcase/devices-showcase.php';
            require_once 'modules/'.$customDIR.'/analog-time/analog-time.php';
            require_once 'modules/'.$customDIR.'/bolos-slider-gallery/bolos-slider-gallery.php';
			require_once 'modules/'.$customDIR.'/circle-content/circle-content.php';
			
			/*aog modules*/
			require_once 'modules/'.$customDIR.'/aog-image-caption/aog-image-caption.php';
			require_once 'modules/'.$customDIR.'/aog-content-slider/aog-content-slider.php';
			require_once 'modules/'.$customDIR.'/aog-slider-testimonials/aog-slider-testimonials.php';
			require_once 'modules/'.$customDIR.'/aog-wistia-macbook/aog-wistia-macbook.php';
			require_once 'modules/'.$customDIR.'/aog-image-bgcaption/aog-image-bgcaption.php';
			require_once 'modules/'.$customDIR.'/aog-website-showcase/aog-website-showcase.php';
			require_once 'modules/'.$customDIR.'/aog-pricing-slider/aog-pricing-slider.php';
            

        }
	}
	add_action( 'init', 'bb_load_custom_modules' );

	/*Register Global CSS and JS*/
	wp_register_style( 'button-css', BB_CUSTOM_MODULES_URL.'assets/css/button.css' ); 
	wp_enqueue_style( 'fl-builder', BB_CUSTOM_MODULES_URL.'assets/css/fl-builder.css' );
	wp_enqueue_script( 'fl-builder', BB_CUSTOM_MODULES_URL . 'assets/js/fl-builder.js', array( 'jquery' ) );
    
	/*Custom fieldstype*/
	//include_once( BB_CUSTOM_MODULES_DIR . 'field/field_datedropper.php' ); 	/* 'type' => 'datedropper', */
	//include_once( BB_CUSTOM_MODULES_DIR . 'field/field_timedropper.php' ); 	/* 'type' => 'timedropper', */
	//include_once( BB_CUSTOM_MODULES_DIR . 'field/field_slider.php' ); 		/* 'type' => 'timedropper', */
	//include_once( BB_CUSTOM_MODULES_DIR . 'field/field_title.php' ); 			/* 'type' => 'title', */
	//include_once( BB_CUSTOM_MODULES_DIR . 'field/pdf/pdf-field.php' ); 		/* 'type' => 'pdf', output ID: used "wp_get_attachment_url( $settings->pdf_file )" */
	//include_once( BB_CUSTOM_MODULES_DIR . 'field/svg/svg-field.php' ); 		/* 'type' => 'svg', output ID: used "wp_get_attachment_url( $settings->svg_file )" */
	//include_once( BB_CUSTOM_MODULES_DIR . 'field/file/file-field.php' ); 		/* 'type' => 'file', output ID: used "wp_get_attachment_url( $settings->file )" */

	/*Custom Posttype*/
//	include_once( BB_CUSTOM_MODULES_DIR . 'posttype/posttype_attractions.php' );
//	include_once( BB_CUSTOM_MODULES_DIR . 'posttype/posttype_services.php' );
//	include_once( BB_CUSTOM_MODULES_DIR . 'posttype/posttype_facilities.php' );
	include_once( BB_CUSTOM_MODULES_DIR . 'posttype/posttype_team.php' );
	include_once( BB_CUSTOM_MODULES_DIR . 'posttype/posttype_portfolio.php' );
	include_once( BB_CUSTOM_MODULES_DIR . 'posttype/posttype_testimonials.php' );
//	include_once( BB_CUSTOM_MODULES_DIR . 'posttype/posttype_video.php' );
	include_once( BB_CUSTOM_MODULES_DIR . 'posttype/posttype_downloads.php' );
	include_once( BB_CUSTOM_MODULES_DIR . 'posttype/posttype_audio.php' );

	/*ext*/
//	if ( FL_BUILDER_LITE === false ) {
//		require_once( BB_CUSTOM_MODULES_DIR . 'ext/templates/templates.php' );
//	}

	//from WP repo BB clearcache
	class Delete_Cache_Admin_Bar {
		function __construct() {
			add_action( 'admin_bar_menu',			array( $this, 'fl_builder_sub_menu'		) );
			add_action( 'admin_post_purge_cache',	array( $this, 'fl_builder_clear_cache'	) );
		}
		function add_menu( $id, $title, $href = FALSE, $meta = FALSE, $parent = FALSE ) {
			global $wp_admin_bar;
			if ( ! is_super_admin() || ! is_admin_bar_showing() )
				return;
			$wp_admin_bar->add_menu( array(
				'id'		=> $id,
				'parent'	=> $parent,
				'title'		=> $title,
				'href'		=> $href,
				'meta'		=> $meta
			));
		}
		function add_sub_menu( $id, $parent, $title, $href, $meta = FALSE) {
			global $wp_admin_bar;
			if ( ! is_super_admin() || ! is_admin_bar_showing() )
				return;
			$wp_admin_bar->add_menu( array(
				'id'		=> $id,
				'parent'	=> $parent,
				'title'		=> $title,
				'href'		=> $href,
				'meta'		=> $meta
			));
		}
		public function fl_builder_sub_menu() {
			global $post;
			$referer = '&_wp_http_referer=' . urlencode( wp_unslash( $_SERVER['REQUEST_URI'] ) );
			$action  = 'purge_cache';
			if( !is_admin() ) {
				$this->add_sub_menu(
					'fl-builder-delete-url-cache',
					'fl-builder-frontend-edit-link',
					__('Clear Cache - This Page','fl-builder-delete-cache'),
					wp_nonce_url( admin_url( 'admin-post.php?action=' . $action . '&type=post-' . $post->ID . $referer ), $action . '_post-' . $post->ID )
				);
				$this->add_sub_menu(
					'fl-builder-delete-all-cache',
					'fl-builder-frontend-edit-link',
					__('Clear Cache - All Pages','fl-builder-delete-cache'),
					wp_nonce_url( admin_url( 'admin-post.php?action=' . $action . '&type=all' . $referer ), $action . '_all' )
				);
			}
		}
		public function fl_builder_clear_cache() {
			if ( isset( $_GET['type'], $_GET['_wpnonce'] ) ) {
				$_type     = explode( '-', $_GET['type'] );
				$_type     = reset( $_type );
				$_id       = explode( '-', $_GET['type'] );
				$_id       = end( $_id );
				if ( ! wp_verify_nonce( $_GET['_wpnonce'], 'purge_cache_' . $_GET['type'] ) ) {
					wp_nonce_ays( '' );
				}
				switch( $_type ) {
					case 'all':
						FLBuilderModel::delete_asset_cache_for_all_posts();
						break;
					case 'post':
						FLBuilderModel::delete_all_asset_cache( $_id );
						break;
					default:
						wp_nonce_ays( '' );
						break;
				}
				wp_redirect( wp_get_referer() );
				die();
			}
		}
	}
	add_action( "init", "Delete_Cache_Admin_Bar_init" );
	function Delete_Cache_Admin_Bar_init() {
		global $Delete_Cache_Admin_Bar_init;
		if( class_exists('FLBuilder') ) {
			$Delete_Cache_Admin_Bar_init = new Delete_Cache_Admin_Bar();
		}
	}
	
	/*other menu*/
	add_action('admin_bar_menu', 'menu_bar_pagebuilder', 999);
	function menu_bar_pagebuilder() {
		global $wp_admin_bar;
		$website = esc_url( home_url() );
		$menu_pagebuilder_id = 'fl-builder-frontend-edit-link';
		$wp_admin_bar->add_menu(array('parent' => $menu_pagebuilder_id, 'id' => 'fl-builder-frontend-modules', 'title' => 'Modules', 'href' => $website.'/wp-admin/options-general.php?page=fl-builder-settings#modules', 'meta'  => array( 'class' => 'menu-bar-builder-modules' ),));
		$wp_admin_bar->add_menu(array('parent' => $menu_pagebuilder_id, 'id' => 'fl-builder-frontend-posttypes', 'title' => 'Post Type', 'href' => $website.'/wp-admin/options-general.php?page=fl-builder-settings#post-types', 'meta'  => array( 'class' => 'menu-bar-builder-post-types' ),));
		$wp_admin_bar->add_menu(array('parent' => $menu_pagebuilder_id, 'id' => 'fl-builder-frontend-useraccess', 'title' => 'User Access', 'href' => $website.'/wp-admin/options-general.php?page=fl-builder-settings#user-access', 'meta'  => array( 'class' => 'menu-bar-builder-user-access' ),));
		$wp_admin_bar->add_menu(array('parent' => $menu_pagebuilder_id, 'id' => 'fl-builder-frontend-cache', 'title' => 'Tools', 'href' => $website.'/wp-admin/options-general.php?page=fl-builder-settings#tools', 'meta'  => array( 'class' => 'menu-bar-builder-cache' ),));
	}
//}