let default_notifications = {};
default_notifications.templates = [
    {name:"request_service_instance_admin",
        event_name:"service_instance_requested_for_user",
        message:"Your service [[name]] has been requested for you. Please login to your account and approve the <a href='https://[[_hostname]]/my-services'>service</a>.",
        subject:"ServiceBot Instance needs approval",
        description:"This notification it triggered when a service is requested by an admin on behalf of a user and the user needs to approve it",
        model:"service-instance",
        send_email:true
    },
    {name:"request_service_instance_user",
        event_name:"service_instance_requested_by_user",
        message:"Your service request for [[name]] has been completed. Please login to your account to view and access your <a href='https://[[_hostname]]/service-instance/[[id]]'>service</a>.",
        subject:"ServiceBot Instance requested",
        description:"This notification it triggered when a service is requested by a user",
        model:"service-instance",
        send_email:true
    },
    {name:"request_service_instance_new_user",
        event_name:"service_instance_requested_new_user",
        message:"Your service request for [[name]] has been completed. Please click the link to complete user <a href='[[url]]'>registration</a> in order to view your services. Once registered you can access your <a href='https://[[_hostname]]/service-instance/[[id]]'>service</a>.",
        subject:"ServiceBot Instance requested",
        description:"This notification it triggered when a service is requested by a new user. They are sent the link to complete registration",
        model:"service-instance",
        send_email:true
    },
    {name:"service_requires_payment_approval",
        event_name:"service_instance_charge_added",
        message:"There are additional charges added to your service, [[name]]. Please login to your account and approve the <a href='https://[[_hostname]]/my-services'>charges</a>.",
        subject:"ServiceBot Instance has additional charges",
        description:"This notification it triggered when a service has been updated with a new charge that needs approval",
        model:"service-instance",
        send_email:true
    },
    {name:"service_cancellation_submitted",
        event_name:"service_instance_cancellation_requested",
        message:"Your cancellation request for [[name]] has been submitted. You will receive another notification when it has been approved.",
        subject:"ServiceBot Instance cancellation submitted",
        description:"This notification it triggered when a service instance cancellation has been requested by a user",
        model:"service-instance",
        send_email:true
    },
    {name:"service_instance_update",
        event_name:"service_instance_updated",
        message:"Your Service Instance [[name]] has been updated. You can use this link to view your <a href='https://[[_hostname]]/service-instance/[[id]]'>instance details</a>.",
        subject:"ServiceBot Instance updated",
        description:"This notification it triggered when a service instance has been updated",
        model:"service-instance",
        send_email:true
    },
    {name:"instance_cancellation_approved",
        event_name:"service_instance_cancellation_approved",
        message:"Your cancellation request has been approved.",
        subject:"ServiceBot Instance cancellation request approved",
        description:"This notification it triggered when a service cancellation request has been approved",
        model:"service-instance-cancellation",
        send_email:true
    },
    {name:"instance_cancellation_rejected",
        event_name:"service_instance_cancellation_rejected",
        message:"Your cancellation request for has been rejected. For more information, contact your service provider or comment on your <a href='https://[[_hostname]]/service-instance/[[service_instance_id]]'>service</a> and we will get back to you shortly.",
        subject:"ServiceBot Instance cancellation request rejected",
        description:"This notification it triggered when a service cancellation request has been rejected",
        model:"service-instance-cancellation",
        send_email:true
    },
    {name:"password_reset",
        event_name:"password_reset_request_created",
        message:"Follow the following link to <a href='[[url]]'>reset your password</a>.",
        subject:"ServiceBot password reset",
        description:"This notification it triggered when a user requests a password reset",
        model:"user",
        send_email:true
    },
    {name:"invitation",
        event_name:"user_invited",
        message:"Hello there, \r\nYou have been invited to use the [[_company_name]] ServiceBot System. From here you can request new services, manage your services, and see other service options. Please click the link to begin user <a href='[[url]]'>registration</a>.",
        subject:"ServiceBot Invitation!",
        description:"This notification it triggered when a user is invited to they system by an admin",
        model:"user",
        send_email:true
    },
    {name:"registration_user",
        event_name:"user_registered",
        message:"Your registration has been completed! You can now access your account at <a href='https://[[_hostname]]'>here</a>. Thank you for choosing [[_company_name]].",
        subject:"ServiceBot registration complete",
        description:"This notification it triggered when registration has been completed",
        model:"user",
        send_email:true
    },
    {name:"registration_admin",
        event_name:"user_registered",
        message:"You have gained a new user! [[name]] - [[email]] has just joined your ServiceBot system.",
        subject:"New ServiceBot User",
        description:"This notification it triggered for an admin when a new user has joined the system",
        model:"user",
        send_email:true,
        send_to_owner:false
    },
    {name:"user_suspension",
        event_name:"user_suspended",
        message:"Your ServiceBot account has been suspended. Please contact your service provider and check the state of your <a href='https://[[_hostname]]/my-services'>account</a>.",
        subject:"ServiceBot Account Suspended",
        description:"This notification it triggered when an account has been suspended",
        model:"user",
        send_email:true
    },
    {name:"payment_failure",
        event_name:"payment_failure",
        message:"Your payment failed. Please log into your account and check your <a href='https://[[_hostname]]/billing-settings'>payment plan</a>.",
        subject:"ServiceBot Payment Failure",
        description:"This notification it triggered when a payment has failed to go through. It notifies the user to update their payment method",
        model:"user",
        send_email:true
    }
];
//Setting the registration_admin role to admin
default_notifications.templates_to_roles = [
    {
        notification_template_id:12,
        role_id:1
    },
];
module.exports = default_notifications;