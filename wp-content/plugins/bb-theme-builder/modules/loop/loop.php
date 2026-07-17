<?php

/**
 * @class FLLoopModule
 */
class FLLoopModule extends FLBuilderModule {

	/**
	 * @since 1.5
	 * @return void
	 */
	public function __construct() {
		parent::__construct(
			array(
				'name'            => __( 'Loop', 'bb-theme-builder' ),
				'description'     => __( 'A module for building post loops.', 'bb-theme-builder' ),
				'category'        => __( 'Posts', 'bb-theme-builder' ),
				'icon'            => 'schedule.svg',
				'partial_refresh' => true,
				'include_wrapper' => false,
				'accepts'         => 'all',
				'enabled'         => class_exists( 'FLBuilderModuleDataRepeater' ),
			)
		);

		FLBuilderAJAX::add_action( 'fl_loop_get_terms', 'FLBuilderLoop::get_term_options' );
	}

	/**
	 * Ensure backwards compatibility with old settings.
	 *
	 * @since 1.5
	 * @param object $settings A module settings object.
	 * @param object $helper A settings compatibility helper.
	 * @return object
	 */
	public function filter_settings( $settings, $helper ) {

		if ( isset( $settings->term_parent ) && ! isset( $settings->select_terms ) && 0 != $settings->term_parent ) {
			$settings->select_terms = 'child';
		}
		return $settings;
	}

	/**
	 * Enqueues scripts for loop module.
	 *
	 * @since 1.5
	 * @return void
	 */
	public function enqueue_scripts() {

		if ( $this->settings && 'scroll' === $this->settings->pagination ) {
			$this->add_js( 'jquery-infinitescroll' );
		}
	}

	/**
	 * Render each item for the loop module.
	 *
	 * @since 1.5
	 * @return void
	 */
	public function render_item() {

		ob_start();

		$this->render_children_with_wrapper( 'li', [
			'class' => [
				'fl-loop-item',
			],
		] );

		// Do shortcodes here so they are parsed in context of the current post.
		echo do_shortcode( ob_get_clean() );
	}

	/**
	 * Is JSON-LD enabled
	 *
	 * @since 1.5
	 */
	public static function json_ld_enabled() {
		/**
		 * Disable all loop module schema markup
		 * @see fl_post_grid_disable_schema
		 */
		if ( false !== apply_filters( 'fl_loop_disable_schema', false ) ) {
			return false;
		} else {
			return FLBuilder::is_schema_enabled();
		}
	}

	/**
	 * Prints JSON-LD for the passed query.
	 *
	 * @since 1.5
	 * @return void
	 */
	public function print_json_ld( $repeater ) {
		$valid_sources = [ 'main_query', 'custom_query', 'acf_repeater' ];

		if ( ! $this->json_ld_enabled() || ! in_array( $this->settings->data_source, $valid_sources ) ) {
			return;
		}

		$post_type       = isset( $this->settings->post_type ) ? $this->settings->post_type : 'post';
		$collection_type = $this->json_ld_collection_type( $post_type );
		$item_type       = 'Blog' === $collection_type ? 'BlogPosting' : 'ListItem';
		$item_key        = 'Blog' === $collection_type ? 'blogPost' : 'itemListElement';
		$logo            = $this->json_ld_publisher_logo();

		$json_ld = [
			'@context' => 'https://schema.org',
			'@type'    => $collection_type,
			'name'     => $this->json_ld_page_name(),
			'url'      => $this->json_ld_page_url(),
			$item_key  => [],
		];

		while ( $repeater->has_items() ) {
			$repeater->setup_item();

			$post_json = [
				'@type'                => $item_type,
				'headline'             => esc_html( get_the_title() ),
				'url'                  => esc_url( get_permalink() ),
				'datePublished'        => esc_html( get_the_date( 'c' ) ),
				'dateModified'         => esc_html( get_the_modified_date( 'c' ) ),
				'description'          => esc_html( get_the_excerpt() ),
				'mainEntityOfPage'     => [
					'@type' => 'WebPage',
					'@id'   => esc_url( get_permalink() ),
				],
				'author'               => [
					'@type' => 'Person',
					'name'  => esc_html( get_the_author() ),
				],
				'publisher'            => [
					'@type' => 'Organization',
					'name'  => esc_html( get_bloginfo( 'name' ) ),
				],
				'interactionStatistic' => [
					'@type'                => 'InteractionCounter',
					'interactionType'      => 'https://schema.org/CommentAction',
					'userInteractionCount' => wp_count_comments( get_the_ID() )->approved,
				],
			];

			if ( ! empty( $logo ) ) {
				$post_json['publisher']['logo'] = [
					'@type' => 'ImageObject',
					'url'   => $logo,
				];
			}

			if ( has_post_thumbnail() ) {
				$post_json['image'] = esc_url( get_the_post_thumbnail_url( null, 'full' ) );
			}

			$json_ld[ $item_key ][] = $post_json;
		}

		$repeater->cleanup();
		$encoded = json_encode( $json_ld, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT );

		echo '<script type="application/ld+json">' . $encoded . '</script>';
	}

