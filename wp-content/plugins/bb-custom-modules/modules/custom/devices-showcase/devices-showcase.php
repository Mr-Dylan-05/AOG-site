<?php
/**
 * @class devicesShowcaseModule
 */
class devicesShowcaseModule extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Devices Showcase', 'fl-builder'),
			'description'   	=> __('Displays Web Templates showcase in devices.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'devices-showcase';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('devicesShowcaseModule', array(
	'general'         => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
		    'Content'       => array(
				'title'         => 'Content',
				'fields'        => array(
					'label'       => array(
                        'type'          => 'text',
                        'label'         => 'Label',
                        'default'   => __('', 'fl-builder'),
						'placeholder'   => __('Label Text', 'fl-builder'),
                    ),
                    'link_template' => array(
                    	'type'          => 'link',
                    	'label'         => 'Link',
                    	'show_target'	=> true,
                    	'show_nofollow'	=> true,
                    ),
				)
			),
			'desktop'       => array(
				'title'         => 'Desktop',
				'fields'        => array(
					'desktop_screen_image'       => array(
                        'type'          => 'photo',
                        'label'         => 'Desktop Screen Image',
                        'show_remove' 	=> true,
                    ),
				)
			),
			'phone'       => array(
				'title'         => 'Mobile',
				'fields'        => array(
		            'phone_screen_image'       => array(
                        'type'          => 'photo',
                        'label'         => 'Mobile Screen Image',
                        'show_remove' 	=> true,
                    ),
				)
			),
			'typography'       => array(
				'title'         => 'Typography',
				'fields'        => array(
				    'label_color'       => array(
						'type'          => 'color',
						'label'         => 'Label Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.devices-label span',
							'property'      => 'color',
						)
					),
		            'label_typography'       => array(
						'type'          => 'typography',
						'label'         => 'Label Typography',
						'responsive' => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.devices-label span',
						)
					), 
				)
			)
		)
	)
));