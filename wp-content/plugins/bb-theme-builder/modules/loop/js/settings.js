( function( $ ) {

	FLBuilder.registerModuleHelper( 'loop', {

		init: function() {
			this.form = $('.fl-builder-settings');
			this.showTerms = this.form.find('select[name=terms_taxonomy]');
			this.showTerms.on('change', this._toggleChildTerms.bind( this ) );
		},

		_toggleChildTerms: function() {

			var taxonomy = this.form.find('select[name=terms_taxonomy]').val(),
				termSelect = this.form.find('select[name=term_parent]');

			FLBuilder.ajax( {
				action           : 'fl_loop_get_terms',
				taxonomy         : taxonomy,
			}, function( response ) {

				try {
					let data = (typeof response === 'string') ? JSON.parse(response) : response;
					termSelect.empty();
					$.each( data, function ( key, value ) {
						termSelect.append($('<option>', {
							value: key,
							text: value
						}));
					});
				} catch( e ) {}
			} );
		},
	} );

} )( jQuery );
