'use strict';
/**
 * @author Batch Themes Ltd.
 */
(function() {
    $(function() {
        if (!element_exists('#dashboards-analytics')) {
            return false;
        }
        var config = $.localStorage.get('config');
        var colors = config.colors;
        var loaderTime = 3200;
    });
})();
