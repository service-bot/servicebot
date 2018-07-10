module.exports = {


    up: async function (knex) {
        let permission = await knex("user_permissions").where("permission_name", "post_service_instances_id_change_properties");
        if(permission.length === 0){
            let permission_id = (await knex("user_permissions").returning("id").insert({"permission_name" : "post_service_instances_id_change_properties"}))[0];
            let rolesToPermission = [
                {role_id : 1, permission_id},
                {role_id : 2, permission_id},
                {role_id : 3, permission_id}
            ]
            let r2p = await knex("roles_to_permissions").insert(rolesToPermission);
        }else{
            console.log("permission already present!");
        }
        return await knex;
    },

    down: async function (knex) {
        return await knex;

    }
}