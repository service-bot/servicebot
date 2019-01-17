module.exports = {


    up: async function (knex) {
        
        
        let emails = [
           
            {
                name: "password_reset",
                event_name: "password_reset_request_created",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">Reset Password</h2>
            <p class="___email-body">
                    Please follow the Reset Password button below to reset your [[_company_name]] account password.
            </p>
            <a class="___action-button" target="_blank" href="[[url]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">Reset Password</a>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "Password Reset",
                description: "Sent when a user requests a password reset",
                model: "user",
                send_email: true
            },
            {
                name: "registration_admin",
                event_name: "service_instance_requested_by_user",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">New signup for [[_company_name]]!</h2>
            <p class="___email-body">
                Congratulations! You have gained new signup! [[references.users.email]] just signed up for [[name]].
            </p>
        
            <a class="___action-button" target="_blank" href="https://[[_hostname]]/service-instance/[[id]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">View account detail</a>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "New signup for [[_company_name]]!",
                description: "Sent to admins when a new user has signed up",
                model: "service-instance",
                send_email: true,
                send_to_owner: false
            },
            {
                name: "payment_failure",
                event_name: "payment_failure",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">Oh no, your payment failed</h2>
            <p class="___email-body">
                Unfortunately,  we couldn't collect your subscription payment. Please take a moment to review your billing information, if it looks correct, please email us at [[_company_email]] and let us know. Otherwise, please update your information.
            </p>
            <a class="___action-button" target="_blank" href="[[billing_settings_url]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">Update credit card</a>
            <p class="__email-body">
                If you have any question about your subscription, email us at [[_company_email]] and let us know.
            </p>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "Oh no, your payment failed",
                description: "Sent when a payment has failed to go through. It notifies the user to update their payment method",
                model: "user",
                send_email: true
            },
            {name:"invitation",
                event_name:"user_invited",
                message:`<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">You’ve been invited to join [[_company_name]]</h2>
            <p class="___email-body">
                    Click on the link below to activate your account.
            </p>
            <a class="___action-button" target="_blank" href="[[url]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">Active Account</a>
        </div>

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject:"Invitation",
                description:"Sent when a user is invited to they system by an admin",
                model:"user",
                send_email:true
            }
        ];
        for(let email of emails){
            await knex("notification_templates").where("name", email.name).update(email)
        }

        await knex("notification_templates").where("name", "service_cancellation_submitted").update({
            name: "service_cancellation",
            event_name: "service_instance_cancellation_requested",
            message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
<div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
    <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
        <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
    </div>

    <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
        <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">User just cancelled a subscription</h2>
        <p class="___email-body">
            User [[references.users.email]] just canceled their subscription with [[_company_name]]
        </p>
        <a class="___action-button" target="_blank" href="https://[[_hostname]]/service-instance/[[id]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">View Subscription</a>
    </div>  

    <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
        <div class="__company-info" style="text-align: center;">
            <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
        </div>
        <div class="clear" style="clear: both; text-align: center;"></div>
    </div>
</div>
<div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
            subject: "User just cancelled a subscription",
            description: "Sent when a service cancellation has been requested by a user",
            model: "service-instance",
            send_email: false,
            send_to_owner: false
        });
    
        let updated = await knex("notification_templates").where("name", "service_cancellation");

        let newRecords = await knex("notification_templates").returning('*').insert([
            {
                name: "registration_user",
                event_name: "service_instance_requested_by_user",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">Welcome to [[_company_name]]</h2>
            <p class="___email-body">Hi there,</p>
            <p class="___email-body">
                Thanks for signing up for [[_company_name]]. Your account is ready, and you can access it using the link below. Email us at [[_company_email]] if you have any questions.
            </p>
            <a class="___action-button" target="_blank" href="https://[[_hostname]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">Access Account</a>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "Welcome to [[_company_name]]",
                description: "Sent to users when they sign up",
                model: "service-instance",
                send_email: false,
                send_to_owner: true
            },
            {
                name: "new_invoice",
                event_name: "new_invoice",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">Thank you for the payment</h2>
            <p class="___email-body">
                The payment details are given below for your record.
            </p>
            <p class="___email-body">Invoice ID: [[invoice_id]]</p>
            <div class="___info-box" style="background: #F4F6F9; padding: 16px; margin: 16px -16px;">
                <table class="___email-table" style="border: none; font-size: 12px; color: #49575F;">
                    <tr style="font-size: 12px;">
                        <td style="font-size: 12px; padding: 5px 12px 5px 12px; padding-left: 0;">Amount Paid</td>
                        <td style="font-size: 12px; padding: 5px 12px 5px 12px;"><b style="font-weight: bold; font-size: 12px;">[[parsed_amount_due]]</b></td>
                    </tr>
                    <tr style="font-size: 12px;">
                        <td style="font-size: 12px; padding: 5px 12px 5px 12px; padding-left: 0;">Payment Date</td>
                        <td style="font-size: 12px; padding: 5px 12px 5px 12px;"><b style="font-weight: bold; font-size: 12px;">[[date]]</b></td>
                    </tr>
                </table>
            </div>
            <p class="___email-body">Let us know if you have any questions by emailing us at [[_company_email]]</p>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">
        <span style="display: inline-block;">Powered by</span>
        <img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;">
        <span style="display: inline-block;"></span>
    </div>
</div>`,
                subject: "Thank you for the payment",
                description: "Sent to users when a new invoice is generated",
                model: "invoice",
                send_email: false,
                send_to_owner: true
            },
            {
                name: "resubscribe_notification_admin",
                event_name: "service_instance_resubscribed",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">Account has resubscribed to [[_company_name]]!</h2>
            <p class="___email-body">
                [[references.users.email]] has just resubscribed to [[name]].
            </p>
            <a class="___action-button" target="_blank" href="https://[[_hostname]]/service-instance/[[service_id]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">View account detail</a>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "Account has resubscribed to [[_company_name]]!",
                description: "Sent to admins when a user resubscribed",
                model: "service-instance",
                send_email: false,
                send_to_owner: false
            },
            {
                name: "resubscribe_notification_user",
                event_name: "service_instance_resubscribed",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">We are happy to see you back!</h2>
            <p class="___email-body">
                Thank you for resubscribing to [[_company_name]].
            </p>
            <a class="___action-button" target="_blank" href="[[billing_settings_url]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">View Account Detail</a>
            <p class="___email-body">
                If you have any additional questions or need assistance, please let us know by emailing us at [[_company_email]].                   
            </p>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "We are happy to see you back!",
                description: "Sent to users when they resubscribe",
                model: "service-instance",
                send_email: false,
                send_to_owner: true
            },
            {
                name: "service_cancellation_goodbye",
                event_name: "service_instance_cancellation_requested",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">We're sad to let you go</h2>
            <p class="___email-body">
                Thank you for trying [[_company_name]]. Your subscription with us ended today.
            </p>
            <p class="___email-body">
                If you want to come back, your account is one click away.
            </p>
            <a class="___action-button" target="_blank" href="[[billing_settings_url]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">Reactivate Account</a>
            <p class="___email-body">
                We hope to welcome you back soon!
            </p>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "We're sad to let you go",
                description: "Sent to a user after they cancel their subscription",
                model: "service-instance-cancellation",
                send_email: false
            },
            {
                name: "registration_enterprise_user",
                event_name: "service_instance_custom_requested_by_user",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">Pricing request received</h2>
            <p class="___email-body">
                Thank you for contacting [[_company_name]]. We have received your request for pricing. Our team will be in contact with your shortly.
            </p>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "Pricing request received",
                description: "Sent to customer when an enterprise service is requested",
                model: "service-instance",
                send_email: false,
                send_to_owner: true
            },
            {
                name: "registration_enterprise_admin",
                event_name: "service_instance_custom_requested_by_user",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">New pricing request</h2>
            <p class="___email-body">
                You have a new request for pricing.
            </p>
            <a class="___action-button" target="_blank" href="https://[[_hostname]]/service_instance/[[id]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">View Request</a>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "New pricing request",
                description: "Sent to admins when an enterprise service is requested",
                model: "service-instance",
                send_email: true,
                send_to_owner: false
            },
            {
                name: "service_instance_plan_change_user",
                event_name: "service_instance_plan_change",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">Your [[_company_name]] plan has changed</h2>
            <p class="___email-body">
                You have updated your [[_company_name]] subscription settings.
            </p>
            <a class="___action-button" target="_blank" href="[[billing_settings_url]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">View Account</a>
            <p class="___email-body">
                If you did not request this change and this message is received in error, please let us know by emailing us at [[_company_email]].
            </p>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "Your [[_company_name]] plan has changed",
                description: "Sent to users when a payment plan has been changed",
                model: "service-instance",
                send_email: false,
                send_to_owner: true

            },
            {
                name: "service_instance_plan_change_admin",
                event_name: "service_instance_plan_change",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">[[references.users.email]] has changed their plan</h2>
            <p class="___email-body">
                [[references.users.email]] has updated their subscription settings.
            </p>
            <a class="___action-button" target="_blank" href="https://[[_hostname]]/service-instance/[[id]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">View The Changed Plan</a>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "[[references.users.email]] has changed their plan",
                description: "Sent to admins when a service payment plan has been changed",
                model: "service-instance",
                send_email: false,
                send_to_owner: false
            },
            {
                name: "trial_expiration",
                event_name: "service_instance_trial_expired",
                message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">Your free trial has expired</h2>
            <p class="___email-body">
                Your [[_company_name]] trial has ended, but your progress has been saved and is still available. You can reactivate your account if you wish.
            </p>
            <a class="___action-button" target="_blank" href="[[billing_settings_url]]" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">Reactivate Account</a>
            <p class="__email-body">
                Everyone gets busy and you may not have had enough time to evaluate [[_company_name]]. To extend your trial, simply email us at [[_company_email]].
            </p>
        </div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline-block;"><img class="___footer-logo" alt="servicebot-logo" src="https://[[_hostname]]/assets/email-templates/footer-logo.png" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;"></span></div>
</div>`,
                subject: "Your free trial has expired",
                description: "Sent when a free trial has ended",
                model: "service-instance",
                send_email: false,
                send_to_owner: true
            }
        ]);

        let admin = await knex("notification_templates_to_roles").returning("id").insert([{
            notification_template_id: newRecords[2].id,
            role_id: 1

        },
        {
            notification_template_id: updated[0].id,
            role_id: 1
        },
        {
            notification_template_id: newRecords[6].id,
            role_id: 1
        },
        {
            notification_template_id: newRecords[8].id,
            role_id: 1
        }])
        await knex("notification_templates").whereIn("name", ["service_instance_update", "instance_cancellation_rejected", "instance_cancellation_approved", "user_suspension"]).delete();
        return await knex;
    },

    down: async function (knex) {
    }
}