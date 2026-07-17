var customBuilderFlatPickr = Marionette.Object.extend( {
    initialize: function() {
        /*
         * Listen to our date pickers as they are created on the page.
         */
        Backbone.Radio.channel( 'setting-type-datepicker' ).reply( 'filter:settings', this.filterDateSettings, this );    
        
        this.listenTo( Backbone.Radio.channel( 'setting-type-datepicker' ), 'loadComplete', this.setupWeekdayButtons );

        this.listenTo( Backbone.Radio.channel( 'setting-type-datepicker' ), 'loadComplete', this.interactiveDates );
    },

    filterDateSettings: function( settings, settingModel, el ) {

        const options = Backbone.Radio.channel( 'setting-type-datepicker' ).request( 'get:options' );
        if (typeof options !== "undefined"){
            const dateFormat = this.checkDateFormat(options.date_format);
            if ( 'restricted_dates' === settingModel.get( 'name' ) ) {
                jQuery( el ).hide();
                settings.mode = 'multiple';
                settings.inline = true;
                settings.dateFormat = "Y-m-d";
                settings.conjunction = ',';
                settings.minDate = flatpickr.parseDate(options.min_date, dateFormat);
                settings.maxDate = flatpickr.parseDate(options.max_date, dateFormat);
            } else if('min_date' === settingModel.get( 'name' ) || 'max_date' === settingModel.get( 'name' )) {
                settings.mode = 'single';
                settings.dateFormat = dateFormat;
                settings.static = true; 
                settings.allowInput = true;
                settingModel.onClose = this.checkEmptyDate;
                if('min_date' === settingModel.get( 'name' )){
                    settings.maxDate = options.max_date;
                    settings.defaultDate = options.min_date;
                } else if('max_date' === settingModel.get( 'name' )){
                    settings.minDate = options.min_date;
                    settings.defaultDate = options.max_date;
                }
            }
        }
        return settings;
    },

    checkEmptyDate: function(selectedDate, dateStr, instance) {
        if(selectedDate.length <= 0) {
            instance.setDate(null);
            instance.clear();
        }
    },

    checkDateFormat: function(stringSet) {
        //Convert PHP format in setting to flatPickr expected setting if needed
        const lookup = {
            'MM/DD/YYYY': 'm/d/Y',
            'MM-DD-YYYY': 'm-d-Y',
            'MM.DD.YYYY': 'm.d.Y',
            'DD/MM/YYYY': 'd/m/Y',
            'DD-MM-YYYY': 'd-m-Y',
            'DD.MM.YYYY': 'd.m.Y',
            'YYYY-MM-DD': 'Y-m-d',
            'YYYY/MM/DD': 'Y/m/d',
            'YYYY.MM.DD': 'Y.m.d',
            'dddd, MMMM D YYYY': 'l, F d Y',
            'default': nfAdmin.dateFormat ? nfAdmin.dateFormat : 'default'
        };
        return Object.keys(lookup).includes(stringSet) ? lookup[stringSet] : stringSet;
    },

    setupWeekdayButtons: function( instance, settingModel, dataModel, view  ) {
        
        instance.config.restricted_weekdays = dataModel.get( 'restricted_weekdays' );

        if ( 'undefined' == typeof dataModel.get( 'restricted_weekdays' ) ) {
            instance.config.restricted_weekdays = [];
        }
        
        instance.set( 'disable', [ function( date ) {
            // If we haven't disabled any weekdays, then return false.
            if ( 0 == instance.config.restricted_weekdays.length ) {
                return false;
            }

            let weekday = date.getDay();
            if ( -1 == instance.config.restricted_weekdays.indexOf( weekday ) ) {
                return false;
            }
        
            return true;
        } ] );

        jQuery( instance.calendarContainer ).find( '.flatpickr-weekdaycontainer > .flatpickr-weekday' ).each( function( index ) {
            jQuery( this ).on( 'click', function() {
                // If the index is already in our array, remove it. Else, add it.
                if ( -1 != instance.config.restricted_weekdays.indexOf( index ) ) {
                    instance.config.restricted_weekdays = _.without( instance.config.restricted_weekdays, index );
                } else {
                    instance.config.restricted_weekdays.push( index );
                }

                dataModel.set( 'restricted_weekdays', instance.config.restricted_weekdays );
                Backbone.Radio.channel( 'app' ).request( 'update:setting', 'clean', false );
                
                instance.redraw();
            } );
        } );
    },

    interactiveDates: function(instanceRoot, settingModel, dataModel, view) {
        setTimeout(() => {
            document.getElementById('min_date').addEventListener('change', (event) => {
                this.adaptDatesJob(dataModel, event.target);
            });
            document.getElementById('max_date').addEventListener('change', (event) => {
                this.adaptDatesJob(dataModel, event.target);
            });
        }, 500);
       
    },

    adaptDatesJob: function(dataModel, target) {
        const restrictedDatesInstance = document.querySelector("#restricted_dates")._flatpickr,
        dateFormat = this.checkDateFormat(dataModel.get("date_format")),
        dateStr = target.value;
        if(target.id === "max_date") {
            const minDateInstance = document.querySelector("#min_date")._flatpickr;
            restrictedDatesInstance.set( 'maxDate', flatpickr.parseDate(dateStr, dateFormat) );
            minDateInstance.set( 'maxDate', flatpickr.parseDate(dateStr, dateFormat) );
        } else if(target.id === "min_date") {
            const maxDateInstance = document.querySelector("#max_date")._flatpickr;
            restrictedDatesInstance.set( 'minDate', flatpickr.parseDate(dateStr, dateFormat) );
            maxDateInstance.set( 'minDate', flatpickr.parseDate(dateStr, dateFormat) );
        }
    }

});

jQuery( document ).ready( function() {
    new customBuilderFlatPickr();
} );
