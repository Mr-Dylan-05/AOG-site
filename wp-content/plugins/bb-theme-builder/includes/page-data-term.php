<?php

/**
 * Term Title
 */
FLPageData::add_post_property( 'term_title', array(
	'label'  => __( 'Term Title', 'bb-theme-builder' ),
	'group'  => 'term',
	'type'   => 'string',
	'getter' => 'FLPageDataTerm::get_title',
) );

/**
 * Term URL
 */
FLPageData::add_post_property( 'term_url', array(
	'label'  => __( 'Term URL', 'bb-theme-builder' ),
	'group'  => 'term',
	'type'   => 'url',
	'getter' => 'FLPageDataTerm::get_url',
) );

/**
 * Term Description
 */
FLPageData::add_post_property( 'term_description', array(
	'label'  => __( 'Term Description', 'bb-theme-builder' ),
	'group'  => 'term',
	'type'   => 'string',
	'getter' => 'FLPageDataTerm::get_description',
) );

/*
 * Term Meta
 */
FLPageData::add_post_property( 'term_meta', array(
	'label'  => __( 'Term Meta', 'bb-theme-builder' ),
	'group'  => 'term',
	'type'   => 'all',
	'getter' => 'FLPageDataTerm::get_term_meta',
) );

FLPageData::add_post_property_settings_fields( 'term_meta', array(
	'key' => array(
		'type'  => 'text',
		'label' => __( 'Key', 'bb-theme-builder' ),
	),
) );
