'use strict';
/**
 * @author Batch Themes Ltd.
 */
(function() {
    $(function() {
        if (!element_exists('.navbar-1')) {
            return false;
        }
        var config = $.localStorage.get('config');
        //reset localStorage
        //collapse layout
        $(document).on('click', '.toggle-layout', function(e) {
            e.preventDefault();
            var layout = $('body').data('layout');
            $('body').toggleClass('layout-collapsed');
            if ($('body').hasClass('layout-collapsed')) {
                $('.left-sidebar-backdrop').toggleClass('fade in');
            }
            return false;
        });
        $('.left-sidebar-backdrop').on('click', function() {
            $(this).removeClass('fade');
            $(this).removeClass('in');
            $('body').toggleClass('layout-collapsed');
        });
        //toggle right sidebar
        $(document).on('click', '.toggle-right-sidebar', function(e) {
            e.preventDefault();
            $('.right-sidebar-outer').toggleClass('show-from-right');
            var layout = $('body').data('layout');
            if ($('.right-sidebar-outer').hasClass('show-from-right')) {
                $('.right-sidebar-backdrop').toggleClass('fade in');
            } else {
                $('.right-sidebar-backdrop').removeClass('fade');
                $('.right-sidebar-backdrop').removeClass('in');
            }
            return false;
        });
        $('.right-sidebar-backdrop').on('click', function() {
            $(this).removeClass('fade');
            $(this).removeClass('in');
            $('.right-sidebar-outer').removeClass('show-from-right');
        });
        //toggle-fullscreen
        $(document).on('click', '.toggle-fullscreen', function(e) {
            e.preventDefault();
            $(document).fullScreen(true);
            return false;
        });
    });
})();
