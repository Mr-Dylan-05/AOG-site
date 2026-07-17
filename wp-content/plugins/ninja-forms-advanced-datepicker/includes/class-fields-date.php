<?php if ( ! defined( 'ABSPATH' ) ) exit;
/**
 * Class NF_Fields_Date
 */
class NF_Dates_Fields_Date extends NF_Fields_Textbox
{
    protected $_name = 'date';

    protected $_nicename = 'Date/Time';

    protected $_section = 'common';

    protected $_icon = 'calendar';

    protected $_type = 'date';

    protected $_templates = 'date';

    protected $_test_value = '12/12/2022';

    protected $_settings = array( 'date_mode', 'date_default', 'date_format', 'year_range', 'time_settings' );

    protected $_settings_exclude = array( 'default', 'input_limit_set', 'disable_input' );

    protected $_saved_date = [];

    protected $_error_msg = '';

    public function __construct()
    {
        parent::__construct();

        $this->_nicename = esc_html__( 'Date/Time', 'ninja-forms' );

        $this->_error_msg = esc_html__( 'That Date/Time Is Not Available.', 'ninja-forms-dates' );

        add_filter('ninja_forms_localize_field_date', [ $this,'localizeField'], 10, 2);
        add_filter('ninja_forms_localize_field_date_preview', [ $this,'localizeField'], 10, 2);
        add_filter( 'ninja_forms_custom_columns', [ $this, 'custom_columns' ], 10, 2 );
        add_filter( 'ninja_forms_subs_export_field_value_' . $this->_name, array( $this, 'filter_csv_value' ), 10, 2 );
        add_action( 'ninja_forms_after_submission', [ $this, 'update_sub_meta' ] );

        /**
         * Add all of our custom date field settings.
         */
        
        // $this->_settings[ 'use_date_range' ] = array(
        //     'name' => 'use_date_range',
        //     'type' => 'toggle',
        //     'label' => esc_html__( 'Date Range', 'ninja-forms' ),
        //     'width' => 'one-half',
        //     'group' => 'primary',
        //     'help' => '',
        //     'default' => 0,
        //     'deps' => array(
        //         'settings' => array(
        //             array( 'name' => 'date_mode', 'value' => 'date_only' ),
        //             array( 'name' => 'date_mode', 'value' => 'date_and_time' ),
        //         ),
        //         'match' => 'any',
        //     ),
        // );

        // $this->_settings[ 'use_inline' ] = array(
        //     'name' => 'use_inline',
        //     'type' => 'toggle',
        //     'label' => esc_html__( 'Inline', 'ninja-forms' ),
        //     'width' => 'one-half',
        //     'group' => 'primary',
        //     'help' => '',
        //     'default' => 0,
        //     'deps' => array(
        //         'settings' => array(
        //             array( 'name' => 'date_mode', 'value' => 'date_only' ),
        //             array( 'name' => 'date_mode', 'value' => 'date_and_time' ),
        //         ),
        //         'match' => 'any',
        //     ),
        // );

        $this->_settings[ 'date_restriction_settings' ] = array(
            'name' => 'date_restriction_settings',
            'type' => 'fieldset',
            'label' => esc_html__( 'Date/Time Restriction Settings', 'ninja-forms' ),
            'width' => 'full',
            'group' => 'primary',
            'settings' => array(
                'use_date_submission_limit' => array(
                    'name' => 'use_date_submission_limit',
                    'type' => 'toggle',
                    'label' => esc_html__( 'Limit Submissions By Date/Time', 'ninja-forms' ),
                    'width' => 'one-half',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 0,
                ),
                'date_submission_limit' => array(
                    'name' => 'date_submission_limit',
                    'type' => 'number',
                    'label' => esc_html__( 'Number of Submissions Per Date/Time', 'ninja-forms' ),
                    'width' => 'one-half',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 1,
                    'value' => 1,
                    'deps' => array(
                        'use_date_submission_limit' => 1,
                    ),
                ),
                'enable_disable_dates' => array(
                    'name' => 'enable_disable_dates',
                    'type' => 'select',
                    'label' => esc_html__( 'Manually Enable/Disable Dates', 'ninja-forms'),
                    'options' => array(
                        array(
                            'label' => esc_html__( 'Disable These Dates', 'ninja-forms' ),
                            'value' => 'disable'
                        ),
                        array(
                            'label' => esc_html__( 'Enable ONLY These Dates', 'ninja-forms' ),
                            'value' => 'enable'
                        ),
                    ),
                    'value' => 'disable',
                    'use_merge_tags' => FALSE,
                    'width' => 'full',
                    'group' => 'primary',
                    'help' => esc_html__( 'Click a date to disable/enable it. Click a day of the week to disable/enable all dates of that day.', 'ninja-forms' ),
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'date_mode', 'value' => 'date_and_time' ),
                            array( 'name' => 'date_mode', 'value' => 'date_only' ),
                        ),
                        'match' => 'any',
                    ),
                ),

