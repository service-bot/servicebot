'use strict';
/**
 * @author Batch Themes Ltd.
 */
(function() {
    $(function() {
        if (!element_exists('#ui-counters')) {
            return false;
        }
        $('.counter-up-example').counterUp({
            delay: 1,
            time: 1000
        });
    });
})();
