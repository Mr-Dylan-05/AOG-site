( function( $ ) {

	/**
	 * Handles logic for the admin customize interface.
	 *
	 * @class FLThemeBuilderAdminCustomize
	 * @since 1.0
	 */
	FLThemeBuilderAdminCustomize = {

		/**
		 * Initializes the admin customize interface.
		 *
		 * @since 1.0
		 * @access private
		 * @method _init
		 */
		_init: function()
		{
			this._bind();
		},

		/**
		 * Binds admin customize events.
		 *
		 * @since 1.0
		 * @access private
		 * @method _bind
		 */
		_bind: function()
		{
			wp.customize.previewer.targetWindow.bind( $.proxy( this._showHeaderFooterMessage, this ) );
		},

		/**
		 * Shows the message that is shown for when a header
		 * or footer is already set for this page.
		 *
		 * @since 1.0
		 * @access private
		 * @method _showHeaderFooterMessage
		 */
		_showHeaderFooterMessage: function()
		{
			var config   = $( '#customize-preview iframe' )[0].contentWindow.FLThemeBuilderConfig,
				template = wp.template( 'fl-theme-builder-header-footer-message' ),
				message  = null;

			$( '#theme-builder-header-footer-message' ).remove();

			if( 'undefined' == typeof config ) {
				return false;
			}

			if ( config.hasHeader || config.hasFooter ) {

				if ( config.hasFooter ) {
					message = 'footer';
					$( '#sub-accordion-panel-fl-footer').find( '.customize-control-notifications-container' ).after( template( { message : message, url : config.footerLink } ) );
					$( '#sub-accordion-panel-fl-footer').find( '.customizer-themer-edit-footer' ).attr( 'href', config.footerLink );
				}
				if ( config.hasHeader ) {
					message = 'header';
					$( '#sub-accordion-panel-fl-header').find( '.customize-control-notifications-container' ).after( template( { message : message, url : config.headerLink } ) );
					$( '#sub-accordion-panel-fl-header').find( '.customizer-themer-edit-header' ).attr( 'href', config.headerLink );
				}
			}
		}
	};

	// Initialize
	$( function() { FLThemeBuilderAdminCustomize._init(); } );

} )( jQuery );
