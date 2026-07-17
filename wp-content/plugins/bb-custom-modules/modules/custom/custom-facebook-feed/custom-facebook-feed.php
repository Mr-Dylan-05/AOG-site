<?php
/**
 * @class advanceResponsiveMenuModule
 */
class customFacebookFeed extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Facebook Feed', 'fl-builder'),
			'description'   	=> __('Displays a responsive Facebook Feed.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'facebook-feed';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('customFacebookFeed', array(
	'general'         => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
					'facebook_url' => array(
						'type'          => 'text',
						'label'         => __( 'Facebook URL', 'fl-builder' ),
					),
					'fb_align' => array(
                    	'type'    => 'align',
                    	'label'   => 'Align',
                    	'default' => 'center',
                    	'preview' => array(
                    		'type'       => 'css',
                    		'selector'   => '{node} .custom_facebook',
                    		'property'   => 'text-align',
                    	),
                    ),
                    'w_width' => array(
                    	'type'    => 'unit',
                    	'label'   => 'Width',
                    	'description' => 'px'
                    ),
                    'w_height' => array(
                    	'type'    => 'unit',
                    	'label'   => 'Height',
                    	'description' => 'px'
                    ),
				)
			),
		)
	),
));