<?php

/**
 * @class soundPlayModule
 */
class soundPlayModule extends FLBuilderModule {

	/**
	 * @method __construct
	 */
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Sound and Play Module', 'fl-builder'),
			'description'   	=> __('Plays Audio File.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
        $this->add_js( 'createjs', BB_CUSTOM_MODULES_URL . 'modules/custom/sound-play/js/createjs.min.js', array(), '', true );
		$this->add_js( 'soundjs', BB_CUSTOM_MODULES_URL . 'modules/custom/sound-play/js/soundjs.min.js', array(), '', true );
	}

	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'sound-play';
		return $classname;
	}
}

// Get Categories
$taxonomy     = 'audio_category';
$hide_empty   = 0;
$args = array(
	'taxonomy'     => $taxonomy,
	'hide_empty'   => $hide_empty
);
$all_categories = get_categories( $args );
$posttypeCategories = array();
foreach ($all_categories as $sub_category1) {
	if($sub_category1->category_parent == 0) {
		$posttypeCategories[$sub_category1->slug] = ucfirst($sub_category1->name);
		/*level 2*/
		$args2 = array(
				'taxonomy'     => $taxonomy,
				'child_of'     => $sub_category1->term_id,
				'parent'       => $sub_category1->term_id,
				'hide_empty'   => $hide_empty
		);
		$sub_cats2 = get_categories( $args2 );
		if($sub_cats2) {
			foreach($sub_cats2 as $sub_category2) {
				$posttypeCategories[$sub_category2->slug] = '-- '.ucfirst($sub_category2->name);

				/*level 3*/
				$args3 = array(
					'taxonomy'     => $taxonomy,
					'child_of'     => $sub_category2->term_id,
					'parent'       => $sub_category2->term_id,
					'hide_empty'   => $hide_empty
				);
				$sub_cats3 = get_categories( $args3 );
				if($sub_cats3) {
					foreach($sub_cats3 as $sub_category3) {
						$posttypeCategories[$sub_category3->slug] = '--- '.ucfirst($sub_category3->name);

						/*level 4*/
						$args4 = array(
							'taxonomy'     => $taxonomy,
							'child_of'     => $sub_category3->term_id,
							'parent'       => $sub_category3->term_id,
							'hide_empty'   => $hide_empty
						);
						$sub_cats4 = get_categories( $args4 );
						if($sub_cats4) {
							foreach($sub_cats4 as $sub_category4) {
								$posttypeCategories[$sub_category4->slug] = '---- '.ucfirst($sub_category4->name);
							}
						}
					}
				}
			} 
		}
	}       
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('soundPlayModule', array(
	'general'       => array(
		'title'         => __('General', 'fl-builder'),
		'sections'      => array(
			'general'         => array(
				'title'         => '',
				'fields'        => array(
				    'categories'         => array(
						'type'          => 'select',
						'label'         => __('Categories', 'fl-builder'),
						'default'       => '',
						'description'       => ' Add New Post <a href="'.get_site_url().'/wp-admin/edit.php?post_type=audio" target="_blank">Here</a>',
						'options'       => array(
							''    		=> __('All', 'fl-builder'),
							'selected'    		=> __('Selected', 'fl-builder'),
						),
						'toggle'        => array(
							'selected'        => array(
								'fields'        => array('selected_categories')
							),
						)
					),
					'selected_categories'         => array(
						'type'          => 'select',
						'label'         => __('Select Category', 'fl-builder'),
						'description'       => ' Add New Post Category <a href="'.get_site_url().'/wp-admin/edit-tags.php?taxonomy=audio_category&post_type=audio" target="_blank">Here</a>',
						'options'       => $posttypeCategories,
						'multi-select'  => true
					),
                    'totalpost'         => array(
						'type'          => 'text',
						'label'         => __('Number of Audio Files to display', 'fl-builder'),
						'default'       => __('9', 'fl-builder'),
						'placeholder'       => __('9', 'fl-builder'),
						'maxlength'     => '2',
						'size'          => '1',
					),
                    'post_orderby'         => array(
						'type'          => 'select',
						'label'         => __('Order By', 'fl-builder'),
						'default'       => 'date',
						'options'       => array(
							'date'    		=> __('Date', 'fl-builder'),
							'name'          => __('Name', 'fl-builder')
						)
					),
                    'post_order'         => array(
						'type'          => 'select',
						'label'         => __('Order', 'fl-builder'),
						'default'       => 'ASC',
						'options'       => array(
							'ASC'    		=> __('Ascending', 'fl-builder'),
							'DESC'          => __('Descending', 'fl-builder')
						)
					)
				)
			)
		)
	),
    'style'       => array(
		'title'         => __('Style', 'fl-builder'),
		'sections'      => array(
		    'icon'       => array(
                'title'         => 'Icon',
                'fields'        => array(
                    'icon_size'       => array(
                        'type'          => 'unit',
                        'label'         => 'Icon Size',
                        'responsive'    => true,
                    ),
                    'padding' => array(
                    	'type'        => 'dimension',
                    	'label'       => 'Icon Padding',
                    	'description' => 'px',
                    	'responsive'  => true,
                    ),
                )
            ),
            'color'       => array(
                'title'         => 'Color',
                'fields'        => array(
                    'name_color'       => array(
                        'type'          => 'color',
                        'label'         => 'Audio Name Color',
                        'show_reset'    => true,
                        'preview'       => array(
                            'type'          => 'css',
                            'selector'      => '.audio-heading',
                            'property'      => 'color',
                        )
                    ), 
                )
            ),
            'typography'       => array(
                'title'         => 'Typography',
                'fields'        => array(
                    'name_typography'       => array(
                        'type'          => 'typography',
                        'label'         => 'Typography',
                        'responsive' => true,
                        'preview'       => array(
                            'type'          => 'css',
                            'selector'      => '.audio-heading',
                        )
                    )
                )
            )
		)
	)
));