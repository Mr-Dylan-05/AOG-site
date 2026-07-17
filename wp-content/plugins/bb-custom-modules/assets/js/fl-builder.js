(function($) {
	$(function() {
		if ($('.fl-builder-bar-actions').length ) {
			$('.fl-builder-hover-content-button').remove();
			$('.fl-builder-bar-actions .fl-clear').before('<span class="fl-builder-hover-content-button fl-builder-button"><i class="fa fa-eye"></i> Quick Preview</span>');
			var editpage = "'"+$('#wp-admin-bar-edit > a').attr('href')+"'";
			$('.fl-builder-bar-actions .fl-builder-hover-content-button').before('<span class="fl-builder-edit-page fl-builder-button" onclick="window.open('+editpage+')">Edit Page Admin</span>');
			$('.fl-builder-hover-content-button').click(function(){
				if ($(this).hasClass('active')) {
					$(this).removeClass('active');
					$('html').removeClass('hover-active');
					$('.fl-builder-add-content-button').click();
				} else {
					$(this).addClass('active');
					$('html').addClass('hover-active');
					$('.fl-builder-panel-close').click();
				}
			});
		}
		if ($('.fl-builder-upgrade-button').length ) {
			$('#fl-builder-blocks-advanced').remove();
		}
		
		if (!$('#fl-builder-blocks-rows #module_search').length ) {
			$('#fl-builder-blocks-rows').before('<div id="fl-builder-blocks-search" class="fl-builder-blocks-section"><input type="text" id="module_search" placeholder="Search Modules" style="width: 100%; font-size: 16px; "></div>');
		}
		if ($('#module_search').length ) {
			$('#module_search').focus();
			$('#module_search').keyup(function(){
				var parent = $( this ).closest('.fl-builder-panel');
				var rex    = new RegExp( $(this).val(), 'i');
				parent.find('.fl-builder-block').hide();
				parent.find('.fl-builder-block > .fl-builder-block-title').filter(function () {
					var title  	   = $(this).html() || '',
						cat_name   = $(this).attr('data-cat-name') || '',
						tags_names = $(this).attr('data-tags') || '';
					return rex.test( cat_name + ' ' + title + ' ' + tags_names );
				}).parent('.fl-builder-block').show().closest('.fl-builder-blocks-section').addClass('fl-active');
				if( $.trim( $(this).val() ) == '' ) {
					parent.find('.fl-builder-blocks-section').removeClass('fl-active');            	
				}
			});
			$('.fl-builder-blocks-section').click(function(event) {
				$('#module_search').val('');
				$( this ).find('.fl-builder-block').show();
			});
		}
	});
})(jQuery);