<?php
/**
 * Settings page under Settings.
 *
 * @package WPSL
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function wpsl_register_admin() {
	add_action(
		'admin_menu',
		function () {
			add_options_page(
				'Site Sync Lite',
				'Site Sync Lite',
				'manage_options',
				'wpsl-site-sync',
				'wpsl_render_settings'
			);
		}
	);
}

function wpsl_render_settings() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	if ( isset( $_POST['wpsl_regenerate'] ) && check_admin_referer( 'wpsl_regenerate' ) ) {
		update_option( WPSL_OPT_KEY, bin2hex( random_bytes( 24 ) ) );
		echo '<div class="updated notice"><p>Token regenerated.</p></div>';
	}
	$token = get_option( WPSL_OPT_KEY );
	?>
	<div class="wrap">
		<h1>Site Sync Lite</h1>
		<p>Copy this token into your control panel. Keep it secret.</p>
		<p><input type="text" readonly class="large-text code" value="<?php echo esc_attr( $token ); ?>" onclick="this.select();" /></p>
		<form method="post">
			<?php wp_nonce_field( 'wpsl_regenerate' ); ?>
			<p><button type="submit" name="wpsl_regenerate" value="1" class="button">Regenerate token</button></p>
		</form>
	</div>
	<?php
}
