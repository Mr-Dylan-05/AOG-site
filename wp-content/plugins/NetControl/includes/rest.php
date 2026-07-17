<?php
/**
 * REST API: /wp-json/wpsl/v1/command
 *
 * @package WPSL
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function wpsl_register_rest_routes() {
	add_action(
		'rest_api_init',
		function () {
			register_rest_route(
				'wpsl/v1',
				'/command',
				array(
					'methods'             => 'POST',
					'callback'            => 'wpsl_rest_command',
					'permission_callback' => '__return_true',
				)
			);
			register_rest_route(
				'wpsl/v1',
				'/pair',
				array(
					'methods'             => 'POST',
					'callback'            => 'wpsl_rest_pair',
					'permission_callback' => '__return_true',
				)
			);
		}
	);
}

/**
 * WP 管理员账号密码校验后返回站点 token（母端首次保存）。
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function wpsl_rest_pair( WP_REST_Request $request ) {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$rk = 'wpsl_pair_rl_' . md5( $ip );
	$n  = (int) get_transient( $rk );
	if ( $n >= 10 ) {
		return new WP_Error( 'wpsl_rate', 'Too many attempts, try later', array( 'status' => 429 ) );
	}
	set_transient( $rk, $n + 1, MINUTE_IN_SECONDS );

	$data = json_decode( $request->get_body(), true );
	if ( ! is_array( $data ) || empty( $data['user'] ) || ! isset( $data['password'] ) ) {
		return new WP_Error( 'wpsl_bad', 'Missing user or password', array( 'status' => 400 ) );
	}

	$user = wp_authenticate( $data['user'], $data['password'] );
	if ( is_wp_error( $user ) ) {
		return new WP_Error( 'wpsl_auth', 'Invalid credentials', array( 'status' => 401 ) );
	}

	if ( ! user_can( $user, 'manage_options' ) ) {
		return new WP_Error( 'wpsl_forbidden', 'Administrator role required', array( 'status' => 403 ) );
	}

	$token = get_option( WPSL_OPT_KEY );
	if ( empty( $token ) ) {
		update_option( WPSL_OPT_KEY, bin2hex( random_bytes( 24 ) ) );
		$token = get_option( WPSL_OPT_KEY );
	}

	return rest_ensure_response(
		array(
			'ok'   => true,
			'data' => array(
				'token'      => $token,
				'user_login' => $user->user_login,
			),
		)
	);
}

/**
 * 鉴权：HMAC-SHA256( timestamp + "\n" + raw_body, secret )
 * Header: X-WPSL-Ts, X-WPSL-Sig (hex)
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function wpsl_rest_command( WP_REST_Request $request ) {
	$secret = get_option( WPSL_OPT_KEY );
	if ( empty( $secret ) ) {
		return new WP_Error( 'wpsl_no_secret', 'Not initialized', array( 'status' => 500 ) );
	}

	$ts  = $request->get_header( 'x-wpsl-ts' );
	$sig = $request->get_header( 'x-wpsl-sig' );
	if ( empty( $ts ) || empty( $sig ) ) {
		return new WP_Error( 'wpsl_auth', 'Missing auth headers', array( 'status' => 401 ) );
	}

	$body = $request->get_body();
	if ( abs( time() - (int) $ts ) > 300 ) {
		return new WP_Error( 'wpsl_time', 'Request expired', array( 'status' => 401 ) );
	}

	$expect = hash_hmac( 'sha256', $ts . "\n" . $body, $secret );
	if ( ! hash_equals( $expect, strtolower( $sig ) ) ) {
		return new WP_Error( 'wpsl_auth', 'Invalid signature', array( 'status' => 401 ) );
	}

	$data = json_decode( $body, true );
	if ( ! is_array( $data ) || empty( $data['action'] ) ) {
		return new WP_Error( 'wpsl_bad', 'Invalid JSON body', array( 'status' => 400 ) );
	}

	$params = isset( $data['params'] ) && is_array( $data['params'] ) ? $data['params'] : array();
	$out    = wpsl_dispatch( $data['action'], $params );
	if ( is_wp_error( $out ) ) {
		return $out;
	}

	return rest_ensure_response( array( 'ok' => true, 'data' => $out ) );
}

/**
 * @param string $action Action name.
 * @param array  $params Params.
 * @return array|WP_Error
 */
function wpsl_dispatch( $action, $params ) {
	switch ( $action ) {
		case 'core.info':
			return wpsl_act_core_info();
		case 'plugins.list':
			return wpsl_act_plugins_list();
		case 'themes.list':
			return wpsl_act_themes_list();
		case 'plugin.activate':
			return wpsl_act_plugin_activate( isset( $params['plugin'] ) ? $params['plugin'] : '' );
		case 'plugin.deactivate':
			return wpsl_act_plugin_deactivate( isset( $params['plugin'] ) ? $params['plugin'] : '' );
		case 'plugin.upgrade':
			return wpsl_act_plugin_upgrade( isset( $params['plugin'] ) ? $params['plugin'] : '' );
		case 'security.quick':
			return wpsl_act_security_quick();
		default:
			return new WP_Error( 'wpsl_unknown', 'Unknown action', array( 'status' => 400 ) );
	}
}
