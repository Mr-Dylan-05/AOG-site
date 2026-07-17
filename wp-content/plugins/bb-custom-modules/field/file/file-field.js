(function($){

    BBModuleFileUpload = {
        _singleFileSelector: null,

        _init: function()
        {
            $('body').delegate('.fl-file-field .fl-file-select', 'click', BBModuleFileUpload._selectSingleFile);
            $('body').delegate('.fl-file-field .fl-file-replace', 'click', BBModuleFileUpload._selectSingleFile);
            $('body').delegate('.fl-file-field .fl-file-remove', 'click', BBModuleFileUpload._removeSingleFile);
        },

        _selectSingleFile: function()
        { 
            if(BBModuleFileUpload._singleFileSelector === null) {
            
                BBModuleFileUpload._singleFileSelector = wp.media({
                    title: 'Select File',
                    button: { text: 'Select File' },
                    library : { type : 'application' }, //application/zip, application/rar or https://codex.wordpress.org/Function_Reference/get_allowed_mime_types
                    multiple: false
                }); 
            }
            
            BBModuleFileUpload._singleFileSelector.once('select', $.proxy(BBModuleFileUpload._singleFileSelected, this));
            BBModuleFileUpload._singleFileSelector.open();
        },

        _singleFileSelected: function()
        {
            var file      = BBModuleFileUpload._singleFileSelector.state().get('selection').first().toJSON(),
                wrap       = $(this).closest('.fl-file-field'),
                image      = wrap.find('.fl-file-preview-img img'),
                filename   = wrap.find('.fl-file-preview-filename'),
                fileField = wrap.find('input[type=hidden]');
            
            image.attr('src', file.icon);
            filename.html(file.filename);
            wrap.removeClass('fl-file-empty');
            wrap.find('label.error').remove();
            fileField.val(file.id).trigger('change');
        },

        _removeSingleFile: function()
        {
            var wrap       = $(this).closest('.fl-file-field'),
                image      = wrap.find('.fl-file-preview-img img'),
                filename   = wrap.find('.fl-file-preview-filename'),
                fileField = wrap.find('input[type=hidden]');
                
            image.attr('src', '');
            filename.html('');
            wrap.addClass('fl-file-empty');
            fileField.val('').trigger('change');
        }

    };
    
    $(function(){
        BBModuleFileUpload._init();
    });
    
})(jQuery);