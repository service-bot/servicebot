'use strict';
/**
 * @author Batch Themes Ltd.
 */
(function() {
    $(function() {
        if (!element_exists('#icons-weather-icons')) {
            return false;
        }
        var icons = [];
        $('.weather-icons .icon').each(function() {
            icons.push($(this).data('icon'));
        });
        icons = _.uniq(icons);
        $('#search-icons').on('keyup', function() {
            var val = $(this).val();
            var results = icons.filter(function(value) {
                return value.match(val);
            });
            $('.weather-icons .icon').each(function() {
                var icon = $(this).data('icon');
                if (results.indexOf(icon) == -1) {
                    $(this).addClass('hidden');
                } else {
                    $(this).removeClass('hidden');
                }
            });
        });
    });
})();
