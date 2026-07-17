<?php
/**
 * @class advanceResponsiveMenuModule
 */
class advanceResponsiveMenuModule extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Advance Responsive Menu', 'fl-builder'),
			'description'   	=> __('Displays a responsive advance Menu.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
        // Register and enqueue your own.
		$this->add_css( 'hamburgers', BB_CUSTOM_MODULES_URL . 'modules/custom/advance-responsive-menu/css/hamburgers.min.css' );
	}
	
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'main-menu';
		return $classname;
	}
    
    public static function render_menus() {
		$nav_menus = get_terms( 'nav_menu', array( 'hide_empty' => true ) );
		$fields    = array(
			'type'   => 'select',
			'label'  => __( 'Menu', 'uabb' ),
			'helper' => __( 'Select a WordPress menu that you created in the admin under Appearance > Menus.', 'uabb' ),
		);

		if ( $nav_menus ) {

			foreach ( $nav_menus as $key => $menu ) {

				if ( 0 == $key ) {
					$fields['default'] = $menu->name;
				}

				$menus[ $menu->slug ] = $menu->name;
			}

			$fields['options'] = $menus;

		} else {
			$fields['options'] = array( '' => __( 'No Menus Found', 'uabb' ) );
		}

		return $fields;

	}
    /**
	 * Renders menu
	 *
	 * @method get_menu
	 * @param object $settings gets the settings for menu.
	 * @param object $module gets the modules settings.
	 */
	public function get_menu( $settings, $module ) {
		?>
		<?php
        $menuClass = 'main-menu';
        $menuID = 'header';
		if ( ! empty( $settings->wp_menu ) ) {

			$defaults = array(
				'menu'        => $settings->wp_menu,
				'container'   => false,
                'fallback_cb' => '',
				'menu_class'  => $menuClass,
                'menu_id'     => $menuID,
			);

			wp_nav_menu( $defaults );
		}
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('advanceResponsiveMenuModule', array(
	'general'         => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
                    'wp_menu' => advanceResponsiveMenuModule::render_menus(),
					'menu_align' => array(
                        'type'    => 'align',
                        'label'   => 'Alignment',
                        'default' => 'default',
                        'responsive' => true,
                        'preview' => array(
                            'type'       => 'css',
                            'selector'   => '#main',
                            'property'   => 'text-align',
                        )
                    )
				)
			),
			'typography'       => array(
				'title'         => 'Typography',
				'fields'        => array(
		            'menu_typography'       => array(
						'type'          => 'typography',
						'label'         => 'Menu Typography',
						'responsive' => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '#main .main-menu li a',
						)
					), 
				)
			)
		)
	),
    'menu'      => array(
		'title'    => __( 'Menu', 'fl-builder' ),
		'sections' => array(
            'menu_styles' => array(
				'title'  => __( 'Style', 'fl-builder' ),
				'fields' => array(
                    'item_margin' => array(
                    	'type'        => 'dimension',
                    	'label'       => 'Item Margin',
                    	'description' => 'px',
                    	'preview'    => array(
                    		'type'     => 'css',
                    		'selector' => '#main .main-menu li',
                    	),
                    ),
					'item_padding' => array(
                    	'type'        => 'dimension',
                    	'label'       => 'Item Padding',
                    	'description' => 'px',
                    	'preview'    => array(
                    		'type'     => 'css',
                    		'selector' => '#main .main-menu li',
                    	),
                    )
                )
            ),
            'menu_color' => array(
				'title'  => __( 'Color', 'fl-builder' ),
				'fields' => array(
                    'menu_item_color'       => array(
						'type'          => 'color',
						'label'         => 'Menu Item Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '#main .main-menu li a',
							'property'      => 'color',
						),
						'connections' => array( 'color' )
					),
					'menu_item_hover_color'       => array(
						'type'          => 'color',
						'label'         => 'Menu Item Hover Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '#main .main-menu li:hover a',
							'property'      => 'color',
						),
						'connections' => array( 'color' )
					)
                )
            ),
            'menu_hover_style' => array(
				'title'  => __('Menu Item Hover Style', 'fl-builder'),
				'fields' => array(
				    'hover_style' => array(
						'type'          => 'select',
						'label'         => __( 'Select Menu Hover Style', 'fl-builder' ),
						'default'       => 'border-slide',
						'options'       => array(
                            'border-slide'            => __( 'Border Slide', 'fl-builder' ),
                            'colored-bg'          => __( 'Colored Background', 'fl-builder' )
						)
					),
                    'item_hover_border'       => array(
						'type'          => 'color',
						'label'         => 'Item Border Hover Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '#main .main-menu li:hover a',
							'property'      => 'border-color',
						),
						'connections' => array( 'color' )
					)
				)
			)
        )
    ),
    'submenu'      => array(
		'title'    => __( 'Submenu', 'fl-builder' ),
		'sections' => array(
            'submenu_styles' => array(
				'title'  => __( 'Color', 'fl-builder' ),
				'fields' => array(
                    'submenu_item_color'       => array(
						'type'          => 'color',
						'label'         => 'Submenu Item Color',
						'show_reset'    => true,
						'connections' => array( 'color' )
					),
					'submenu_item_hover_color'       => array(
						'type'          => 'color',
						'label'         => 'Submenu Item Hover Color',
						'show_reset'    => true,
						'connections' => array( 'color' )
					),
                    'submenu_item_color_bg'       => array(
						'type'          => 'color',
						'label'         => 'Submenu Item Color Background',
						'show_reset'    => true,
						'connections' => array( 'color' )
					),
                    'submenu_item_hover_color_bg'       => array(
						'type'          => 'color',
						'label'         => 'Submenu Item Hover Color Background',
						'show_reset'    => true,
						'connections' => array( 'color' )
					),
                )
            )
        )
    ),
    'responsive'      => array(
		'title'    => __( 'Responsive', 'fl-builder' ),
		'sections' => array(
            'responsive_styles' => array(
				'title'  => __( 'Style', 'fl-builder' ),
				'fields' => array(
                    'hamburger_menu_color'       => array(
						'type'          => 'color',
						'label'         => 'Menu Hamburger Color',
						'show_reset'    => true,
						'connections' => array( 'color' )
					), 
					'hamburger_menu_hover_color'       => array(
						'type'          => 'color',
						'label'         => 'Menu Hamburger Hover Color',
						'show_reset'    => true,
						'connections' => array( 'color' )
					)
                )
            ),
            'menu_animation'       => array(
                'title'         => 'Menu Animation',
                'fields'        => array(
                    'animation' => array(
                        'type'          => 'select',
                        'label'         => __( 'Select Menu Animation', 'fl-builder' ),
                        'default'       => 'hamburger--collapse',
                        'options'       => array(
                            'hamburger--3dx'            => __( '3dx', 'fl-builder' ),
                            'hamburger--3dx-r'          => __( '3dx Reverse', 'fl-builder' ),
                            'hamburger--3dy'            => __( '3dy', 'fl-builder' ),
                            'hamburger--3dy-r'          => __( '3dy Reverse', 'fl-builder' ),
                            'hamburger--3dxy'           => __( '3dxy', 'fl-builder' ),
                            'hamburger--3dxy-r'         => __( '3dxy Reverse', 'fl-builder' ),
                            'hamburger--arrow'          => __( 'Arrow', 'fl-builder' ),
                            'hamburger--arrow-r'        => __( 'Arrow Reverse', 'fl-builder' ),
                            'hamburger--arrowalt'       => __( 'Arrow Alt', 'fl-builder' ),
                            'hamburger--arrowalt-r'     => __( 'Arrow Alt Reverse', 'fl-builder' ),
                            'hamburger--arrowturn'      => __( 'Arrow Turn', 'fl-builder' ),
                            'hamburger--arrowturn-r'    => __( 'Arrow Turn Reverse', 'fl-builder' ),
                            'hamburger--boring'         => __( 'Boring', 'fl-builder' ),
                            'hamburger--collapse'       => __( 'Collapse', 'fl-builder' ),
                            'hamburger--collapse-r'     => __( 'Collapse Reverse', 'fl-builder' ),
                            'hamburger--elastic'        => __( 'Elastic', 'fl-builder' ),
                            'hamburger--elastic-r'      => __( 'Elastic Reverse', 'fl-builder' ),
                            'hamburger--emphatic'       => __( 'Emphatic', 'fl-builder' ),
                            'hamburger--emphatic-r'     => __( 'Emphatic Reverse', 'fl-builder' ),
                            'hamburger--minus'          => __( 'Minus', 'fl-builder' ),
                            'hamburger--slider'         => __( 'Slider', 'fl-builder' ),
                            'hamburger--slider-r'       => __( 'Slider Reverse', 'fl-builder' ),
                            'hamburger--spin'           => __( 'Spin', 'fl-builder' ),
                            'hamburger--spin-r'         => __( 'Spin Reverse', 'fl-builder' ),
                            'hamburger--spring'         => __( 'Spring', 'fl-builder' ),
                            'hamburger--spring-r'       => __( 'Spring Reverse', 'fl-builder' ),
                            'hamburger--stand'          => __( 'Stand', 'fl-builder' ),
                            'hamburger--stand-r'        => __( 'Stand Reverse', 'fl-builder' ),
                            'hamburger--squeeze'        => __( 'Squeeze', 'fl-builder' ),
                            'hamburger--vortex'         => __( 'Vortex', 'fl-builder' ),
                            'hamburger--vortex-r'       => __( 'Vortex Reverse', 'fl-builder' )
                        )
                    )
                )
            ),
			'content_type_section' => array(
				'title'  => __( 'Content', 'fl-builder' ),
				'fields' => array(
				    'partial_full'  =>  array(
				        'type'      => 'select',
		                'label' =>  __('Options','fl-builder'),
		                'default'   => 'partial',
		                'options'   => array(
		                    'partial'       =>  __( 'Partial','fl-builder' ),
		                    'full'          =>  __( 'Full','fl-builder' ),
	                    ),
	                ),
					'content_type'      => array(
						'type'    => 'select',
						'label'   => __( 'Type', 'fl-builder' ),
						'default' => 'content',
						'options' => array(
							'content'              => __( 'Content', 'fl-builder' ),
							'photo'                => __( 'Photo', 'fl-builder' ),
							'video'                => __( 'Video Embed Code', 'fl-builder' ),
							'saved_rows'           => array(
								'label'   => __( 'Saved Rows', 'fl-builder' ),
								'premium' => true,
							),
							'saved_modules'        => array(
								'label'   => __( 'Saved Modules', 'fl-builder' ),
								'premium' => true,
							),
							'saved_page_templates' => array(
								'label'   => __( 'Saved Page Templates', 'fl-builder' ),
								'premium' => true,
							),
						),
						'toggle'  => array(
							'content'              => array(
								'fields' => array( 'ct_content' ),
							),
							'photo'                => array(
								'fields' => array( 'ct_photo' ),
							),
							'video'                => array(
								'fields' => array( 'ct_video' ),
							),
							'saved_rows'           => array(
								'fields' => array( 'ct_saved_rows' ),
							),
							'saved_modules'        => array(
								'fields' => array( 'ct_saved_modules' ),
							),
							'saved_page_templates' => array(
								'fields' => array( 'ct_page_templates' ),
							),
						),
					),
					'ct_content'        => array(
						'type'        => 'editor',
						'label'       => '',
						'default'     => '',
						'connections' => array( 'string', 'html' ),
					),
					'ct_photo'          => array(
						'type'        => 'photo',
						'label'       => __( 'Select Photo', 'fl-builder' ),
						'show_remove' => true,
					),
					'ct_video'          => array(
						'type'  => 'textarea',
						'label' => __( 'Embed Code / URL', 'fl-builder' ),
						'rows'  => 6,
					),
					'ct_saved_rows'     => array(
						'type'    => 'select',
						'label'   => __( 'Select Row', 'fl-builder' ),
						'options' => array(),
					),
					'ct_saved_modules'  => array(
						'type'    => 'select',
						'label'   => __( 'Select Module', 'fl-builder' ),
						'options' => array(),
					),
					'ct_page_templates' => array(
						'type'    => 'select',
						'label'   => __( 'Select Page Template', 'fl-builder' ),
						'options' => array(),
					)
				)
			)
		)
	)
));