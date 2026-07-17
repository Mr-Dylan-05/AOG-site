<?php
/**
 * Uninstall: remove the single option key.
 *
 * @package WPSL
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'wpsl_site_token' );
