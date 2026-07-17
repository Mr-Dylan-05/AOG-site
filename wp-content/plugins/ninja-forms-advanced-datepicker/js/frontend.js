var customFrontendFlatPickr = Marionette.Object.extend( {
    use_inline: false,
    el: false,
    currentDate: false,

    initialize: function() {
        /**
         * Listen to our date pickers as they are created on the page.
         */
        this.listenTo( Backbone.Radio.channel( 'flatpickr' ), 'init', this.modifyDatepicker );    
    
        /**
         * When we change our field, clear field errors.
         */
        var fieldsChannel = Backbone.Radio.channel( 'fields' );
        this.listenTo( fieldsChannel, 'change:modelValue', this.clearErrors );

        /**
         * Filter flatpickr settings.
         */
        Backbone.Radio.channel( 'flatpickr' ).reply( 'filter:settings', this.filterSettings, this );
    
        this.listenTo( nfRadio.channel( 'date' ), 'change:extra', this.changeTime );
        this.listenTo( nfRadio.channel( 'date' ), 'render:view', this.setupInitialState );
    },

    modifyDatepicker: function( dateObject, fieldModel , view) {
        if ( this.use_inline ) {
            jQuery( this.el ).find( '.form-control' ).hide();
        }
        //Set first and last dates available
        const minDate = fieldModel.get( 'min_date' ),
        maxDate = fieldModel.get( 'max_date' );
        if(minDate && minDate.length > 0) dateObject.set( 'minDate', minDate );
        if(maxDate && maxDate.length > 0) dateObject.set( 'maxDate', maxDate );
        
        // Select setting that will either be 'enable' or 'disable'. Tells us how to restrict our dates.
        let enableDisableDates = fieldModel.get( 'enable_disable_dates' );
        // List of dates that we want to restrict.
        let restrictedDates = fieldModel.get( 'restricted_dates' );
        // date_only, time_only, or date_and_time
        let dateMode = fieldModel.get( 'date_mode' );
        let restrictedWeekdays = fieldModel.get( 'restricted_weekdays' );
        if ( 'undefined' == typeof restrictedWeekdays ) {
            restrictedWeekdays = [];
        }
        let useDateSubmissionLimit = fieldModel.get( 'use_date_submission_limit' );
        let submittedDates = fieldModel.get( 'submitted_dates' );
        if ( 'undefined' == typeof submittedDates ) {
            submittedDates = [];
        }

        dateObject.set( 'disable', [ function ( date ) {
            let disableDate = false;
            if ( 'undefined' != typeof restrictedDates && null != restrictedDates ) {
                let restrictedDatesArray = restrictedDates.split( ',' );
                /**
                 * If enableDisableDates is set to 'enable', then we want to ONLY allow selections within the restrictedDates value.
                 * if enableDisableDates is set to 'disable', then we want to PREVENT selections within the restrictedDates value.
                 */
                if ( 'enable' == enableDisableDates ) {
                    // If our selected date is NOT in our restricted dates array AND it's not in our weekday restriction, disable.
                    if (
                        -1 == restrictedDates.indexOf( flatpickr.formatDate( date, 'Y-m-d' ) )
                        &&
                        -1 == restrictedWeekdays.indexOf( date.getDay() )
                        ) {
                        disableDate = true;
                    }
                } else { // 'disable'
                    // If our selected date IS in our restricted dates array, disable.
                    if (
                        -1 != restrictedDates.indexOf( flatpickr.formatDate( date, 'Y-m-d' ) )
                        ||
                        -1 != restrictedWeekdays.indexOf( date.getDay() )
                        ) {
                        disableDate = true;
                    }
                }
            }

            if ( 'undefined' != typeof submittedDates && useDateSubmissionLimit ) {
                if ( -1 != submittedDates.indexOf( flatpickr.formatDate( date, 'Y-m-d' ) ) ) {
                    disableDate = true;
                }
            }
            return disableDate;
        } ] );

        let that = this;
        dateObject.set( 'onChange', function ( selectedDates, dateStr, instance ) {
            if ( 'date_and_time' != dateMode ) {
                return false;
            }

            that.currentDate = selectedDates[0];
            that.setupInitialState( view );
        } );
    },

    clearErrors: function( model ) {
        if ( 'date' == model.get( 'type' ) ) {
            nfRadio.channel( 'fields' ).request( 'remove:error', model.get( 'id' ), 'required-error' );
        }
    },

    filterSettings: function( settings, view ) {
        if ( 'undefined' != typeof view.model.get( 'use_inline' ) && 1 == view.model.get( 'use_inline' ) ) {
            settings.inline = true;
            this.use_inline = true;
            this.el = view.el;
        }

        if ( 'undefined' != typeof view.model.get( 'use_date_range' ) && 1 == view.model.get( 'use_date_range' ) ) {
            settings.mode = 'range';
        }

        return settings;
    },

    /**
     * Listens for changes to the AMPM or Hour selector.
     * 
     * @since  3.0
     * @param  {object}         e          jQuery event object
     * @param  {Backbone.Model} fieldModel Backbone.model of field data
     * @return {bool}
     */
    changeTime: function( e, fieldModel ) {
        if ( 1 != fieldModel.get( 'limit_hours' ) && 1 != fieldModel.get( 'use_date_submission_limit' ) ) {
            return false;
        }
        // Call our maybeDisableHours function and pass in the event target (select element) and field model.
        this.maybeDisableHours( e.target, fieldModel );
        return false;
    },

    /**
     * Maybe disable hours if we setup hour limits for this date/time field.
     * 
     * @since  3.0
     * @param  {jQuery Object}      select      jQuery object representing the .ampm or .hour select elements.
     * @param  {Backbone.Model}     fieldModel  Backbone Model
     * @return {void}
     */
    maybeDisableHours: function( select, fieldModel ) {
        let hourSelect = false;
        let ampmSelect = false;

        /**
         * If the select variable has a class of 'hour', then we were passed an hour select
         * Otherwise, we were passed an ampm select.
         */
        if ( jQuery( select ).hasClass( 'hour' ) ) {
            hourSelect = select;
            ampmSelect = jQuery( select ).parent().siblings( 'div' ).find( '.ampm' );
        } else {
            ampmSelect = select;
            hourSelect = jQuery( select ).parent().siblings( 'div' ).find( '.hour' );
        }

        let selectedAmpm = jQuery( ampmSelect ).val();
        let selectedHour = jQuery( hourSelect ).val();
        selectedHour = this.convertHourTo24( selectedHour, selectedAmpm );

        let earliestHour = this.getEarliestHour( fieldModel );
        let latestHour = this.getLatestHour( fieldModel );

        // Loop over our hour select and disable any options before our earliest our or after our latest hour.
        let setSelected = false;
        let newSelectedVal = false;
        let that = this;
        
        jQuery( hourSelect ).find( 'option' ).each( function( index ) {
            let val = that.convertHourTo24( this.value, selectedAmpm );
            // If our value is lower than our earliest hour or higher than our latest hour, disable this option.
            if ( ( parseInt( earliestHour ) > val
                || parseInt( latestHour ) < val )
                && 1 == fieldModel.get( 'limit_hours' )
            ) {
                jQuery( this ).prop( 'disabled', true );
                // If we are disabling the currenly selected hour, then setSelected to true so that the next non-disabled option becomes selected.
                if ( selectedHour == val ) {
                    setSelected = true;
                }
            } else {
                // Make sure that this option isn't disabled.
                jQuery( this ).prop( 'disabled', false );
                /**
                 * If newSelectedVal is false, then this is the first non-disabled option.
                 * In that case, we store this value so that we can set it as selected later.
                 */
                if ( ! newSelectedVal ) {
                    newSelectedVal = this.value;
                }
            }
        } );

        // If we need to set a new default, do that.
        if ( setSelected ) {
            jQuery( hourSelect ).val( newSelectedVal );
            selectedHour = this.convertHourTo24( newSelectedVal, selectedAmpm );
        }

        // Set minuteSelect to be a jQuery object of our minute select element.
        let minuteSelect = jQuery( select ).parent().siblings( 'div' ).find( '.minute' );
        // Call maybeDisableMinutes to do its thing.
        this.maybeDisableMinutes( fieldModel, selectedHour, minuteSelect, earliestHour, latestHour );
    },

    /**
     * Given an hour select, disable minutes if they are before our earliest minute or after our latest.
     * 
     * @since  3.0
     * @param  {Backbone.Model}     fieldModel      Backbone model of our field data
     * @param  {int}                selectedHour    currently selected hour
     * @param  {jQuery Object}      minuteSelect    jQuery object of our minute select element
     * @param  {int}                earliestHour    Earliest selectable hour. Setup in the form builder.
     * @param  {int}                latestHour      Latest selectable hour. Setup in the form builder.
     * @return {bool}
     */
    maybeDisableMinutes: function( fieldModel, selectedHour, minuteSelect, earliestHour, latestHour ) {
        let selectedMinute = parseInt( jQuery( minuteSelect ).val() );
        let firstMinute = parseInt( fieldModel.get( 'first_minute' ) );
        let lastMinute = parseInt( fieldModel.get( 'last_minute' ) );
        let setSelected = false;
        let newSelectedVal = false;

        let takenMinutes = [];
        // check our currentDate (if set) for any disabled minutes.
        if ( ! this.currentDate ) {
            var currentDate = '1970-01-01';
        } else {
            var currentDate = flatpickr.formatDate( this.currentDate, 'Y-m-d' );
        }

        let takenDates = fieldModel.get( 'taken_dates' );

        if ( 'undefined' != typeof takenDates && 'undefined' != typeof takenDates[ currentDate ] ) {
            var takenTimes = takenDates[ currentDate ];
            for (var i = 0; i < takenTimes.length; i++) {
                if ( selectedHour == takenTimes[i].hour ) {
                    takenMinutes.push( parseInt( takenTimes[i].minute ) );
                }
            }
        }

        jQuery( minuteSelect ).find( 'option' ).each( function( index ) {
            let val = parseInt( this.value );
            /*
             * This is kind of a complex if statement.
             * It checks two things: our limit_hours setting and our use_date_submission_limit setting.
             * If either of those are being used, it may disable this minute.
             */
            if (
                // If we have "limit_hours" set to 1 and we're either earlier than the earliest hour or later than the latest hour, disable.
                (
                    1 == fieldModel.get( 'limit_hours' ) 
                    && 
                    (
                        ( val < firstMinute && selectedHour == earliestHour )
                        || ( val > lastMinute && selectedHour == latestHour )
                    ) 
                )
                ||
                // If we are limiting the number of submissions for this date/time and this minute has been taken, disable.
                (
                    1 == fieldModel.get( 'use_date_submission_limit' )
                    && -1 != takenMinutes.indexOf( val )
                )
            ) {
                jQuery( this ).prop( 'disabled', true );
                // If this was our selected minute, we need to set a new selected minute.
                if ( val == selectedMinute ) {
                    setSelected = true;
                }
            } else {
                jQuery( this ).prop( 'disabled', false );
                if ( ! newSelectedVal ) {
                    newSelectedVal = this.value;
                }
            }
        } );

        if ( setSelected ) {
            jQuery( minuteSelect ).val( newSelectedVal );
        }

        return false;
    },

    /**
     * When our view loads, disable an hours/minutes as appropriate.
     * 
     * @since  3.0
     * @param  {Backbone.View}  view     Backbone view for the date field.
     * @return {bool}
     */
    setupInitialState: function ( view ) {
        if ( 1 != view.model.get( 'limit_hours' ) && 1 != view.model.get( 'use_date_submission_limit' ) ) {
            return false;
        }

        let hourSelect = jQuery( view.el ).find( '.hour' );
        let minuteSelect = jQuery( view.el ).find( '.minute' );
        let ampmSelect = jQuery( view.el ).find( '.ampm' );
        
        /**
         * Call our maybeDisableHours function and pass either the ampm select or hour select.
         * If we've setup a 24 hour format, then we don't have an ampm select.
         */
        if ( 1 == view.model.get( 'hours_24' ) ) {
            this.maybeDisableHours( hourSelect, view.model );
        } else {
            this.maybeDisableHours( ampmSelect, view.model );
        }

        return false;
    },

    /**
     * Given an hour and an ampm value, return a 24 hour time format.
     * 
     * @since  3.0
     * @param  {int} hour
     * @param  {string} ampm    String representing am/pm. Undefined or false if the hour is already in 24 format.
     * @return {int}            24 hour formatted hour.
     */
    convertHourTo24: function ( hour, ampm ) {
        if ( ! ampm ) {
            return hour;
        }

        hour = parseInt( hour );
        // Convert our selected time into 24 hr clock.
        if ( 12 == hour && 'am' == ampm ) {
            hour = 0;
        } else if ( 12 > hour && 'pm' == ampm ) {
            hour += 12;
        }

        return hour;
    },

    /**
     * Return our earliest hour, as based upon our hour limits settings in the builder.
     * 
     * @since  3.0
     * @param  {Backbone.Model} fieldModel  Backbone model of field data.
     * @return {int}                        Earliest selectable hour
     */
    getEarliestHour: function( fieldModel ) {
        if ( 1 == fieldModel.get( 'hours_24' ) ) {
            // Get our earliest time
            return fieldModel.get( 'start_hour_24' );
        } else {
            // Get our earliest time
            let earliestHour = fieldModel.get( 'start_hour_12' );
            let earliestAmpm = fieldModel.get( 'start_hour_12_ampm' );
            return this.convertHourTo24( earliestHour, earliestAmpm ); 
        }
    },

    /**
     * Return our latest hour, as based upon our hour limits settings in the builder.
     * 
     * @since  3.0
     * @param  {Backbone.Model} fieldModel  Backbone model of field data.
     * @return {int}                        Latest selectable hour
     */
    getLatestHour: function ( fieldModel ) {
        if ( 1 == fieldModel.get( 'hours_24' ) ) {
            // Get our latest time
            return fieldModel.get( 'end_hour_24' );
        } else {
            // Get our latest time
            let latestHour = fieldModel.get( 'end_hour_12' );
            let latestAmpm = fieldModel.get( 'end_hour_12_ampm' );
            return this.convertHourTo24( latestHour, latestAmpm );
        }
    },
});

jQuery( document ).ready( function() {
    new customFrontendFlatPickr();
} );