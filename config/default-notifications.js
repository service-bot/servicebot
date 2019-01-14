let default_notifications = {};
default_notifications.templates = [
  {
    name: "service_cancellation",
    event_name: "service_instance_cancellation_requested",
    message: "Cancellation by [[references.users.email]] for [[name]] has been submitted.",
    subject: "Servicebot Notification - Subscription cancellation",
    description: "Sent when a service cancellation has been requested by a user",
    model: "service-instance",
    send_email: false,
    send_to_owner: false
},
    {
        name: "service_instance_update",
        event_name: "service_instance_updated",
        message: "Your subscription to [[name]] has been updated.",
        subject: "Subscription updated",
        description: "Sent when a service has been updated",
        model: "service-instance",
        send_email: false
    },
    {
        name: "password_reset",
        event_name: "password_reset_request_created",
        message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 52px 12px 48px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 52px 20px 52px;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">Reset Password</h2>
            <p class="___email-body">
                    Please follow the Reset Password button below to reset your [[_company_name]] account password.
            </p>
            <a class="___action-button" href="" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">Reset Password
        </a></div>  

        <div class="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 52px; margin-top: 40px;">
            <div class="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div class="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div class="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">Powered by <span style="display: inline;"><img class="___footer-logo" alt="servicebot-logo" src="data:image/png;base64,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
" style="display: inline; height: 12px; width: auto; margin: auto 3px -2px 1px;" height="12"></span>SERVICEBOT</div>
</div>`,
        subject: "Password Reset",
        description: "Sent when a user requests a password reset",
        model: "user",
        send_email: true
    },
    {
      name: "registration_admin",
      event_name: "service_instance_requested_by_user",
      message: "You have gained a new user! [[references.users.name]] - [[references.users.email]] has signed up for service [[name]], click <a href='https://[[_hostname]]/service-instance/[[id]]'>here</a> to view the subscription",
      subject: "Servicebot Notification - New Sign up",
      description: "Sent to admins when a new user has signed up",
      model: "service-instance",
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
        message:`<style>
      /* -------------------------------------
          GLOBAL RESETS
      ------------------------------------- */
      img {
        border: none;
        -ms-interpolation-mode: bicubic;
        max-width: 100%; }

      #tableWrap {
        background-color: #f6f6f6;
        font-family: sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 14px;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%; }
        #tableWrap p {
color: black
}
      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%; }
        table td {
          font-family: sans-serif;
          font-size: 14px;
          vertical-align: top; }

      /* -------------------------------------
          BODY & CONTAINER
      ------------------------------------- */

      .body {
        background-color: #f6f6f6;
        width: 100%; }

      /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
      .container {
        display: block;
        Margin: 0 auto !important;
        /* makes it centered */
        max-width: 580px;
        padding: 10px;
        width: 580px; }

      /* This should also be a block element, so that it will fill 100% of the .container */
      .content {
        box-sizing: border-box;
        display: block;
        Margin: 0 auto;
        max-width: 580px;
        padding: 10px; }

      /* -------------------------------------
          HEADER, FOOTER, MAIN
      ------------------------------------- */
      .main {
        background: #ffffff;
        border-radius: 3px;
        width: 100%; }

      .wrapper {
        box-sizing: border-box;
        padding: 20px; }

      .content-block {
        padding-bottom: 10px;
        padding-top: 10px;
      }

      .footer {
        clear: both;
        Margin-top: 10px;
        text-align: center;
        width: 100%; }
        .footer td,
        .footer p,
        .footer span,
        .footer a {
          color: #999999;
          font-size: 12px;
          text-align: center; }

      /* -------------------------------------
          TYPOGRAPHY
      ------------------------------------- */
      h1,
      h2,
      h3,
      h4 {
        color: #000000;
        font-family: sans-serif;
        font-weight: 400;
        line-height: 1.4;
        margin: 0;
        Margin-bottom: 30px; }

      h1 {
        font-size: 35px;
        font-weight: 300;
        text-align: center;
        text-transform: capitalize; }

      .main .wrapper p,
      ul,
      ol {
        font-family: sans-serif;
        font-size: 14px;
        font-weight: normal;
        margin: 0;
        Margin-bottom: 15px; }
        p li,
        ul li,
        ol li {
          list-style-position: inside;
          margin-left: 5px; }

      a {
        color: #3498db;
        text-decoration: underline; }

      /* -------------------------------------
          BUTTONS
      ------------------------------------- */
      .btn {
        box-sizing: border-box;
        width: 100%; }
        .btn ><span id="selection-marker-start" class="redactor-selection-marker"></span><span id="selection-marker-end" class="redactor-selection-marker"></span><span id="selection-marker-start" class="redactor-selection-marker"></span><span id="selection-marker-end" class="redactor-selection-marker"></span><span id="selection-marker-start" class="redactor-selection-marker"></span><span id="selection-marker-end" class="redactor-selection-marker"></span> tbody > tr > td {
          padding-bottom: 15px; }
        .btn table {
          width: auto; }
        .btn table td {
          background-color: #ffffff;
          border-radius: 5px;
          text-align: center; }
        .btn a {
          background-color: #ffffff;
          border: solid 1px #3498db;
          border-radius: 5px;
          box-sizing: border-box;
          color: #3498db;
          cursor: pointer;
          display: inline-block;
          font-size: 14px;
          font-weight: bold;
          margin: 0;
          padding: 12px 25px;
          text-decoration: none;
          text-transform: capitalize; }

      .btn-primary table td {
        background-color: #3498db; }

      .btn-primary a {
        background-color: #3498db;
        border-color: #3498db;
        color: #ffffff; }

      /* -------------------------------------
          OTHER STYLES THAT MIGHT BE USEFUL
      ------------------------------------- */
      .last {
        margin-bottom: 0; }

      .first {
        margin-top: 0; }

      .align-center {
        text-align: center; }

      .align-right {
        text-align: right; }

      .align-left {
        text-align: left; }

      .clear {
        clear: both; }

      .mt0 {
        margin-top: 0; }

      .mb0 {
        margin-bottom: 0; }

      .preheader {
        color: transparent;
        display: none;
        height: 0;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
        visibility: hidden;
        width: 0; }

      .powered-by a {
        text-decoration: none; }

      hr {
        border: 0;
        border-bottom: 1px solid #f6f6f6;
        Margin: 20px 0; }

      /* -------------------------------------
          RESPONSIVE AND MOBILE FRIENDLY STYLES
      ------------------------------------- */
      @media only screen and (max-width: 620px) {
        table[class=body] h1 {
          font-size: 28px !important;
          margin-bottom: 10px !important; }
        table[class=body] p,
        table[class=body] ul,
        table[class=body] ol,
        table[class=body] td,
        table[class=body] span,
        table[class=body] a {
          font-size: 16px !important; }
        table[class=body] .wrapper,
        table[class=body] .article {
          padding: 10px !important; }
        table[class=body] .content {
          padding: 0 !important; }
        table[class=body] .container {
          padding: 0 !important;
          width: 100% !important; }
        table[class=body] .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important; }
        table[class=body] .btn table {
          width: 100% !important; }
        table[class=body] .btn a {
          width: 100% !important; }
        table[class=body] .img-responsive {
          height: auto !important;
          max-width: 100% !important;
          width: auto !important; }}

      /* -------------------------------------
          PRESERVE THESE STYLES IN THE HEAD
      ------------------------------------- */
      @media all {
        .ExternalClass {
          width: 100%; }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%; }
        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important; }
        .btn-primary table td:hover {
          background-color: #34495e !important; }
        .btn-primary a:hover {
          background-color: #34495e !important;
          border-color: #34495e !important; } }

    </style>
<table id="tableWrap" border="0" cellpadding="0" cellspacing="0" class="body">
      <tbody><tr>
        <td class="container">
          <div class="content">

            
            <span class="preheader">This is preheader text. Some clients will show this text as a preview.</span>
            <table class="main">

              
              <tbody><tr>
                <td class="wrapper">
                  <table id="mainTable" border="0" cellpadding="0" cellspacing="0">
                    <tbody><tr>
                      <td>
                        <p>Hi there,</p>
                        <p>You have been invited, click below to finish your account.</p>
                        <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                          <tbody>
                            <tr>
                              <td align="left">
                                <table border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td> <a href="[[url]]" target="_blank">Complete Registration</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        </td></tr></tbody></table></td></tr></tbody></table>
          </div>
        </td>
      </tr>
    </tbody></table>`,
        subject:"Invitation",
        description:"Sent when a user is invited to they system by an admin",
        model:"user",
        send_email:true
    },
    {
      name: "registration_user",
      event_name: "service_instance_requested_by_user",
      message: "Welcome to the new service, [[name]]",
      subject: "Welcome",
      description: "Sent to users when they sign up",
      model: "service-instance",
      send_email: false,
      send_to_owner: true
  },
  {
      name: "new_invoice",
      event_name: "new_invoice",
      message: `<div id="servicebot-notification-email" style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div className="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div className="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div className="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[_company_name]]</h2></div>
        </div>

        <div className="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 className="___email-subject" style="font-size: 20px; margin-bottom: 24px;">Thank you for the payment</h2>
            <p className="___email-body">
                The payment details are given below for your record.
            </p>
            <p className="___email-body">Invoice ID: [[invoice_id]]</p>
            <div className="___info-box" style="background: #F4F6F9; padding: 16px; margin: 16px -16px;">
                <table className="___email-table" style="border: none; font-size: 12px; color: #49575F;">
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
            <p className="___email-body">Let us know if you have any questions by replying to this email.</p>
            <a className="___action-button" href="" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">Action
            <table className="___email-table" style="border: none; font-size: 12px; color: #49575F;">

            </table>
        </a></div>  

        <div className="___footer" style="font-size: 10px; line-height: 1.2rem; color: #FFFFFF; background-color: #24282A; padding: 36px 0px; margin-top: 40px;">
            <div className="__company-info" style="text-align: center;">
                <p style="text-align: center; opacity: 0.7;">[[_company_name]]<br style="text-align: center;">[[_company_address]]</p>
            </div>
            <div className="clear" style="clear: both; text-align: center;"></div>
        </div>
    </div>
    <div className="___power-by" style="font-size: 10px; line-height: 16px; text-align: center; color: #9B9B9B; margin-top: 11px;">
        <span style="display: inline-block;">Powered by</span>
        <img className="___footer-logo" alt="servicebot-logo" src="data:image/png;base64,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" style="display: inline-block; width: auto; margin: auto 3px 4px 1px; max-height: 12px; line-height: 12px;">
        <span style="display: inline-block;">SERVICEBOT</span>
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
      message: `[[references.users.email]] resubscribed to [[name]]`,
      subject: "Servicebot Notification - [[references.users.email]] Resubscribed",
      description: "Sent to admins when a user resubscribed",
      model: "service-instance",
      send_email: false,
      send_to_owner: false
  },
  {
      name: "resubscribe_notification_user",
      event_name: "service_instance_resubscribed",
      message: `Welcome Back!`,
      subject: "Welcome Back",
      description: "Sent to users when they resubscribe",
      model: "service-instance",
      send_email: false,
      send_to_owner: true
  },
  {
      name: "service_cancellation_goodbye",
      event_name: "service_instance_cancellation_requested",
      message: "Goodbye message",
      subject: "Sorry to see you go",
      description: "Sent to a user after they cancel their subscription",
      model: "service-instance-cancellation",
      send_email: false
  }
];
//Setting the registration_admin role to admin
//todo: no more hardcoded id...
default_notifications.templates_to_roles = [
    {
        notification_template_id: 4,
        role_id: 1
    },
    {
      notification_template_id: 1,
      role_id: 1
  },{
    notification_template_id: 10,
    role_id: 1
},
];
module.exports = default_notifications;