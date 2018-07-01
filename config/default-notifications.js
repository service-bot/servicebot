let default_notifications = {};
default_notifications.templates = [
    {
        name: "service_cancellation_submitted",
        event_name: "service_instance_cancellation_requested",
        message: "Your cancellation request for [[name]] has been submitted. You will receive another notification when it has been approved.",
        subject: "Service cancellation submitted",
        description: "Sent when a service cancellation has been requested by a user",
        model: "service-instance",
        send_email: true
    },
    {
        name: "service_instance_update",
        event_name: "service_instance_updated",
        message: "Your subscription to [[name]] has been updated.",
        subject: "Subscription updated",
        description: "Sent when a service has been updated",
        model: "service-instance",
        send_email: true
    },
    {
        name: "instance_cancellation_approved",
        event_name: "service_instance_cancellation_approved",
        message: "Your cancellation request has been approved.",
        subject: "Service cancellation request approved",
        description: "Sent when a service cancellation request has been approved",
        model: "service-instance-cancellation",
        send_email: true
    },
    {
        name: "instance_cancellation_rejected",
        event_name: "service_instance_cancellation_rejected",
        message: "Your cancellation request has been rejected. ",
        subject: "Service cancellation request rejected",
        description: "Sent when a service cancellation request has been rejected",
        model: "service-instance-cancellation",
        send_email: true
    },
    {
        name: "password_reset",
        event_name: "password_reset_request_created",
        message: "Follow the following link to <a href='[[url]]'>reset your password</a>.",
        subject: "ServiceBot password reset",
        description: "Sent when a user requests a password reset",
        model: "user",
        send_email: true
    },
    {
        name: "registration_admin",
        event_name: "user_registered",
        message: "You have gained a new user! [[name]] - [[email]] has signed up.",
        subject: "New User",
        description: "Sent for an admin when a new user has signed up",
        model: "user",
        send_email: true,
        send_to_owner: false
    },
    {
        name: "user_suspension",
        event_name: "user_suspended",
        message: "Your account has been suspended for payment failure.",
        subject: "Account Suspended",
        description: "Sent when an account has been suspended",
        model: "user",
        send_email: true
    },
    {
        name: "payment_failure",
        event_name: "payment_failure",
        message: "Your payment failed. Please log into your account and check your billing settings.",
        subject: "Service Payment Failure",
        description: "Sent when a payment has failed to go through. It notifies the user to update their payment method",
        model: "user",
        send_email: true
    },
    {name:"invitation",
        event_name:"user_invited",
        message:"Hello, \r\nYou have been invited to use the [[_company_name]] ServiceBot System. Please click the link to begin user <a href='[[url]]'>registration</a>.",
        subject:"ServiceBot Invitation!",
        description:"Sent when a user is invited to they system by an admin",
        model:"user",
        send_email:true
    },
];
//Setting the registration_admin role to admin
default_notifications.templates_to_roles = [
    {
        notification_template_id: 12,
        role_id: 1
    },
];
module.exports = default_notifications;