	/**
	 * Returns the collection type for JSON-LD.
	 *
	 * @since 1.5
	 * @return string
	 */
	public function json_ld_collection_type( $post_type = 'post' ) {
		if ( is_archive() && 'main_query' === $this->settings->data_source ) {
			return is_post_type_archive( 'post' ) ? 'Blog' : 'ItemList';
		}

		return FLBuilderUtils::post_type_contains( 'post', $post_type ) ? 'Blog' : 'ItemList';
	}

	/**
	 * Returns the page name for JSON-LD
	 *
	 * @since 1.5
	 * @return string
	 */
	public function json_ld_page_name() {
		if ( is_singular() ) {
			return get_the_title();
		} elseif ( is_category() || is_tag() ) {
			return single_term_title( '', false );
		} elseif ( is_post_type_archive() ) {
			return post_type_archive_title( '', false );
		} elseif ( is_author() ) {
			return 'Posts by ' . get_the_author();
		} elseif ( is_date() ) {
			return 'Archives for ' . get_the_date( 'F Y' );
		}

		return get_bloginfo( 'name' );
	}

	/**
	 * Returns the page URL for JSON-LD
	 *
	 * @since 1.5
	 * @return string
	 */
	public function json_ld_page_url() {
		if ( is_singular() ) {
			return esc_url( get_permalink() );
		} elseif ( is_category() || is_tag() ) {
			return esc_url( get_term_link( get_queried_object() ) );
		} elseif ( is_post_type_archive() ) {
			return esc_url( get_post_type_archive_link( get_query_var( 'post_type' ) ) );
		} elseif ( is_author() ) {
			return esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) );
		} elseif ( is_date() ) {
			return esc_url( get_day_link( get_query_var( 'year' ), get_query_var( 'monthnum' ), get_query_var( 'day' ) ) );
		}

		return esc_url( get_home_url() );
	}

	/**
	 * Returns the publisher logo URL for JSON-LD
	 *
	 * @since 1.5
	 * @return string
	 */
	public function json_ld_publisher_logo() {
		$image = '';

		if ( class_exists( 'FLTheme' ) && 'image' == FLTheme::get_setting( 'fl-logo-type' ) ) {
			$image = FLTheme::get_setting( 'fl-logo-image' );
		} elseif ( has_custom_logo() ) {
			$custom_logo_id = get_theme_mod( 'custom_logo' );
			$logo           = wp_get_attachment_image_src( $custom_logo_id, 'full' );
			$image          = is_array( $logo ) ? $logo[0] : false;
		}

		return $image;
	}
}

