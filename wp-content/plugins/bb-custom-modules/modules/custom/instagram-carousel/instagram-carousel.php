<?php

/**
 * @class InstagramCarouselModule
 */
class InstagramCarouselModule extends FLBuilderModule {

	/**
	 * @method __construct
	 */
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Instagram Carousel', 'fl-builder'),
			'description'   	=> __('Instagram Feeds Carousel.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
		$this->add_js( 'instafeed', $this->url . 'js/instafeed.js' );
		$this->add_js( 'momentjs', $this->url . 'js/moment.js' );
	}

	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'instagram-carousel';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('InstagramCarouselModule', array(
	'general'       => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
			'general'         => array(
				'title'         => '',
				'fields'        => array(
					'user_id'           => array(
						'type'          => 'text',
						'label'         => __( 'User ID', 'fl-builder' ),
						'default'       => __( '1645878261', 'fl-builder' ),
						'placeholder'       => __( '1645878261', 'fl-builder' ),
						'description'       => __( 'Login to your Instagram account then Generate ID <a href="http://instagram.pixelunion.net/" target="blank">here</a> Copy the first Word of number before dot eg: 1552356056.xxxxxxx.xxxxxxxxxxxxxxxxxx...', 'fl-builder' ),
					),
					'access_token'           => array(
						'type'          => 'text',
						'label'         => __( 'Access Token', 'fl-builder' ),
						'default'       => __( '1552356056.e029fea.baefa926903d434ea5c228feed16619f', 'fl-builder' ),
						'placeholder'       => __( '1552356056.e029fea.baefa926903d434ea5c228feed16619f', 'fl-builder' ),
						'description'       => __( 'Login to your Instagram account then <a href="http://instagram.pixelunion.net/" target="blank">Generate Your Instagram Access Token</a>', 'fl-builder' ),
					),
					'orderby'         => array(
						'type'          => 'select',
						'label'         => __('Order By', 'fl-builder'),
						'default'       => 'date',
						'options'       => array(
							'none'    		=> __('none', 'fl-builder'),
							'random'    		=> __('random', 'fl-builder'),
							'most-recent'    		=> __('most-recent', 'fl-builder'),
							'least-recent'    		=> __('least-recent', 'fl-builder'),
							'most-liked'    		=> __('most-liked', 'fl-builder'),
							'least-liked'    		=> __('least-liked', 'fl-builder'),
							'most-commented'    		=> __('most-commented', 'fl-builder'),
							'least-commented'    		=> __('least-commented', 'fl-builder'),
						),
					),
					'column'         => array(
						'type'          => 'select',
						'label'         => __( 'Column', 'fl-builder' ),
						'default'       => __( '4', 'fl-builder' ),
						'options'       => array(
							'1'    		=> __('1', 'fl-builder'),
							'2'    		=> __('2', 'fl-builder'),
							'3'    		=> __('3', 'fl-builder'),
							'4'    		=> __('4', 'fl-builder'),
							'5'    		=> __('5', 'fl-builder'),
							'6'    		=> __('6', 'fl-builder'),
						),
					),
					'limit'         => array(
						'type'          => 'unit',
						'label'         => __( 'Maximum Limit', 'fl-builder' ),
						'default'       => __( '', 'fl-builder' ),
						'placeholder'   => __( '12', 'fl-builder' ),
						'maxlength'     => '3',
						'size'          => '4',
					),
					'instagram_logo'         => array(
						'type'          => 'photo',
						'label'         => __( 'Instagram Logo', 'fl-builder' ),
						'default'       => __( '', 'fl-builder' ),
						'show_remove'   => true,
					),
					'instagram_name'         => array(
						'type'          => 'text',
						'label'         => __( 'Instagram Name', 'fl-builder' ),
						'default'       => __( 'CAMP NATIVE', 'fl-builder' ),
						'placeholder'   => __( 'CAMP NATIVE', 'fl-builder' ),
					),
					'instagram_link'         => array(
						'type'          => 'text',
						'label'         => __( 'Instagram Link', 'fl-builder' ),
						'default'       => __( 'https://www.instagram.com/campnative/', 'fl-builder' ),
						'placeholder'   => __( 'https://www.instagram.com/campnative/', 'fl-builder' ),
					),
					'dots_color'         => array(
						'type'          => 'color',
						'label'         => __( 'Dots Color', 'fl-builder' ),
						'default'       => __( '', 'fl-builder' ),
						'show_reset'       => true,
						'preview'       => array(
							'type'          => 'css',
							'rules'           => array(
								array(
									'selector'     => '.instagram-carousel .owl-dot',
									'property'     => 'color',
								),
								array(
									'selector'     => '.instagram-carousel .owl-dot',
									'property'     => 'background-color'
								),    
							)
						)
					),
				)
			)
		),
	),
));