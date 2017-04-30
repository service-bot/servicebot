'use strict';
/**
 * @author Batch Themes Ltd.
 */
(function() {
    $(function() {
        $('.btn-notify').on('click', function() {
            var action = $(this).data('action');
            if (action === 'success') {
                $.notify("Access granted", {
                    className: 'success',
                    globalPosition: 'top right',
                    autoHideDelay: 3000,
                });
            } else if (action === 'info') {
                $.notify("Do not press this button", {
                    className: 'info',
                    globalPosition: 'top left',
                    autoHideDelay: 3000,
                });
            } else if (action === 'warn') {
                $.notify("Warning: Self-destruct in 3.. 2..", {
                    className: 'warn',
                    globalPosition: 'bottom left',
                    autoHideDelay: 3000,
                });
            } else if (action === 'error') {
                $.notify("BOOM!", {
                    className: 'error',
                    globalPosition: 'bottom right',
                    autoHideDelay: 3000,
                });
            }
        });
    });
})();
