<?php

/**
 * @class EZSearchModule
 */
class EZSearchModule extends FLBuilderModule {

	/**
	 * @method __construct
	 */
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('EZ Search Module', 'fl-builder'),
			'description'   	=> __('Easy Search module.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
	}

	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'ez-search';
		return $classname;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('EZSearchModule', array(
	'general'       => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
			'general'         => array(
				'title'         => '',
				'fields'        => array(
					'icon_color'         => array(
						'type'          => 'color',
						'label'         => __( 'Search icon', 'fl-builder' ),
						'default'       => __( '', 'fl-builder' ),
						'show_reset'       => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'     => '#header-search #search-toggler a > *',
				            'property'     => 'color',
						)
					),
                    'icon_size'           => array(
						'type'          => 'unit',
						'label'         => __( 'Icon Size', 'fl-builder' ),
						'default' 		=> '',
						'placeholder'   => '3',
                        'length'        => '3',
						'description'   => 'px',
                        'preview'       => array(
							'type'          => 'css',
							'selector'     => '#header-search #search-toggler a > *',
				            'property'     => 'font-size',
						)
					)
				)
			)
		),
	),
));