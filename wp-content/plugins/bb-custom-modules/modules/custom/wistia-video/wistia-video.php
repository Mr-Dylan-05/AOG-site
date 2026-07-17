<?php

/**
 * @class WistiaVideoModule
 */
class WistiaVideoModule extends FLBuilderModule {

	/**
	 * @property $data
	 */
	public $data = null;

	/**
	 * @method __construct
	 */
	public function __construct() {
        global $customcategory;
		parent::__construct(array(
			'name'            => __( 'Wistia Video', 'fl-builder' ),
			'description'     => __( 'Render a WordPress or embedable video.', 'fl-builder' ),
			'category'        => __($customcategory, 'fl-builder'),
			'partial_refresh' => true,
		));

		$this->add_js( 'jquery-fitvids' );

		add_filter( 'wp_video_shortcode', __CLASS__ . '::mute_video', 10, 4 );
	}

	/**
	 * @method get_data
	 */
	public function get_data() {
		if ( ! $this->data ) {

			$this->data = FLBuilderPhoto::get_attachment_data( $this->settings->video );

			if ( ! $this->data && isset( $this->settings->data ) ) {
				$this->data = $this->settings->data;
			}
			if ( $this->data ) {
				$parts                 = explode( '.', $this->data->filename );
				$this->data->extension = array_pop( $parts );
				$this->data->poster    = isset( $this->settings->poster_src ) ? $this->settings->poster_src : '';
				$this->data->loop      = isset( $this->settings->loop ) && $this->settings->loop ? ' loop="yes"' : '';
				$this->data->autoplay  = isset( $this->settings->autoplay ) && $this->settings->autoplay ? ' autoplay="yes"' : '';

				// WebM format
				$webm_data              = FLBuilderPhoto::get_attachment_data( $this->settings->video_webm );
				$this->data->video_webm = isset( $this->settings->video_webm ) && $webm_data ? ' webm="' . $webm_data->url . '"' : '';

			}
		}

		return $this->data;
	}

	/**
	 * @method update
	 * @param $settings {object}
	 */
	public function update( $settings ) {
		// Cache the attachment data.
		if ( 'media_library' == $settings->video_type ) {

			$video = FLBuilderPhoto::get_attachment_data( $settings->video );

			if ( $video ) {
				$settings->data = $video;
			} else {
				$settings->data = null;
			}
		}

		return $settings;
	}

	/**
	 * Temporary fix for autoplay in Chrome & Safari. Video shortcode doesn't support `muted` parameter.
	 * Bug report: https://core.trac.wordpress.org/ticket/42718.
	 *
	 * @since 2.1.3
	 * @param string $output  Video shortcode HTML output.
	 * @param array  $atts    Array of video shortcode attributes.
	 * @param string $video   Video file.
	 * @param int    $post_id Post ID.
	 * @return string
	 */
	static public function mute_video( $output, $atts, $video, $post_id ) {
		if ( false !== strpos( $output, 'autoplay="1"' ) && FLBuilderModel::get_post_id() == $post_id ) {
			$output = str_replace( '<video', '<video muted', $output );
		}
		return $output;
	}

	/**
	 * Calculate video aspect ratio for style.
	 *
	 * @since 2.2
	 * @return float
	 */
	public function video_aspect_ratio() {
		$data = $this->get_data();
		if ( $data && function_exists( 'bcdiv' ) ) {
			$ratio = ( $data->height / $data->width ) * 100;
			return bcdiv( $ratio, 1, 2 );
		}
	}

	/**
	 * Returns structured data markup.
	 * @since 2.2
	 */
	public function get_structured_data( $module ) {
		$settings = $module->settings;
		$markup   = '';
		if ( 'yes' != $settings->schema_enabled ) {
			return false;
		}
		if ( '' == $settings->name || '' == $settings->description || '' == $settings->thumbnail || '' == $settings->up_date ) {
			return false;
		}
		$markup .= sprintf( '<meta itemprop="name" content="%s" />', esc_attr( $settings->name ) );
		$markup .= sprintf( '<meta itemprop="uploadDate" content="%s" />', esc_attr( $settings->up_date ) );
		$markup .= sprintf( '<meta itemprop="thumbnailUrl" content="%s" />', $settings->thumbnail_src );
		$markup .= sprintf( '<meta itemprop="description" content="%s" />', esc_attr( $settings->description ) );

		return $markup;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('WistiaVideoModule', array(
	'general' => array(
		'title'    => __( 'General', 'fl-builder' ),
		'sections' => array(
			'general' => array(
				'title'  => '',
				'fields' => array(
					'wistia_id' => array(
                        'type'          => 'text',
                        'label'         => __( 'Wistia ID', 'fl-builder' ),
                        'default'       => '',
                    ),
				),
			),

		),
	),
	'style'  => array(
		'title'    => 'Styles',
		'sections' => array(
		    'settings'  => array(
	            'fields' => array(
	                'autoplay' => array(
						'type'    => 'select',
						'label'   => __( 'Autoplay', 'fl-builder' ),
						'default' => 'true',
						'options' => array(
							'true' => __( 'True', 'fl-builder' ),
							'false'  => __( 'False', 'fl-builder' ),
						),
					),
					'visible_control' => array(
						'type'    => 'select',
						'label'   => __( 'Visible control on load', 'fl-builder' ),
						'default' => 'true',
						'options' => array(
							'true' => __( 'True', 'fl-builder' ),
							'false'  => __( 'False', 'fl-builder' ),
						),
					),
                ),
	        ),
			'styles' => array(
			    'title' => __('Video Style','fl-builder'),
				'fields' => array(
					'video_layout' => array(
						'type'    => 'select',
						'label'   => __( 'Video Layout', 'fl-builder' ),
						'default' => 'full',
						'options' => array(
							'full' => __( 'Full', 'fl-builder' ),
							'custom'  => __( 'Custom', 'fl-builder' ),
						),
						'toggle'  => array(
							'custom' => array(
								'fields' => array( 'custom_height', 'custom_width' ),
							),
						),
					),
					'custom_height'   => array(
						'type'    => 'unit',
						'label'   => __( 'Custom Height', 'fl-builder' ),
						'units'     => array('px', '%'),
						'preview' => array(
							'type' => 'css',
							'rules' => array(
					            array(
        							'selector'  => '{node} iframe',
        							'property'  => 'height',
    							),
							),
						),
					),
					'custom_width'   => array(
						'type'    => 'unit',
						'label'   => __( 'Custom Width', 'fl-builder' ),
						'units'     => array('px', '%'),
						'preview' => array(
							'type' => 'css',
							'rules' => array(
					            array(
        							'selector'  => '{node} iframe',
        							'property'  => 'width',
    							),
							),
						),
					),
					'wistia_border' => array(
                    	'type'       => 'border',
                    	'label'      => 'Border',
                    	'responsive' => true,
                    	'preview'    => array(
                    		'type'     => 'css',
                    		'selector' => '{node} .wistia-container',
                    	),
                    ),
				),
			),
		),
	),
));