FLBuilder::register_module( 'FLLoopModule', array(
	'general'    => array(
		'title'    => __( 'General', 'bb-theme-builder' ),
		'sections' => array(
			'general' => array(
				'fields' => array(
					'column_sizing' => array(
						'label'      => __( 'Item Sizing', 'bb-theme-builder' ),
						'type'       => 'button-group',
						'fill_space' => true,
						'default'    => 'count',
						'options'    => array(
							'count'     => __( 'Columns', 'bb-theme-builder' ),
							'item_size' => __( 'Item Size', 'bb-theme-builder' ),
						),
						'toggle'     => array(
							'count'     => array( 'fields' => array( 'column_count' ) ),
							'item_size' => array( 'fields' => array( 'min_size', 'max_size' ) ),
						),
					),
					'column_count'  => array(
						'label'      => __( 'Number of Columns', 'bb-theme-builder' ),
						'type'       => 'unit',
						'unit'       => '',
						'responsive' => array(
							'default' => array(
								'default'    => 3,
								'large'      => 3,
								'medium'     => 2,
								'responsive' => 1,
							),
						),
						'slider'     => array(
							'min' => '1',
							'max' => '12',
						),
						'preview'    => array(
							'type'         => 'css',
							'auto'         => true,
							'selector'     => '> ul',
							'property'     => 'grid-template-columns',
							'format_value' => 'repeat( %s, minmax( 0, 1fr ))',
							'enabled'      => array(
								'column_sizing' => 'count',
							),
						),
					),
					'min_size'      => array(
						'label'      => __( 'Minimum Width', 'bb-theme-builder' ),
						'type'       => 'unit',
						'units'      => array( 'px', 'fr' ),
						'responsive' => array(
							'default'      => array(
								'default' => '100',
							),
							'default_unit' => array(
								'default' => 'px',
							),
						),
						'slider'     => array(
							'min' => '100',
							'max' => '1000',
						),
					),
					'max_size'      => array(
						'label'      => __( 'Maximum Width', 'bb-theme-builder' ),
						'type'       => 'unit',
						'units'      => array( 'px', 'fr' ),
						'responsive' => array(
							'default'      => array(
								'default' => '300',
							),
							'default_unit' => array(
								'default' => 'px',
							),
						),
						'slider'     => array(
							'min' => '100',
							'max' => '1000',
						),
					),
					'gap'           => array(
						'label'      => __( 'Gap', 'bb-theme-builder' ),
						'type'       => 'dimension',
						'keys'       => array(
							'row'    => __( 'Row', 'bb-theme-builder' ),
							'column' => __( 'Column', 'bb-theme-builder' ),
						),
						'responsive' => array(
							'default'      => array(
								'default' => '20',
							),
							'default_unit' => array(
								'default' => 'px',
							),
						),
						'units'      => array( 'px', 'em', '%', 'vw', 'vh' ),
						'slider'     => array(
							'min' => 0,
							'max' => 100,
						),
						'preview'    => array(
							'type'     => 'css',
							'selector' => '> ul',
							'property' => 'gap',
							'auto'     => true,
						),
					),
				),
			),
		),
	),
	'content'    => array(
		'title' => __( 'Content', 'bb-theme-builder' ),
		'file'  => FL_BUILDER_DIR . 'includes/loop-settings.php',
	),
	'pagination' => array(
		'title'    => __( 'Pagination', 'bb-theme-builder' ),
		'sections' => array(
			'pagination' => array(
				'title'  => '',
				'fields' => array(
					'pagination'             => array(
						'type'    => 'select',
						'label'   => __( 'Pagination', 'bb-theme-builder' ),
						'default' => 'numbers',
						'options' => array(
							'numbers' => __( 'Numbers', 'bb-theme-builder' ),
							'scroll'  => __( 'Scroll', 'bb-theme-builder' ),
							'none'    => __( 'None', 'bb-theme-builder' ),
						),
						'toggle'  => array(
							'numbers' => array(
								'fields' => array( 'pagination_auto_scroll' ),
							),
						),
					),
					'pagination_auto_scroll' => array(
						'type'    => 'select',
						'label'   => __( 'Auto-scroll on Pagination', 'bb-theme-builder' ),
						'default' => '1',
						'options' => array(
							'1' => __( 'Yes', 'bb-theme-builder' ),
							'0' => __( 'No', 'bb-theme-builder' ),
						),
					),
					'posts_per_page'         => array(
						'type'    => 'text',
						'label'   => __( 'Posts Per Page', 'bb-theme-builder' ),
						'default' => '10',
					),
					'no_results_message'     => array(
						'type'    => 'textarea',
						'label'   => __( 'No Results Message', 'bb-theme-builder' ),
						'default' => __( "Sorry, we couldn't find any posts. Please try a different search.", 'bb-theme-builder' ),
						'rows'    => 6,
					),
					'show_search'            => array(
						'type'    => 'select',
						'label'   => __( 'Show Search', 'bb-theme-builder' ),
						'default' => '1',
						'options' => array(
							'1' => __( 'Show', 'bb-theme-builder' ),
							'0' => __( 'Hide', 'bb-theme-builder' ),
						),
						'help'    => __( 'Shows the search form if no items are found.', 'bb-theme-builder' ),
					),
				),
			),
		),
	),
) );

require_once __DIR__ . '/loop-aliases.php';
