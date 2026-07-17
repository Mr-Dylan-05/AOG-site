<?php

/**
 * Handles logic for inserting singular theme layouts as
 * templates in the custom template select in wp-admin.
 *
 * @since 1.0
 */
final class FLThemeBuilderRulesCustomTemplate {

	const FL_THEME_BUILDER_TEMPLATE_DIR = FL_THEME_BUILDER_DIR . 'themer-templates/';

	/**
	 * Initialize hooks.
	 *
	 * @since 1.1
	 * @return void
	 */
	static public function init() {
		add_action( 'current_screen', __CLASS__ . '::init_template_menu' );
		add_action( 'save_post', __CLASS__ . '::admin_edit_save' );
		add_action( 'rest_api_init', __CLASS__ . '::add_allowed_templates' );

		add_filter( 'template_include', __CLASS__ . '::apply_themer_custom_template' );
	}


	/**
	 * Initialize the template menu for adding our custom templates.
	 *
	 * @since 1.1
	 * @return void
	 */
	static public function init_template_menu() {
		if ( ! is_admin() || ! function_exists( 'get_current_screen' ) ) {
			return;
		}

		$screen = get_current_screen();

		if ( isset( $screen->post_type ) ) {
			add_filter( 'theme_templates', __CLASS__ . '::add_template_menu', 10, 4 );
		}
	}

	/**
	 * Adds our custom templates to the template menu.
	 *
	 * @since 1.1
	 * @param array $templates
	 * @return array
	 */
	static public function add_template_menu( $templates, $theme, $post, $post_type ) {

		$args = array(
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'post_type'      => 'fl-theme-layout',
			'meta_key'       => '_fl_theme_builder_custom_template_rules',
		);

		$results = new WP_Query( $args );

		if ( ! empty( $results->posts ) ) {
			foreach ( $results->posts as $post_id ) {
				$post_types = self::get_saved( $post_id );
				if ( in_array( $post_type, $post_types ) ) {
					$templates[ 'fl-theme-layout-' . $post_id ] = get_the_title( $post_id );
				}
			}
		}

		wp_reset_postdata();
		return $templates;
	}

	/**
	 * Returns the custom template rules for a post.
	 *
	 * @since 1.1
	 * @param int $post_id
	 * @return array
	 */
	static public function get_saved( $post_id ) {
		$rules = get_post_meta( $post_id, '_fl_theme_builder_custom_template_rules', true );

		return ! $rules ? array() : $rules;
	}

	/**
	 * Updates the custom template rules for a post.
	 *
	 * @since 1.1
	 * @param int   $post_id
	 * @param array $rules
	 * @return void
	 */
	static public function update_saved( $post_id, $rules ) {
		update_post_meta( $post_id, '_fl_theme_builder_custom_template_rules', $rules );
	}

	/**
	 * Renders the meta box settings for user rules.
	 *
	 * @since 1.0
	 * @return void
	 */
	static public function render_admin_edit_settings() {
		global $post;

		$saved      = self::get_saved( $post->ID );
		$options    = array();
		$post_types = get_post_types( array(
			'public' => true,
		), 'objects' );

		foreach ( $post_types as $slug => $object ) {
			if ( in_array( $slug, array( 'fl-builder-template', 'fl-theme-layout' ) ) ) {
				continue;
			}
			$options[ $slug ] = $object->label;
		}

		include FL_THEME_BUILDER_DIR . 'includes/admin-edit-custom-template-rules.php';
	}

	/**
	 * Saves user rules set on the admin edit screen.
	 *
	 * @since 1.0
	 * @return void
	 */
	static public function admin_edit_save() {
		if ( ! FLBuilderUserAccess::current_user_can( 'theme_builder_editing' ) ) {
			return;
		}
		if ( ! isset( $_POST['fl-theme-builder-nonce'] ) ) {
			return;
		}
		if ( ! wp_verify_nonce( $_POST['fl-theme-builder-nonce'], 'fl-theme-builder' ) ) {
			return;
		}

		if ( ! isset( $_POST['fl-theme-builder-custom-template-rules'] ) || ! is_array( $_POST['fl-theme-builder-custom-template-rules'] ) ) {
			$rules = array();
		} else {
			$rules = stripslashes_deep( $_POST['fl-theme-builder-custom-template-rules'] );
		}

		$post_id = absint( $_POST['post_ID'] );

		self::update_saved( $post_id, $rules );
	}

	/**
	 * Apply selected Themer template to the post/page.
	 *
	 * @since 1.5
	 * @return void
	 */
	static public function apply_themer_custom_template( $template ) {
		global $post;

		if ( empty( $post ) || ! is_singular() ) {
			return $template;
		}

		$meta = get_post_meta( $post->ID );
		if ( empty( $meta ) || empty( $meta['_wp_page_template'] ) ) {
			return $template;
		}

		$page_template = $meta['_wp_page_template'][0];
		if ( empty( $page_template ) ) {
			return $template;
		}

		$themer_layout_id     = absint( str_replace( 'fl-theme-layout-', '', $page_template ) );
		$themer_layout_status = get_post_status( $themer_layout_id );
		if ( 'publish' !== $themer_layout_status ) {
			return $template;
		}

		$rules_data = get_post_meta( $themer_layout_id, '_fl_theme_builder_custom_template_rules' );
		if ( empty( $rules_data ) ) {
			return $template;
		}

		$custom_template_post_types = $rules_data[0];
		if ( in_array( $post->post_type, $custom_template_post_types ) ) {
			FLThemeBuilderLayoutRenderer::render_all( $themer_layout_id );
			die();
		}

		return $template;
	}

	/**
	 * Make sure the custom templates are in the list of allowed templates.
	 *
	 * @since 1.5
	 * @return void
	 */
	static public function add_allowed_templates() {
		$is_admin      = is_admin();
		$is_rest_route = defined( 'REST_REQUEST' ) && REST_REQUEST;

		$add_template = ( $is_admin && ! $is_rest_route ) || ( ! $is_admin && $is_rest_route );
		if ( $add_template ) {
			add_filter( 'theme_templates', __CLASS__ . '::add_template_menu', 10, 4 );
		}
	}
}

FLThemeBuilderRulesCustomTemplate::init();
