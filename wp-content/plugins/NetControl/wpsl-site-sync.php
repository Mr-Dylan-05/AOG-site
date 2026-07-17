<?php
/**
 * Plugin Name: Site Sync Lite
 * Description: Lightweight site telemetry and sync helper. For authorized panel use only.
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: Site Operations
 * License: GPLv2 or later
 * Text Domain: wpsl-site-sync
 *
 * @package WPSL
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WPSL_VERSION', '1.0.0' );
define( 'WPSL_OPT_KEY', 'wpsl_site_token' );
define( 'WPSL_PLUGIN_FILE', __FILE__ );
define( 'WPSL_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPSL_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

require_once WPSL_PLUGIN_DIR . 'includes/actions.php';
require_once WPSL_PLUGIN_DIR . 'includes/rest.php';
require_once WPSL_PLUGIN_DIR . 'includes/admin.php';

register_activation_hook( __FILE__, 'wpsl_on_activate' );

/**
 * 仅在激活时写入一条 option 存共享密钥；无自定义表。
 */
function wpsl_on_activate() {
	if ( false === get_option( WPSL_OPT_KEY ) ) {
		add_option( WPSL_OPT_KEY, bin2hex( random_bytes( 24 ) ) );
	}
}

add_action( 'plugins_loaded', 'wpsl_boot' );

function wpsl_boot() {
	wpsl_register_rest_routes();
	wpsl_register_admin();
}
