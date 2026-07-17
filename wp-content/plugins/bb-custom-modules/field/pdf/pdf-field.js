(function($){

    BBModulePDFUpload = {
        _singlePDFSelector: null,

        _init: function()
        {
            $('body').delegate('.fl-pdf-field .fl-pdf-select', 'click', BBModulePDFUpload._selectSinglePDF);
            $('body').delegate('.fl-pdf-field .fl-pdf-replace', 'click', BBModulePDFUpload._selectSinglePDF);
            $('body').delegate('.fl-pdf-field .fl-pdf-remove', 'click', BBModulePDFUpload._removeSinglePDF);
        },

        _selectSinglePDF: function()
        { 
            if(BBModulePDFUpload._singlePDFSelector === null) {
            
                BBModulePDFUpload._singlePDFSelector = wp.media({
                    title: 'Select PDF',
                    button: { text: 'Select PDF' },
                    library : { type : 'application/pdf' },
                    multiple: false
                }); 
            }
            
            BBModulePDFUpload._singlePDFSelector.once('select', $.proxy(BBModulePDFUpload._singlePDFSelected, this));
            BBModulePDFUpload._singlePDFSelector.open();
        },

        _singlePDFSelected: function()
        {
            var pdf      = BBModulePDFUpload._singlePDFSelector.state().get('selection').first().toJSON(),
                wrap       = $(this).closest('.fl-pdf-field'),
                image      = wrap.find('.fl-pdf-preview-img img'),
                filename   = wrap.find('.fl-pdf-preview-filename'),
                pdfField = wrap.find('input[type=hidden]');
            
            image.attr('src', pdf.icon);
            filename.html(pdf.filename);
            wrap.removeClass('fl-pdf-empty');
            wrap.find('label.error').remove();
            pdfField.val(pdf.id).trigger('change');
        },

        _removeSinglePDF: function()
        {
            var wrap       = $(this).closest('.fl-pdf-field'),
                image      = wrap.find('.fl-pdf-preview-img img'),
                filename   = wrap.find('.fl-pdf-preview-filename'),
                pdfField = wrap.find('input[type=hidden]');
                
            image.attr('src', '');
            filename.html('');
            wrap.addClass('fl-pdf-empty');
            pdfField.val('').trigger('change');
        }

    };
    
    $(function(){
        BBModulePDFUpload._init();
    });
    
})(jQuery);