'use strict';
/**
 * @author Batch Themes Ltd.
 */
(function() {
    $(function() {
        var config = $.localStorage.get('config');
        var colors = config.colors;
        $('.btn-swal').on('click', function() {
            var action = $(this).data('action');
            var service = $(this).data('service');
            var actionName = $(this).data('action-name');
            if (action === 'basic') {
                swal({
                    title: 'The Internet?',
                    text: 'That thing is still around?',
                    confirmButtonColor: colors.primary
                });
            }
            if (action === 'auto-close') {
                swal({
                    title: 'Auto close alert!',
                    text: 'I will close in 2 seconds.',
                    timer: 2000
                });
            }
            if (action === 'html') {
                swal({
                    title: 'HTML example',
                    html: 'You can use <b>bold text</b>, ' + '<a href="//github.com">links</a> ' + 'and other HTML tags'
                });
            }
            if (action === 'approve') {
                swal({
                    title: service,
                    html: 'You are about to <strong>approve</strong> this service',
                    imageUrl: "assets/custom-icons/approve.png",
                    showCancelButton: true,
                    confirmButtonColor: "#fff",
                    cancelButtonColor: '#fff',
                    confirmButtonText: 'Approve Service!',
                    cancelButtonText: 'I will wait.',
                    confirmButtonClass: 'confirm-class btn btn-primary btn-primary-important btn-rounded btn-sm',
                    cancelButtonClass: 'cancel-class btn btn-danger-important btn-rounded btn-sm',
                    closeOnConfirm: false,
                    closeOnCancel: false
                }, function(isConfirm) {
                    if (isConfirm) {
                        $('button.confirm-class').text('Sending Approval ... ');
                        setTimeout(function(){
                            swal('Approved!', 'You have successfully approved a service.', 'success');
                        }, 2000);
                    } else {
                        swal('Opps..', 'Remember to approve the service as soon as you can!', 'error');
                    }
                });
            }
            if (action === 'pay') {
                swal({
                    title: service,
                    html: 'You are about to <strong>pay</strong> for this service',
                    imageUrl: "assets/custom-icons/credit-card.png",
                    showCancelButton: true,
                    confirmButtonColor: "#fff",
                    cancelButtonColor: '#fff',
                    confirmButtonText: 'Pay Now!',
                    cancelButtonText: 'I will wait.',
                    confirmButtonClass: 'confirm-class btn btn-primary btn-primary-important btn-rounded btn-sm',
                    cancelButtonClass: 'cancel-class btn btn-danger btn-danger-important btn-danger-important btn-rounded btn-sm',
                    closeOnConfirm: false,
                    closeOnCancel: false
                }, function(isConfirm) {
                    if (isConfirm) {
                        $('button.confirm-class').text('Sending Payment ... ');
                        setTimeout(function(){
                            swal('Your Payment is sent!', 'You have successfully paid a service.', 'success');
                        }, 2000);
                    } else {
                        swal('Opps..', 'Remember to pay for the service as soon as you can!', 'error');
                    }
                });
            }
            if (action === 'stop') {
                swal({
                    title: service,
                    html: 'This service will be <strong>stopped</strong> immediately once you confirm.',
                    imageUrl: "assets/custom-icons/stop-danger.png",
                    showCancelButton: true,
                    confirmButtonColor: "#fff",
                    cancelButtonColor: '#fff',
                    confirmButtonText: 'Stop Service!',
                    cancelButtonText: 'Keep My Service!',
                    confirmButtonClass: 'confirm-class btn btn-primary btn-primary-important btn-outline btn-rounded btn-sm',
                    cancelButtonClass: 'cancel-class btn btn-danger btn-outline btn-rounded btn-sm',
                    closeOnConfirm: false,
                    closeOnCancel: false
                }, function(isConfirm) {
                    if (isConfirm) {
                        $('button.confirm-class').text('Sending Stop Request ... ');
                        setTimeout(function(){
                            swal('Stopped!', 'Your stop service request is sent!', 'success');
                        }, 2000);
                    } else {
                        swal('Great!', 'Your service is safe :)', 'error');
                    }
                });
            }
            if (action === 'deny') {
                swal({
                    title: service,
                    html: 'Are you sure you want to deny this service?',
                    imageUrl: "assets/custom-icons/deny.png",
                    showCancelButton: true,
                    confirmButtonColor: "#fff",
                    cancelButtonColor: '#fff',
                    confirmButtonText: 'Deny Service!',
                    cancelButtonText: 'Nevermind!',
                    confirmButtonClass: 'confirm-class btn btn-primary btn-primary-important btn-outline btn-rounded btn-sm',
                    cancelButtonClass: 'cancel-class btn btn-danger btn-danger-important btn-outline btn-rounded btn-sm',
                    closeOnConfirm: false,
                    closeOnCancel: false
                }, function(isConfirm) {
                    if (isConfirm) {
                        $('button.confirm-class').text('Sending Deny Request ... ');
                        setTimeout(function(){
                            swal('Denied!', 'Your deny service request is sent!', 'success');
                        }, 2000);
                    } else {
                        swal('Great!', 'Please approve the service soon! :)', 'error');
                    }
                });
            }
            if (action === 'delete-user') {
                swal({
                    title: actionName,
                    html: 'Are you sure you want to delete this user?',
                    imageUrl: "assets/custom-icons/trash.png",
                    showCancelButton: true,
                    confirmButtonColor: "#fff",
                    cancelButtonColor: '#fff',
                    confirmButtonText: 'Delete User',
                    cancelButtonText: 'Nevermind!',
                    confirmButtonClass: 'confirm-class btn btn-primary btn-primary-important btn-rounded btn-sm',
                    cancelButtonClass: 'cancel-class btn btn-danger-important btn-rounded btn-sm',
                    closeOnConfirm: false,
                    closeOnCancel: false
                }, function(isConfirm) {
                    if (isConfirm) {
                        $('button.confirm-class').text('Deleting User ... ');
                        setTimeout(function(){
                            swal('Denied!', 'User deleted!', 'success');
                        }, 2000);
                    } else {
                        swal('Great!', 'Your user is safe!', 'error');
                    }
                });
            }
        });
    });
})();
