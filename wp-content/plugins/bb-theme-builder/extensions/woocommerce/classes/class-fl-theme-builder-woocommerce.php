<?php

/**
 * WooCommerce support for the theme builder.
 *
 * @since 1.0
 */
final class FLThemeBuilderWooCommerce {

	/**
	 * @since 1.0
	 * @return void
	 */
	static public function init() {
		// As of WooCommerce 3.3.3, if we don't have this, things break.
		add_theme_support( 'woocommerce' );

		// Actions
		add_action( 'wp', __CLASS__ . '::load_modules', 1 );

		// Filters
		add_filter( 'fl_get_wp_widgets_exclude', __CLASS__ . '::filter_wp_widgets_exclude' );

		add_filter( 'fl_builder_loop_query_args', __CLASS__ . '::filter_visibility' );
		/**
		 * Disable attributes widget when viewing layouts.
		 */
		add_filter( 'fl_widget_module_output_disabled', function ( $enabled, $module, $widget_class ) {
			if ( 'WC_Widget_Layered_Nav' === $widget_class && strstr( $_SERVER['REQUEST_URI'], 'fl-theme-layout' ) ) {
				return 'Widget will render on actual archive';
			}
			return $enabled;
		}, 10, 3 );
	}

	/**
	 * Loads the WooCommerce modules.
	 *
	 * @since 1.0
	 * @return void
	 */
	static public function load_modules() {
		FLThemeBuilderLoader::load_modules( FL_THEME_BUILDER_WOOCOMMERCE_DIR . 'modules' );
	}

	/**
	 * Filter out the widgets from the BB content panel
	 * as it must be added to a sidebar to work.
	 *
	 * @since 1.1.1
	 * @param array $exclude
	 * @return array
	 */
	static public function filter_wp_widgets_exclude( $exclude ) {
		$exclude[] = 'WC_Widget_Recently_Viewed';
		return $exclude;
	}

	static public function filter_visibility( $args ) {
		if ( empty( $args ) ) {
			return $args;
		}

		$settings  = $args['settings'];
		$post_type = isset( $settings->post_type ) ? $settings->post_type : false;
		$filter    = false;

		// make sure its a product type.
		if ( is_string( $post_type ) && 'product' === $post_type ) {
			$filter = true;
		}
		// 2.6 this can be an array
		if ( is_array( $post_type ) && in_array( 'product', $post_type ) ) {
			$filter = true;
		}
		if ( $filter && isset( $settings->woo_visible ) && 'hide' === $settings->woo_visible ) {
			$args['tax_query'][] = array(
				array(
					'taxonomy' => 'product_visibility',
					'field'    => 'name',
					'terms'    => 'exclude-from-catalog',
					'operator' => 'NOT IN',
				),
			);
		}

		// fix ordering when not in the main query.
		if ( is_shop() || is_product_category() || is_product_tag() || is_product_taxonomy() ) {
			$order_by = isset( $_GET['orderby'] ) ? wc_clean( $_GET['orderby'] ) : ( empty( $settings->order_by ) ? 'date' : $settings->order_by );
			$order    = empty( $settings->order ) ? 'DESC' : $settings->order;
			$meta_key = '';

			switch ( $order_by ) {
				case 'popularity':
					$order_by = 'meta_value_num';
					$meta_key = 'total_sales';
					$order    = 'DESC';
					break;

				case 'rating':
					$order_by = 'meta_value_num';
					$meta_key = '_wc_average_rating';
					$order    = 'DESC';
					break;

				case 'date':
					$order_by = 'date';
					$order    = 'DESC';
					break;

				case 'price':
					$order_by = 'meta_value_num';
					$meta_key = '_price';
					$order    = 'ASC';
					break;

				case 'price-desc':
					$order_by = 'meta_value_num';
					$meta_key = '_price';
					$order    = 'DESC';
					break;
			}

			$args['orderby']  = $order_by;
			$args['meta_key'] = $meta_key;
			$args['order']    = $order;
		}

		return $args;
	}
}

FLThemeBuilderWooCommerce::init();
