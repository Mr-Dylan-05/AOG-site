(function($) {
	$(function() {

    /*Toggle Menu*/
    $('#primary-menu li.menu-item-has-children > a').after('<span class="menu-arrow"></span>')
        $('html').on('click', '#responsive-menu, body.toggle-menu-show', function(event){ responsive_open($(this)); });
        $('#responsive-menu-wrapper').click(function(event){ event.stopPropagation(); });
        function responsive_open(button) {
            
            if ($('#responsive-menu.hamburger').hasClass('is-active')) {
                $('#responsive-menu.hamburger').removeClass('is-active');
            } else {
                $('#responsive-menu.hamburger').addClass('is-active');
            }
            
            if ($('#header, body').hasClass('toggle-menu-show')) {
                $('#header, body').addClass('animate-out');
                button.addClass('animate-out').removeClass('animate');
                setTimeout(function() {
                    $('#header, body').removeClass('toggle-menu-show animate-out');
                    button.removeClass('animate-out');
                }, 400);
            } else {
                $('#header, body').addClass('toggle-menu-show');
                button.addClass('toggle-menu-show');
                setTimeout(function() {
                    $('#header, body').addClass('animate');
                }, 600);
            }
        }
        $('#primary-menu > li > a[href*="#"]').click(function(event){ event.stopPropagation(); submenu_toggle_bank($(this)); });
        function submenu_toggle_bank(submenu) {
            if (submenu.parent().hasClass('show-sub')) {
                submenu.parent().removeClass('show-sub');
            } else {
                submenu.parent().addClass('show-sub');
            }
            if (submenu.siblings().hasClass('active')) {
                submenu.siblings().removeClass('active');
            } else {
                submenu.siblings().addClass('active');
            }
        }
        $('#primary-menu li.menu-item-has-children span.menu-arrow').click(function(event){ event.stopPropagation(); submenu_toggle($(this)); });
        function submenu_toggle(submenu) {
            if (submenu.parent().hasClass('show-sub')) {
                submenu.parent().removeClass('show-sub');
            } else {
                submenu.parent().addClass('show-sub');
            }
            if (submenu.hasClass('active')) {
                submenu.removeClass('active');
            } else {
                submenu.addClass('active');
            }
        }
        
        
        var mobile_menu = $('#responsive-menu-wrapper').clone();
        $('#responsive-menu-wrapper').remove();
        $('body').prepend(mobile_menu);

    });
	
})(jQuery);