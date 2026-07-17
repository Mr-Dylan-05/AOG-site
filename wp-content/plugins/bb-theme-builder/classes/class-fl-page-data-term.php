<?php

/**
 * Handles logic for page data site properties.
 *
 * @since 1.0
 */
final class FLPageDataTerm {

	/**
	 * Returns the current term ID.
	 *
	 * @since 2.9
	 * @return int
	 */
	static public function get_id() {
		global $fl_term;
		return $fl_term ? $fl_term->term_id : 0;
	}

	/**
	 * Returns the current term title.
	 *
	 * @since 2.9
	 * @return string
	 */
	static public function get_title() {
		global $fl_term;
		return $fl_term ? $fl_term->name : '';
	}

	/**
	 * Returns the current term url.
	 *
	 * @since 2.9
	 * @return string
	 */
	static public function get_url() {
		global $fl_term;
		return $fl_term ? get_term_link( self::get_id() ) : '';
	}

	/**
	 * Returns the current term description.
	 *
	 * @since 2.9
	 * @return string
	 */
	static public function get_description() {
		global $fl_term;
		return $fl_term ? $fl_term->description : '';
	}

	/**
	 * Returns the current term meta.
	 *
	 * @since 2.9
	 * @return string
	 */
	static public function get_term_meta( $settings ) {

		if ( empty( $settings->key ) ) {
			return '';
		}
		$term_id = self::get_id();
		return get_term_meta( $term_id, $settings->key, true );
	}
}
