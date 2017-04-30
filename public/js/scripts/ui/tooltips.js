'use strict';
/**
 * @author Batch Themes Ltd.
 */
(function() {
    $(function() {
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="tooltip-primary"]').tooltip({
            template: '<div class="tooltip tooltip-primary" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });
        $('[data-toggle="tooltip-secondary"]').tooltip({
            template: '<div class="tooltip tooltip-secondary" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });
        $('[data-toggle="tooltip-info"]').tooltip({
            template: '<div class="tooltip tooltip-info" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });
        $('[data-toggle="tooltip-success"]').tooltip({
            template: '<div class="tooltip tooltip-success" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });
        $('[data-toggle="tooltip-warning"]').tooltip({
            template: '<div class="tooltip tooltip-warning" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });
        $('[data-toggle="tooltip-danger"]').tooltip({
            template: '<div class="tooltip tooltip-danger" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });
    });
})();
