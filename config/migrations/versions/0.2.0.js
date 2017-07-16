module.exports = {
    up : function(knex){
        console.log("migrating database to version 0.2.0");
        return knex.schema.renameTable("email_templates", "notification_templates")
            .alterTable("notification_templates", t => {
                t.string("event_name");
                t.renameColumn("email_body", "message");
                t.renameColumn("email_subject", "subject");
                t.boolean("send_email").defaultTo(true);
                t.boolean("send_to_owner").defaultTo(true);
                t.boolean("create_notification").default(true);
            })
            .alterTable("notifications", t => {
                t.dropPrimary();
                t.integer("user_id").references("users.id").onDelete('cascade');
                t.boolean("email_delivered").defaultTo(false);
                t.boolean("email_read").defaultTo(false);


            })
            .alterTable("notifications", t => {
                t.string("source_id").unique().alter();
                t.increments();
            })
            .renameTable("email_templates_to_roles","notification_templates_to_roles")
            .alterTable("notification_templates_to_roles", t => {
                t.renameColumn("email_template_id","notification_template_id")
            })
            .alterTable("service_templates", t => {
                t.string("name").notNullable().unique().alter();
            })
            .alterTable("user_invoices", t => {
                t.string('invoice_id').unique().alter();
            })

    },
    down : function(knex){
        console.log("rolling back version 0.2.0 migration");
        return knex.schema.renameTable("notification_templates", "email_templates")
            .alterTable("email_templates", t => {
                t.dropColumns("event_name", "send_email", "send_to_owner", "create_notification");
                t.renameColumn("message", "email_body");
                t.renameColumn("subject", "email_subject");
             })
            .alterTable("notifications", t => {
                t.dropColumns("user_id", "id", "email_delivered", "email_read",)
                t.dropUnique("source_id");
                t.integer("source_id").primary().alter();
            })
            .renameTable("notification_templates_to_roles","email_templates_to_roles")
            .alterTable("email_templates_to_roles", t => {
                t.renameColumn("notification_template_id","email_template_id")
            })
            .alterTable("service_templates", t => {
                t.dropUnique("name");
            })
            .alterTable("user_invoices", t => {
                t.dropUnique('invoice_id');
            })



    }
}