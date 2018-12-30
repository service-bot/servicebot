module.exports = {


    up: async function (knex) {
        await knex("notification_templates").where("name", "registration_admin").update({
            name: "registration_admin",
            event_name: "service_instance_requested_by_user",
            message: "You have gained a new user! [[references.users.name]] - [[references.users.email]] has signed up for service [[name]], click <a href='https://[[_hostname]]/service-instance/[[id]]>here</a> to view the subscription",
            subject: "New Sign up",
            description: "Sent to admins when a new user has signed up",
            model: "service-instance",
            send_email: true,
            send_to_owner: false    
        })
        await knex("notification_templates").insert({
            name: "welcome",
            event_name: "service_instance_requested_by_user",
            message: "Welcome to the new service, [[name]]",
            subject: "Welcome",
            description: "Sent to users when they sign up",
            model: "service-instance",
            send_email: false,
            send_to_owner: true
        });
        return await knex;
    },

    down: async function (knex) {
    }
}