                'restricted_dates' => array(
                    'name' => 'restricted_dates',
                    'type' => 'datepicker',
                    'width' => 'full',
                    'group' => 'primary',
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'date_mode', 'value' => 'date_and_time' ),
                            array( 'name' => 'date_mode', 'value' => 'date_only' ),
                        ),
                        'match' => 'any',
                    ),
                ),
            ),
        );
        //Add min /max dates options
        if(null !== Ninja_Forms::VERSION && (Ninja_Forms::VERSION > "3.6.29" || Ninja_Forms::VERSION === "3.0-versionNumberPlaceholder")){
            $insert_settings = [
                'min_date' => [
                    'name' => 'min_date',
                    'class' =>  'min_date',
                    'type' => 'datepicker',
                    'label' => esc_html__( 'Set first selectable date : ', 'ninja-forms' ),
                    'width' => 'full',
                    'group' => 'primary',
                    'default' => null
                ],
                'max_date' => [
                    'name' => 'max_date',
                    'type' => 'datepicker',
                    'label' => esc_html__( 'Set last selectable date :    ', 'ninja-forms' ),
                    'width' => 'full',
                    'group' => 'primary',
                    'default' => null
                ]
            ];
            $this->_settings[ 'date_restriction_settings' ]['settings'] = array_merge(
                $this->_settings[ 'date_restriction_settings' ]['settings'],
                $insert_settings    
            );
        }

        $date_time_24_hours_options = array();
        for ($i=0; $i < 24 ; $i++) { 
            $date_time_24_hours_options[] = array( 'label' => $i, 'value' => $i );
        }

        $date_time_12_hours_options = array();
        for ($i=1; $i <= 12 ; $i++) { 
            $date_time_12_hours_options[] = array( 'label' => $i, 'value' => $i );
        }

        $date_time_minutes_options = array();
        for ($i=0; $i <= 59 ; $i++) {
            $output = $i;
            if ( 10 > $i ) {
                $output = '0' . $i;
            } 
            $date_time_minutes_options[] = array( 'label' => $output, 'value' => $i );
        }

        $this->_settings[ 'time_settings' ] = array(
            'name' => 'time_settings',
            'type' => 'fieldset',
            'label' => esc_html__( 'Time Settings', 'ninja-forms' ),
            'width' => 'full',
            'group' => 'primary',
            'settings' => array(
                'hours_24' => array(
                    'name' => 'hours_24',
                    'type' => 'toggle',
                    'label' => esc_html__( '24 Hour Input', 'ninja-forms' ),
                    'width' => 'one-half',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 0,
                    'value' => 0,
                ),
                'limit_hours' => array(
                    'name' => 'limit_hours',
                    'type' => 'toggle',
                    'label' => esc_html__( 'Limit Hours', 'ninja-forms' ),
                    'width' => 'one-half',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 0,
                    'value' => 0,
                ),
                'start_hour_24' => array(
                    'name' => 'start_hour_24',
                    'type' => 'select',
                    'label' => esc_html__( 'Earliest Time', 'ninja-forms' ),
                    'width' => 'one-half',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 0,
                    'value' => 0,
                    'options' => $date_time_24_hours_options,
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'hours_24', 'value' => 1 ),
                            array( 'name' => 'limit_hours', 'value' => 1 ),
                        ),
                        'match' => 'all',
                    ),
                ),
                'start_minute_24' => array(
                    'name' => 'start_minute_24',
                    'type' => 'select',
                    'label' => '&nbsp;',
                    'width' => 'one-half',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 0,
                    'value' => 0,
                    'options' => $date_time_minutes_options,
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'hours_24', 'value' => 1 ),
                            array( 'name' => 'limit_hours', 'value' => 1 ),
                        ),
                        'match' => 'all',
                    ),
                ),
                'end_hour_24' => array(
                    'name' => 'end_hour_24',
                    'type' => 'select',
                    'label' => esc_html__( 'Latest Time', 'ninja-forms' ),
                    'width' => 'one-half',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 23,
                    'value' => 23,
                    'options' => $date_time_24_hours_options,
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'hours_24', 'value' => 1 ),
                            array( 'name' => 'limit_hours', 'value' => 1 ),
                        ),
                        'match' => 'all',
                    ),
                ),
                'end_minute_24' => array(
                    'name' => 'end_minute_24',
                    'type' => 'select',
                    'label' => '&nbsp;',
                    'width' => 'one-half',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 0,
                    'value' => 0,
                    'options' => $date_time_minutes_options,
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'hours_24', 'value' => 1 ),
                            array( 'name' => 'limit_hours', 'value' => 1 ),
                        ),
                        'match' => 'all',
                    ),
                ),
                'start_hour_12' => array(
                    'name' => 'start_hour_12',
                    'type' => 'select',
                    'label' => esc_html__( 'Earliest Time', 'ninja-forms' ),
                    'width' => 'one-third',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 12,
                    'value' => 12,
                    'options' => $date_time_12_hours_options,
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'hours_24', 'value' => 0 ),
                            array( 'name' => 'limit_hours', 'value' => 1 ),
                        ),
                        'match' => 'all',
                    ),
                ),
                'start_minute_12' => array(
                    'name' => 'start_minute_12',
                    'type' => 'select',
                    'label' => '&nbsp;',
                    'width' => 'one-third',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 0,
                    'value' => 0,
                    'options' => $date_time_minutes_options,
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'hours_24', 'value' => 0 ),
                            array( 'name' => 'limit_hours', 'value' => 1 ),
                        ),
                        'match' => 'all',
                    ),
                ),
                'start_hour_12_ampm' => array(
                    'name' => 'start_hour_12_ampm',
                    'type' => 'select',
                    'label' => '&nbsp;',
                    'width' => 'one-third',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 'am',
                    'value' => 'am',
                    'options' => array(
                        array( 
                            'label' => 'AM',
                            'value' => 'am',
                        ),
                        array( 
                            'label' => 'PM',
                            'value' => 'pm',
                        ),
                    ),
                    'default' => 'am',
                    'value' => 'am',
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'hours_24', 'value' => 0 ),
                            array( 'name' => 'limit_hours', 'value' => 1 ),
                        ),
                        'match' => 'all',
                    ),
                ),
                'end_hour_12' => array(
                    'name' => 'end_hour_12',
                    'type' => 'select',
                    'label' => esc_html__( 'Latest Time', 'ninja-forms' ),
                    'width' => 'one-third',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 12,
                    'value' => 12,
                    'options' => $date_time_12_hours_options,
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'hours_24', 'value' => 0 ),
                            array( 'name' => 'limit_hours', 'value' => 1 ),
                        ),
                        'match' => 'all',
                    ),
                ),
                'end_minute_12' => array(
                    'name' => 'end_minute_12',
                    'type' => 'select',
                    'label' => '&nbsp;',
                    'width' => 'one-third',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 0,
                    'value' => 0,
                    'options' => $date_time_minutes_options,
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'hours_24', 'value' => 0 ),
                            array( 'name' => 'limit_hours', 'value' => 1 ),
                        ),
                        'match' => 'all',
                    ),
                ),
                'end_hour_12_ampm' => array(
                    'name' => 'end_hour_12_ampm',
                    'type' => 'select',
                    'label' => '&nbsp;',
                    'width' => 'one-third',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 'am',
                    'value' => 'am',
                    'options' => array(
                        array( 
                            'label' => 'AM',
                            'value' => 'am',
                        ),
                        array( 
                            'label' => 'PM',
                            'value' => 'pm',
                        ),
                    ),
                    'deps' => array(
                        'settings' => array(
                            array( 'name' => 'hours_24', 'value' => 0 ),
                            array( 'name' => 'limit_hours', 'value' => 1 ),
                        ),
                        'match' => 'all',
                    ),
                ),
                'minute_increment' => array(
                    'name' => 'minute_increment',
                    'type' => 'number',
                    'label' => esc_html__( 'Minute Increment', 'ninja-forms' ),
                    'width' => 'full',
                    'group' => 'primary',
                    'help' => '',
                    'default' => 5,
                    'value' => 5,
                ),
            ),
            'deps' => array(
                'settings' => array(
                    array( 'name' => 'date_mode', 'value' => 'date_and_time' ),
                    array( 'name' => 'date_mode', 'value' => 'time_only' ),
                ),
                'match' => 'any',
            ),
        );
    }

    /**
     * During form processing, we need to do two things:
     *
     * 1) Update our saved dates WordPress option so that we can disable them on the frontend.
     * 2) Update our class variable _saved_date with this field ID and the date submitted so that we can update our submission with the proper meta after submission processing.
     * 
     * @since  3.0
     * @param  array  $field  submitted date field data
     * @param  array  $data   submission data
     * @return void
     */
    public function process( $field, $data )
    {
        // When we submit the form, record this date field value so that we can test for submission limits later.
        $previously_submitted_dates = get_option( 'nf_field_' . $field[ 'id' ] . '_dates', [] );
        $date_format = $field[ 'settings' ][ 'date_format' ];

        if ( is_array( $field[ 'value' ] ) ) {
            $submitted_date = $this->convert_format( $field[ 'value' ][ 'date' ], $date_format );
            $submitted_hour = $field[ 'value' ][ 'hour' ];
            $submitted_minute = $field[ 'value' ][ 'minute' ];
            $submitted_ampm = $field[ 'value' ][ 'ampm' ];
            $formatted_date = $submitted_date . ' ' . $submitted_hour . ':' . $submitted_minute;
            if( ! empty ( $submitted_ampm ) ) {
                $formatted_date .= ' ' . $submitted_ampm;
            }
        } else {
            // Convert our submitted date value to yyyy-mm-dd format.
            $formatted_date = $this->convert_format( $field[ 'value' ], $date_format );
        }

        $formatted_date = strtotime( $formatted_date );

        $previously_submitted_dates[] = $formatted_date;
        
        update_option( 'nf_field_' . $field[ 'id' ] . '_dates', $previously_submitted_dates, false );

        $this->_saved_date[ $field[ 'id' ] ] = $formatted_date;

        return $data;
    }

    /**
     * When our form is submitted, ensure that the date submitted for this field is valid. 
     *
     * Things we need to check:
     *
     * 1) disabled dates setup for this field.
     * 2) disabled weekdays setup for this field.
     * 3) date submission limits setup for this field.
     *      
     * @since  3.0
     * @param  array   $field  NF field being validated
     * @param  array   $data   All submitted form data
     * @return string          Error Text
     */
    public function validate( $field, $data ) {
        /**
         * If our field value is empty, return false;
         */
        if ( empty( $field[ 'value' ] ) ) {
            return false;
        }

        $date_format = $field[ 'settings' ][ 'date_format' ];
        $enable_disable_dates = $field[ 'settings' ][ 'enable_disable_dates' ];
        $restricted_weekdays = isset ( $field[ 'settings' ][ 'restricted_weekdays' ] ) ? $field[ 'settings' ][ 'restricted_weekdays' ] : [];

        if ( is_array( $field[ 'value' ] ) ) {
            $submitted_date = $this->convert_format( $field[ 'value' ][ 'date' ], $date_format );
            $submitted_hour = $field[ 'value' ][ 'hour' ];
            $submitted_minute = $field[ 'value' ][ 'minute' ];
            $submitted_ampm = $field[ 'value' ][ 'ampm' ];
            $formatted_date = $submitted_date . ' ' . $submitted_hour . ':' . $submitted_minute;
            if( ! empty ( $submitted_ampm ) ) {
                $formatted_date .= ' ' . $submitted_ampm;
            }
        } else {
            // Convert our submitted date value to yyyy-mm-dd format.
            $formatted_date = $submitted_date = $this->convert_format( $field[ 'value' ], $date_format );
        }

        $date_timestamp = strtotime( $formatted_date );
        $day_of_the_week = date( 'w', $date_timestamp );
        /**
         * Check to see if the submission values for this field match our disabled dates.
         */
        if ( isset ( $field[ 'settings' ][ 'restricted_dates' ] ) ) {
            $restricted_dates = $field[ 'settings' ][ 'restricted_dates' ];
            $restricted_dates = explode( ',', $restricted_dates );
        } else {
            $restricted_dates = [];
        }

        /**
         * If enable_disable_dates is set to 'enable', then we only want dates IN the restricted list.
         * Otherwise, if it's set to 'disable', then we only want dates OUTSIDE the restricted list.
         */
        if ( 'enable' == $enable_disable_dates ) {
            if (
                ! in_array( $submitted_date, $restricted_dates )
                &&
                ! in_array( $day_of_the_week, $restricted_weekdays )
            ) {
                return $this->_error_msg;
            }
        } else { // 'disable'
            if (
                in_array( $submitted_date, $restricted_dates )
                ||
                in_array( $day_of_the_week, $restricted_weekdays )
            ) {
                return $this->_error_msg;
            }
        }

        /**
         * Check to see if we have submission limits and the submitted date has already been recorded.
         */
        if ( $this->check_date_submission_limit( $date_timestamp, $field ) ) {
            return $this->_error_msg;
        }

        /**
         * Check to make sure that we don't have a date_mode of 'date_only' and a time limit set and if our submitted time matches
         */
        if ( ( isset ( $field[ 'settings' ][ 'date_mode' ] ) && 'date_only' != $field[ 'settings' ][ 'date_mode' ] )
            && ( isset ( $field[ 'settings' ][ 'limit_hours' ] ) && 1 == $field[ 'settings' ][ 'limit_hours' ] )
        ){
            // Check to see if we're in 24 hour format.
            $hours = isset( $field[ 'settings' ][ 'hours_24' ] ) ? 24 : 12;

            // Get our earliest and latest hours and minutes.
            $earliest_hour = isset( $field[ 'settings' ][ 'start_hour_' . $hours ] ) ? $field[ 'settings' ][ 'start_hour_' . $hours ] : false;
            $earliest_minute = isset( $field[ 'settings' ][ 'start_minute_' . $hours ] ) ? $field[ 'settings' ][ 'start_minute_' . $hours ] : false;

            $latest_hour = isset( $field[ 'settings' ][ 'end_hour_' . $hours ] ) ? $field[ 'settings' ][ 'end_hour_' . $hours ] : false;
            $latest_minute = isset( $field[ 'settings' ][ 'end_minute_' . $hours ] ) ? $field[ 'settings' ][ 'end_minute_' . $hours ] : false;
            
            $earliest_ampm = isset( $field[ 'settings' ][ 'start_hour_' . $hours . '_am' ] ) ? $field[ 'settings' ][ 'start_hour_' . $hours . '_am' ] : false;
            $latest_ampm = isset( $field[ 'settings' ][ 'end_hour_' . $hours . '_am' ] ) ? $field[ 'settings' ][ 'end_hour_' . $hours . '_am' ] : false;
            
            // Format our earliest and latest hours as 24 time if they aren't already.
            $earliest_hour = $this->convert_hour_to_24( $earliest_hour, $earliest_ampm );
            $latest_hour = $this->convert_hour_to_24( $latest_hour, $latest_ampm );

            $submitted_hour = $this->convert_hour_to_24( $submitted_hour, $submitted_ampm );

            $earliest_time = $earliest_hour . ':' . $earliest_minute;
            $latest_time = $latest_hour . ':' . $latest_minute;
            $submitted_time = $submitted_hour . ':' . $submitted_minute;

            if ( $earliest_time > $submitted_time || $latest_time < $submitted_time ) {
                return esc_html__( 'That Time Is Not Available.', 'ninja-forms' );
            }
        }
    }

    private function convert_hour_to_24 ( $hour, $ampm = false )
    {
        // Convert our selected time into 24 hr clock.
        if ( 12 == $hour && 'am' == $ampm ) {
            $hour = 0;
        } else if ( 12 > $hour && 'pm' == $ampm ) {
            $hour += 12;
        }
        
        $hour = sprintf( "%02d", $hour );

        return $hour;
    }

    private function get_format( $format )
    {
        $lookup = array(
            'MM/DD/YYYY' => esc_html__( 'm/d/Y', 'ninja-forms' ),
            'MM-DD-YYYY' => esc_html__( 'm-d-Y', 'ninja-forms' ),
            'MM.DD.YYYY' => esc_html__( 'm.d.Y', 'ninja-forms' ),
            'DD/MM/YYYY' => esc_html__( 'm/d/Y', 'ninja-forms' ),
            'DD-MM-YYYY' => esc_html__( 'd-m-Y', 'ninja-forms' ),
            'DD.MM.YYYY' => esc_html__( 'd.m.Y', 'ninja-forms' ),
            'YYYY-MM-DD' => esc_html__( 'Y-m-d', 'ninja-forms' ),
            'YYYY/MM/DD' => esc_html__( 'Y/m/d', 'ninja-forms' ),
            'YYYY.MM.DD' => esc_html__( 'Y.m.d', 'ninja-forms' ),
            'dddd, MMMM D YYYY' => esc_html__( 'l, F d Y', 'ninja-forms' ),
        );

        return ( isset( $lookup[ $format ] ) ) ? $lookup[ $format ] : $format;
    }

    /**
     * In order to decide if a submitted dates matches a disabled date or one that's 
     * already been submitted, we need to put them in the same format. The trickiest
     * part is that users can have one of several different "date formats" setup for
     * this field. Because PHP strictly uses / for MM/DD/YYYY format and - for
     * DD-MM-YYYY format, we have to take the "date format" setting into accoutn when
     * we adjust our submitted value to Y-m-d.
     * 
     * @since  3.0
     * @param  string  $date   String date to be converted to Y-m-d.
     * @param  string  $format String date_format setting for this field.
     * @return string          Date in Y-m-d format.
     */
    private function convert_format( $date, $format )
    {
        // If we're in DD/MM/YYY or DD.MM.YYYY format, convert to DD-MM-YYYY format
        if ( 'DD/MM/YYYY' == $format || 'DD.MM.YYYY' == $format ) {
            $date = str_replace( [ '/', '.' ], '-', $date );
        }

        // If we're in MM-DD-YYYY or MM.DD.YYYY format, convert to MM/DD/YYYY format
        if ( 'MM-DD-YYYY' == $format || 'MM.DD.YYYY' == $format ) {
            $date = str_replace( [ '-', '.' ], '/', $date );
        }

        return date( 'Y-m-d', strtotime( $date ) );
    }

    /**
     * Check to see if a submitted date value has reached a submission limit, if it's set.
     * Return true if it has and false if it hasn't or the submission limit setting is not being used.
     * 
     * @since  3.0
     * @param  string  $date  
     * @param  array   $field Field data, i.e. id, settings, etc.
     * @return bool           true if we've reached the limit, false otherwise.
     */
    private function check_date_submission_limit( $date, $field )
    {   
        /**
         * If we haven't set the use_date_submission_limit setting or it's not on, return false.
         */
        if ( ! isset ( $field[ 'settings' ][ 'use_date_submission_limit' ] )
            || 1 != $field[ 'settings' ][ 'use_date_submission_limit' ]
        ) {
            return false;
        }

        /**
         * Depending upon when this function is called, the id may be at the top level or at settings.
         */
        if ( isset ( $field[ 'id' ] ) ) {
            $field_id = $field[ 'id' ];
        } else if ( isset ( $field[ 'settings' ][ 'id' ] ) ) {
            $field_id = $field[ 'settings' ][ 'id' ];
        }

        // Grab our submission limit.
        $date_submission_limit = $field[ 'settings' ][ 'date_submission_limit' ];
        // Grab our currently submitted dates.
        $previously_submitted_dates = get_option( 'nf_field_' . $field_id . '_dates', [] );

        // If our submitted date exists in our array, check how many times it appears and compare to our limit.
        if ( in_array( $date, $previously_submitted_dates ) ) {
            $counted_values = array_count_values( $previously_submitted_dates );
            $count = $counted_values[ $date ];
            if ( $count >= $date_submission_limit ) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * When we localise this field, make sure that any dates that meet our submission limit are disabled.
     * 
     * @since  3.0
     * @param  array  $field  Array of field settings
     * @return void
     */
    public function localizeField( $field )
    {
        if ( ! isset ( $field[ 'settings' ][ 'submitted_dates' ] ) ) {
            $field[ 'settings' ][ 'submitted_dates' ] = '';
        }

        /**
         * Depending upon when this function is called, the id may be at the top level or at settings.
         */
        if ( isset ( $field[ 'id' ] ) ) {
            $field_id = $field[ 'id' ];
        } else if ( isset ( $field[ 'settings' ][ 'id' ] ) ) {
            $field_id = $field[ 'settings' ][ 'id' ];
        }

        $taken_dates = [];
        $submitted_dates = [];
        $previously_submitted_dates = get_option( 'nf_field_' . $field_id . '_dates', [] );
        // Loop over our previously submitted dates, and if we've hit the limit on any of our submitted dates, add them to the submitted_dates value.
        foreach ( $previously_submitted_dates as $submitted_date ) {
            if ( $this->check_date_submission_limit( $submitted_date, $field ) ) {
                $taken_dates[ date( 'Y-m-d', $submitted_date ) ][] = [ 'hour' => date( 'H', $submitted_date ), 'minute' => date( 'i', $submitted_date ) ];
                // If we're in date_only mode, we don't care about hours and minutes.
                if ( isset ( $field[ 'settings' ][ 'date_mode' ] ) && 'date_only' == $field[ 'settings' ][ 'date_mode' ] ) {
                    $submitted_dates[] = date( 'Y-m-d', $submitted_date );
                }
            }
        }

        $field[ 'settings' ][ 'taken_dates' ] = $taken_dates;

        if ( ! empty ( $submitted_dates ) ) {
            $field[ 'settings' ][ 'submitted_dates' ] .= ',' . implode( ',', $submitted_dates );
        }

        /**
         * Time-specific settings below.
         * If this is a "date_only" field, we can bail early.
         */
        if ( isset ( $field[ 'settings' ][ 'date_mode' ] ) && 'date_only' == $field[ 'settings' ][ 'date_mode' ] ) {
            return $field;
        }

        // Defaults to 12 hr clock
        $hours = 12;
        $first_hour = 1;
        $first_minute = isset( $field[ 'settings' ][ 'start_minute_12' ] ) ? $field[ 'settings' ][ 'start_minute_12' ] : 0;
        $last_minute = isset( $field[ 'settings' ][ 'end_minute_12' ] ) ? $field[ 'settings' ][ 'end_minute_12' ] : 59;
        $hours_options = '<option value="12">12</option>';

        if ( isset ( $field[ 'settings' ][ 'hours_24' ] ) && 1 == $field[ 'settings' ][ 'hours_24' ] ) {
            // If we've set an earliest time and a latest time, set those up.
            // $hours = isset( $field[ 'settings' ][ 'end_hour_24' ] ) ? $field[ 'settings' ][ 'end_hour_24' ] + 1 : 24;
            $hours = 24;
            // $first_hour =  isset( $field[ 'settings' ][ 'start_hour_24' ] ) ? $field[ 'settings' ][ 'start_hour_24' ] : 0;
            $first_hour = 0;
            $first_minute =  isset( $field[ 'settings' ][ 'start_minute_24' ] ) ? $field[ 'settings' ][ 'start_minute_24' ] : 0;
            $last_minute =  isset( $field[ 'settings' ][ 'end_minute_24' ] ) ? $field[ 'settings' ][ 'end_minute_24' ] : 59;
            
            $hours_options = '';
        }

        for ( $i = $first_hour; $i < $hours; $i++ ) {
            $output = $i;
            if ( $i < 10 ) {
                $output = '0' . $i;
            }
            $hours_options .= '<option value="' . $output . '">' . $output . '</option>';
        }

        $field[ 'settings' ][ 'hours_options' ] = $hours_options;
        $field[ 'settings' ][ 'first_minute' ] = $first_minute;
        $field[ 'settings' ][ 'last_minute' ] = $last_minute;

        return $field;
    }

    /**
     * When we complete our submission, add meta to it to indicate that we've saved data data in an option.
     * @since  3.0
     * @param  array  $data Submission data.
     * @return void
     */
    public function update_sub_meta( $data )
    {
        // If we don't have a save action on this form, bail early.
        if ( ! isset ( $data[ 'actions' ][ 'save' ][ 'sub_id' ] ) ) {
            return false;
        }

        $sub_id = $data[ 'actions' ][ 'save' ][ 'sub_id' ];

        /*
         * Add a piece of post meta to our submission with the "saved date" key.
         * Keep in mind that a submission may have multiple "saved date" keys if it has multiple date fields.
         */ 
        update_post_meta( $sub_id, 'saved_date', $this->_saved_date );
    }

    public function custom_columns( $field_value, $field )
    {
        if( $this->_name != $field->get_setting( 'type' ) ) return $field_value;
        return $this->stringify_value( $field_value, $field );
    }

    public function filter_csv_value( $field_value, $field ) {
        $field_value = $this->stringify_value( $field_value, $field );
        return parent::filter_csv_value( $field_value, $field );
    }

    public function admin_form_element( $id, $value )
    {
        $form_id = get_post_meta( absint( $_GET[ 'post' ] ), '_form_id', true );

        $field = Ninja_Forms()->form( $form_id )->get_field( $id );

        // If the value is an array, output an appropriate edit element.
        if ( ! is_array( $value ) ) return '<input class="widefat" name="fields[' . $id . '][date]" value="' . $value . '" type="text">';

        $edit_values = '';

        // Get our date and time, the combine them into a string.
        $date = isset ( $value[ 'date' ] ) ? $value[ 'date' ] : '';
        $hour = isset ( $value[ 'hour' ] ) ? $value[ 'hour' ] : '';
        $minute = isset ( $value[ 'minute' ] ) ? $value[ 'minute' ] : '';
        $ampm = isset ( $value[ 'ampm' ] ) ? $value[ 'ampm' ] : '';
        $time = '';

        $hours_options = $this->get_hours_options( $hour, $field );
        $minutes_options = $this->get_minutes_options( $minute, $field );        

        if ( ! empty ( $date ) ) {
            $edit_values = '<input class="" name="fields[' . $id . '][date]" value="' . $date . '" type="text">';
        }

        if ( ! empty ( $hour ) && ! empty ( $minute ) ) {
            $edit_values .= '<select class="" name="fields[' . $id . '][hour]" id="">' . $hours_options . '</select>';
            $edit_values .= ':<select class="" name="fields[' . $id . '][minute]" id="">' . $minutes_options . '</select>';
        
            // Display an edit for am/pm if necessary
            if ( 1 != $field->get_setting( 'hours_24' ) ) {
                $selected_am = ( 'am' == $ampm ) ? 'selected="selected"' : '';
                $selected_pm = ( 'pm' == $ampm ) ? 'selected="selected"' : '';
                $edit_values .= ' <select class="" name="fields[' . $id . '][ampm]" id="">
                    <option value="am" ' . $selected_am . '>AM</option>
                    <option value="pm" ' . $selected_pm . '>PM</option>
                </select>';
            }
        }

        return $edit_values;
    }

    private function stringify_value( $field_value, $field )
    {
        if ( ! is_array( $field_value ) ) {
            return $field_value;
        }

        // Get our date and time, the combine them into a string.
        $date = isset ( $field_value[ 'date' ] ) ? $field_value[ 'date' ] : '';
        $hour = isset ( $field_value[ 'hour' ] ) ? $field_value[ 'hour' ] : '';
        $minute = isset ( $field_value[ 'minute' ] ) ? $field_value[ 'minute' ] : '';
        $ampm = isset ( $field_value[ 'ampm' ] ) ? $field_value[ 'ampm' ] : '';
        $time = '';

        if ( ! empty ( $hour ) && ! empty ( $minute ) ) {
            $time = ' ' . $hour . ':' . $minute;
            // Display an edit for am/pm if necessary
            if ( 1 != $field->get_setting( 'hours_24' ) ) {
                $time .= ' ' . $ampm;
            }
        }

        return $date . $time;
    }

    private function get_hours_options( $hour, $field )
    {
        if ( is_object( $field ) ) {
            $hours_24 = $field->get_setting( 'hours_24' );
        } elseif ( is_array( $field ) ) {
            $hours_24 = $field[ 'settings' ][ 'hours_24' ];
        }
        
        // Defaults
        $hours = 12;
        $first_hour = 1;
        $hours_options = '<option value="12">12</option>';

        if ( 1 == $hours_24 ) {
            $hours = 24;
            $first_hour = 0;
            $hours_options = '';
        }

        for ( $i = $first_hour; $i < $hours; $i++ ) {
            $output = $i;
            if ( $i < 10 ) {
                $output = '0' . $i;
            }

            $selected = '';

            if ( $hour == $output ) {
                $selected = 'selected="selected"';
            }

            $hours_options .= '<option value="' . $output . '" ' . $selected . '>' . $output . '</option>';
        }

        return $hours_options;
    }

    private function get_minutes_options( $minute, $field )
    {
        if ( is_object( $field ) ) {
            $minute_increment = $field->get_setting( 'minute_increment' );
        } elseif ( is_array( $field ) ) {
            $minute_increment = $field[ 'settings' ][ 'minute_increment' ];
        }

        /**
         * Minutes Select Options
         */
        $minutes_options = '';

        $i = 0;
        while ( $i < 60 ) {
            $output = $i;
            if ( $i < 10 ) {
                $output = '0' . $i;
            }

            $selected = '';

            if ( $minute == $output ) {
                $selected = 'selected="selected"';
            }

            $minutes_options .= '<option value="' . $output . '" ' . $selected . '>' . $output . '</option>';
            $i += $minute_increment;
        }

        return $minutes_options;
    }
}