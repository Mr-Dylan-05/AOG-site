<?php
/**
 * Remote command handlers.
 *
 * @package WPSL
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function wpsl_act_core_info() {
	return array(
		'wp_version'   => get_bloginfo( 'version' ),
		'php_version'  => PHP_VERSION,
		'site_url'     => site_url(),
		'home_url'     => home_url(),
		'is_ssl'       => is_ssl(),
		'is_multisite' => is_multisite(),
		'content_dir'  => WP_CONTENT_DIR,
	);
}

function wpsl_act_plugins_list() {
	if ( ! function_exists( 'get_plugins' ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}
	$all = get_plugins();
	$out = array();
	foreach ( $all as $file => $p ) {
		$out[] = array(
			'file'    => $file,
			'name'    => $p['Name'],
			'version' => $p['Version'],
			'active'  => is_plugin_active( $file ),
		);
	}
	return array( 'plugins' => $out );
}

function wpsl_act_themes_list() {
	if ( ! function_exists( 'wp_get_themes' ) ) {
		require_once ABSPATH . 'wp-admin/includes/theme.php';
	}
	$themes = wp_get_themes();
	$out    = array();
	foreach ( $themes as $slug => $t ) {
		$out[] = array(
			'slug'      => $slug,
			'name'      => $t->get( 'Name' ),
			'version'   => $t->get( 'Version' ),
			'is_active' => ( (string) wp_get_theme()->get_stylesheet() === (string) $slug ),
		);
	}
	return array( 'themes' => $out );
}

function wpsl_first_admin_id() {
	$users = get_users(
		array(
			'role'    => 'administrator',
			'number'  => 1,
			'orderby' => 'ID',
			'order'   => 'ASC',
		)
	);
	if ( empty( $users ) ) {
		return 0;
	}
	return (int) $users[0]->ID;
}

function wpsl_act_plugin_activate( $plugin ) {
	$plugin = sanitize_text_field( $plugin );
	if ( $plugin === '' ) {
		return new WP_Error( 'wpsl_param', 'Missing plugin', array( 'status' => 400 ) );
	}
	$uid = wpsl_first_admin_id();
	if ( $uid < 1 ) {
		return new WP_Error( 'wpsl_no_admin', 'No administrator user', array( 'status' => 500 ) );
	}
	wp_set_current_user( $uid );
	if ( ! function_exists( 'activate_plugin' ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}
	$result = activate_plugin( $plugin, '', false, true );
	if ( is_wp_error( $result ) ) {
		return $result;
	}
	return array( 'activated' => $plugin );
}

function wpsl_act_plugin_deactivate( $plugin ) {
	$plugin = sanitize_text_field( $plugin );
	if ( $plugin === '' ) {
		return new WP_Error( 'wpsl_param', 'Missing plugin', array( 'status' => 400 ) );
	}
	$uid = wpsl_first_admin_id();
	if ( $uid < 1 ) {
		return new WP_Error( 'wpsl_no_admin', 'No administrator user', array( 'status' => 500 ) );
	}
	wp_set_current_user( $uid );
	if ( ! function_exists( 'deactivate_plugins' ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}
	deactivate_plugins( $plugin, true );
	return array( 'deactivated' => $plugin );
}

function wpsl_act_plugin_upgrade( $plugin ) {
	$plugin = sanitize_text_field( $plugin );
	if ( $plugin === '' ) {
		return new WP_Error( 'wpsl_param', 'Missing plugin', array( 'status' => 400 ) );
	}
	$uid = wpsl_first_admin_id();
	if ( $uid < 1 ) {
		return new WP_Error( 'wpsl_no_admin', 'No administrator user', array( 'status' => 500 ) );
	}
	wp_set_current_user( $uid );

	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/plugin.php';
	require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
	require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
	require_once ABSPATH . 'wp-admin/includes/misc.php';

	wp_cache_flush();
	$skin     = new Automatic_Upgrader_Skin();
	$upgrader = new Plugin_Upgrader( $skin );
	$r        = $upgrader->upgrade( $plugin );

	if ( is_wp_error( $r ) ) {
		return $r;
	}
	if ( false === $r ) {
		return new WP_Error( 'wpsl_upgrade', 'Upgrade failed', array( 'status' => 500 ) );
	}
	return array( 'upgraded' => $plugin, 'messages' => $skin->get_upgrade_messages() );
}

function wpsl_act_security_quick() {
	$checks = array(
		'wp_version'           => get_bloginfo( 'version' ),
		'php_version'          => PHP_VERSION,
		'is_ssl'               => is_ssl(),
		'file_edit_disabled'   => ( defined( 'DISALLOW_FILE_EDIT' ) && DISALLOW_FILE_EDIT ),
		'wp_debug'             => ( defined( 'WP_DEBUG' ) && WP_DEBUG ),
	);
	return array( 'checks' => $checks );
}
