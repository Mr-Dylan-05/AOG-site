<?php

/**
 * @class typingTextModule
 */
class typingTextModule extends FLBuilderModule {

	/** 
	 * @method __construct
	 */  
	public function __construct()
	{
		global $customcategory;
		parent::__construct(array(
			'name'          	=> __('Typing Text', 'fl-builder'),
			'description'   	=> __('Displays heading text with typing animation.', 'fl-builder'),
			'category'      	=> __($customcategory, 'fl-builder'),
			'partial_refresh'	=> true
		));
	}
	/**
	 * @method get_classname
	 */
	public function get_classname()
	{
		$classname = 'typing-text';
		return $classname;
	}
    
    /**
	 * Returns link rel based on settings.
	 * @since 2.2
	 * @return string
	 */
	public function get_rel() {
		$rel = array();
		if ( '_blank' == $this->settings->heading_link_target ) {
			$rel[] = 'noopener';
		}
		if ( isset( $this->settings->heading_link_nofollow ) && 'yes' == $this->settings->heading_link_nofollow ) {
			$rel[] = 'nofollow';
		}
		$rel = implode( ' ', $rel );
		if ( $rel ) {
			$rel = ' rel="' . $rel . '" ';
		}
		return $rel;
	}
}

/**
 * Register the module and its form settings.
 */
FLBuilder::register_module('typingTextModule', array(
	'content'         => array(
		'title'         => __('Content', 'fl-builder'),
		'sections'      => array(
			'general'       => array(
				'title'         => '',
				'fields'        => array(
					'items'         => array(
						'type'          => 'form',
						'label'         => __('Heading', 'fl-builder'),
						'form'          => 'heading_form', // ID from registered form below
						'preview_text'  => 'heading_text', // Name of a field to use for the preview text
						'multiple'      => true
					)
				)
			),
            'link'       => array(
				'title'         => 'Link',
				'fields'        => array(
                    'heading_link'  => array(
                        'type'          => 'link',
                        'label'         => 'Link',
                        'show_target'	=> true,
                        'show_nofollow'	=> true
                    )
				)
			)
		)
	),
    'style'         => array(
		'title'         => __('Style', 'fl-builder'),
		'sections'      => array(
			'color'       => array(
				'title'         => 'Color',
				'fields'        => array(
					'heading_color'       => array(
						'type'          => 'color',
						'label'         => 'Heading Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.typing-text > a',
							'property'      => 'color',
						)
					),
                    'cursor_color'       => array(
						'type'          => 'color',
						'label'         => 'Cursor Color',
						'show_reset'    => true,
						'preview'       => array(
							'type'          => 'css',
							'selector'      => '.typing-text .typewrite > .wrap',
							'property'      => 'border-color',
						)
					)
				)
			),
            'typography'       => array(
				'title'         => 'Typography',
				'fields'        => array(
					'heading_typography' => array(
                        'type'       => 'typography',
                        'label'      => 'Heading Typography',
                        'responsive' => true,
                        'preview'    => array(
                            'type'	    => 'css',
                            'selector'  => '.typing-text',
                        )
                    )
				)
			)
		)
	)
));

/**
 * Register a settings form to use in the "form" field type above.
 */
FLBuilder::register_settings_form('heading_form', array(
	'title' => __('Heading', 'fl-builder'),
	'tabs'  => array(
		'heading'      => array(
			'title'         => __('Heading', 'fl-builder'),
			'sections'      => array(
				'content'       => array(
					'title'         => __('Content', 'fl-builder'),
					'fields'        => array(
						'heading_text'       => array(
							'type'          => 'text',
							'label'         => 'Heading Text',
                            'default'       => 'This is an example of a typing text effect.'
						)
					)
				)
			)
		)
	)
));