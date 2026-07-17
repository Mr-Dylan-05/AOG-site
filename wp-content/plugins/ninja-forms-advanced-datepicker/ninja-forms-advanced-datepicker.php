<?php if ( ! defined( 'ABSPATH' ) ) exit;
/*
Plugin Name: Ninja Forms - Advanced Datepicker
Plugin URI: https://ninjaforms.com
Description: Advanced options for the Ninja Forms date field.
Author: Saturday Drive
Version: 3.3.1
Author URI: https://ninjaforms.com
*/

class NF_Dates
{
    function __construct()
    {
        add_filter( 'ninja_forms_register_fields', [ $this, 'add_custom_date_class' ] );
        add_filter( 'ninja_forms_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
        add_action( 'nf_admin_enqueue_scripts', [ $this, 'enqueue_admin_scripts' ] );
        add_action( 'before_delete_post', [ $this, 'update_saved_dates' ], 10, 2 );
        add_action( 'admin_init', [ $this, 'setup_license' ] );
    }

    public function enqueue_scripts()
    {
        wp_enqueue_script( 'nf_datepicker_options', plugin_dir_url( __FILE__ ) . 'js/frontend.js', array( 'jquery', 'jquery-migrate' ), false, true );
    }

    public function enqueue_admin_scripts()
    {
        wp_enqueue_script( 'nf_datepicker_options', plugin_dir_url( __FILE__ ) . 'js/builder.js', array( 'jquery', 'jquery-migrate' ), false, true );
        $nf_js_dir  = Ninja_Forms::$url . 'assets/js/lib/';
        $nf_css_dir = Ninja_Forms::$url . 'assets/css/';

        wp_enqueue_script('nf-flatpickr', $nf_js_dir . 'flatpickr.min.js', array( 'jquery' ) );
        wp_enqueue_style( 'nf-flatpickr', $nf_css_dir . 'flatpickr.css', $ver );
        wp_enqueue_style( 'nf-dates-flatpickr', plugin_dir_url( __FILE__ ) . 'css/custom-flatpickr-css.css' );
    }

    /**
     * Replaces the core NF date field with a custom version.
     * 
     * @since 3.0
     * @param array  $fields Registered fields
     */
    public function add_custom_date_class( $fields )
    {
        require_once( Ninja_Forms()::$dir . 'includes/Fields/Textbox.php' );
        require_once( dirname(__FILE__) . '/includes/class-fields-date.php' );

        $fields[ 'date' ] = new NF_Dates_Fields_Date();
        return $fields;
    }

    /**
     * When we delete a form submission, check to see if we previously added post meta about any saved dates.
     * If we did, update the saved dates option by removing the appropriate value.
     * 
     * @since  3.0
     * @param  int  $post_id
     * @param  obj  $post    $post being deleted.
     * @return void
     */
    public function update_saved_dates( $post_id, $post )
    {
        if ( 'nf_sub' != $post->post_type ) {
            return false;
        }

        $saved_dates = get_post_meta( $post_id, 'saved_date' );

        if ( ! is_array( $saved_dates ) || empty( $saved_dates ) ) {
            return false;
        } 

        foreach ( $saved_dates[ 0 ] as $field_id => $date ) {
            // Grab our currently submitted dates.
            $previously_submitted_dates = get_option( 'nf_field_' . $field_id . '_dates', [] );
            array_splice( $previously_submitted_dates, array_search( $date, $previously_submitted_dates ), 1 );
            update_option( 'nf_field_' . $field_id . '_dates', $previously_submitted_dates );
        }
    }

    /**
     * Licensing for the addon
     */
    public function setup_license() {
        if ( ! class_exists( 'NF_Extension_Updater' ) ) {
            return;
        }

        $name = 'Advanced Datepicker';
        $version = '3.3.1';
        $author = 'The WP Ninjas';
        $file = __FILE__;
        $slug = 'advanced-datepicker';

        new NF_Extension_Updater($name, $version, $author, $file, $slug);
    }
}

new NF_Dates();