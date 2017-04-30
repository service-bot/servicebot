'use strict';
/**
 * @author Batch Themes Ltd.
 */
(function() {
    $(function() {
        $('.btn-toast').on('click', function() {
            var type = $(this).data('type');
            if (type === 'success') {
                toastr.options = {
                    positionClass: 'toast-top-right'
                };
                toastr.success('Great idea!');
            }
            if (type === 'warning') {
                toastr.options = {
                    positionClass: 'toast-bottom-right'
                };
                toastr.warning('Warning!');
            }
            if (type === 'danger') {
                toastr.options = {
                    positionClass: 'toast-bottom-left'
                };
                toastr.error('Danger!');
            }
            if (type === 'info') {
                toastr.options = {
                    positionClass: 'toast-top-left'
                };
                toastr.info('Excellent!');
            }
        });
    });
})();
