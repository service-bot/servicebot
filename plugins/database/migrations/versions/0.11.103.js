module.exports = {


    up: async function (knex) {
        await knex("notification_templates").where("name", "registration_admin").update({
            name: "registration_admin",
            event_name: "service_instance_requested_by_user",
            message: "You have gained a new user! [[references.users.name]] - [[references.users.email]] has signed up for service [[name]], click <a href='https://[[_hostname]]/service-instance/[[id]]'>here</a> to view the subscription",
            subject: "Servicebot Notification - New Sign up",
            description: "Sent to admins when a new user has signed up",
            model: "service-instance",
            send_email: true,
            send_to_owner: false
        })

        await knex("notification_templates").where("name", "service_cancellation_submitted").update({
            name: "service_cancellation",
            event_name: "service_instance_cancellation_requested",
            message: "Cancellation by [[references.users.email]] for [[name]] has been submitted.",
            subject: "Servicebot Notification - Subscription cancellation",
            description: "Sent when a service cancellation has been requested by a user",
            model: "service-instance",
            send_email: false,
            send_to_owner: false
        });
        let updated = await knex("notification_templates").where("name", "service_cancellation");

        let newRecords = await knex("notification_templates").returning('id').insert([{
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
            message: `Invoice Summary - [[parsed_amount_due]]`,
            subject: "You have a new Invoice from [[_company_name]]",
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
        },

        ]);
        let admin = await knex("notification_templates_to_roles").returning("id").insert([{
            notification_template_id: newRecords[2],
            role_id: 1

        },
        {
            notification_template_id: updated[0].id,
            role_id: 1
        }])
        return await knex;
    },

    down: async function (knex) {
    }
}