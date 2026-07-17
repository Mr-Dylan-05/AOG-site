(function($){

    BBModuleSVGUpload = {
        _singleSVGSelector: null,

        _init: function()
        {
            $('body').delegate('.fl-svg-field .fl-svg-select', 'click', BBModuleSVGUpload._selectSingleSVG);
            $('body').delegate('.fl-svg-field .fl-svg-replace', 'click', BBModuleSVGUpload._selectSingleSVG);
            $('body').delegate('.fl-svg-field .fl-svg-remove', 'click', BBModuleSVGUpload._removeSingleSVG);
        },

        _selectSingleSVG: function()
        { 
            if(BBModuleSVGUpload._singleSVGSelector === null) {
            
                BBModuleSVGUpload._singleSVGSelector = wp.media({
                    title: 'Select SVG',
                    button: { text: 'Select SVG' },
                    library : { type : 'image/svg+xml' },
                    multiple: false
                }); 
            }
            
            BBModuleSVGUpload._singleSVGSelector.once('select', $.proxy(BBModuleSVGUpload._singleSVGSelected, this));
            BBModuleSVGUpload._singleSVGSelector.open();
        },

        _singleSVGSelected: function()
        {
            var svg      = BBModuleSVGUpload._singleSVGSelector.state().get('selection').first().toJSON(),
                wrap       = $(this).closest('.fl-svg-field'),
                image      = wrap.find('.fl-svg-preview-img img'),
                filename   = wrap.find('.fl-svg-preview-filename'),
                svgField = wrap.find('input[type=hidden]');
            //alert(svg.toSource());
            image.attr('src', svg.url);
            filename.html(svg.filename);
            wrap.removeClass('fl-svg-empty');
            wrap.find('label.error').remove();
            svgField.val(svg.id).trigger('change');
        },

        _removeSingleSVG: function()
        {
            var wrap       = $(this).closest('.fl-svg-field'),
                image      = wrap.find('.fl-svg-preview-img img'),
                filename   = wrap.find('.fl-svg-preview-filename'),
                svgField = wrap.find('input[type=hidden]');
                
            image.attr('src', '');
            filename.html('');
            wrap.addClass('fl-svg-empty');
            svgField.val('').trigger('change');
        }

    };
    
    $(function(){
        BBModuleSVGUpload._init();
    });
    
})(jQuery);