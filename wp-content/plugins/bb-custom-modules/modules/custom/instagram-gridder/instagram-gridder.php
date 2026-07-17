<?php

/**
 * @class InstagramGridderModule
 */
class InstagramGridderModule extends FLBuilderModule {

	/**
	 * @method __construct
	 */
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Instagram Gridder', 'fl-builder'),
			'description'   	=> __('Instagram Feeds Grid.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
		$this->add_js( 'instafeed', BB_CUSTOM_MODULES_URL . 'modules/custom/instagram-gridder/js/instafeed.js', array(), '', true );
		$this->add_js( 'momentjs', BB_CUSTOM_MODULES_URL . 'modules/custom/instagram-gridder/js/moment.js', array(), '', true );
	}

	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'instagram-gridder';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('InstagramGridderModule', array(
	'general'       => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
			'general'         => array(
				'title'         => '',
				'fields'        => array(
					'user_id'           => array(
						'type'          => 'text',
						'label'         => __( 'User ID', 'fl-builder' ),
						'default'       => __( '1552356056', 'fl-builder' ),
						'placeholder'       => __( '1552356056', 'fl-builder' ),
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
					'view_per_load'         => array(
						'type'          => 'select',
						'label'         => __( 'View Per Load', 'fl-builder' ),
						'default'       => __( '7', 'fl-builder' ),
						'options'       => array(
							'7'    		=> __('7', 'fl-builder'),
							'14'    		=> __('14', 'fl-builder'),
							'21'    		=> __('21', 'fl-builder'),
						),
					),
					'limit'         => array(
						'type'          => 'unit',
						'label'         => __( 'Maximum Limit', 'fl-builder' ),
						'default'       => __( '', 'fl-builder' ),
						'placeholder'   => __( '20', 'fl-builder' ),
						'maxlength'     => '3',
						'size'          => '4',
					),
					'instagram_name'         => array(
						'type'          => 'text',
						'label'         => __( 'Instagram Name', 'fl-builder' ),
						'default'       => __( 'David N Woodbury', 'fl-builder' ),
						'placeholder'   => __( 'David N Woodbury', 'fl-builder' ),
					),
					'instagram_link'         => array(
						'type'          => 'text',
						'label'         => __( 'Instagram Link', 'fl-builder' ),
						'default'       => __( 'https://www.instagram.com/ridewithwoody/', 'fl-builder' ),
						'placeholder'   => __( 'https://www.instagram.com/ridewithwoody/', 'fl-builder' ),
					),
				)
			)
		),
	),
));