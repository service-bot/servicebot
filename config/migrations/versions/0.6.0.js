module.exports = {
    up : function(knex){
         return knex.schema.alterTable("properties", t => {
                t.jsonb('config');
                t.jsonb('data');
                t.string("type")
            }).then(result => {
                return knex("service_template_properties").where(true, true)
            }).then(props => {
                let propUpdates = props.map(prop => {
                    prop.type = prop.prop_input_type;
                    prop.data = { value : prop.value};
                    if(prop.prop_values){
                        prop.config = {value : prop.prop_values}
                    }
                    return knex("service_template_properties").where("id", prop.id).update(prop);
                });
                return Promise.all(propUpdates);
            }).then(updatedProps => {
                return knex("service_instance_properties").where(true, true)
            }).then(props => {
                let propUpdates = props.map(prop => {
                    prop.data = { value : prop.value};
                    return knex("service_instance_properties").where("id", prop.id).update(prop);
                });
                return Promise.all(propUpdates);

            }).then(properties => {
                return knex.schema.alterTable("service_template_properties", t => {
                    t.dropColumns("prop_values", "prop_input_type");
                }).alterTable("properties", t => {
                    t.dropColumn("value");
                }).alterTable("charge_items", t => {
                    t.dropColumn("subscription_id");
                })

            })
    },
    down : function(knex){

            return Promise.resolve(knex.schema.alterTable("service_template_properties", t => {
                t.string("prop_input_type");
                t.specificType('prop_values', 'text[]');
            }).alterTable("properties", t => {
                t.string("value");
            }).alterTable("charge_items", t => {
                t.string("subscription_id");
            }).then(props => {
                return knex("properties").where(true, true)
            }).then(props => {
                let propUpdates = props.map(prop => {
                    if(prop.data && prop.data.value) {
                        console.log("UPDATERR")
                        prop.value = prop.data.value
                    }else{
                        prop.value = "";
                    }
                    return knex("properties").where("id", prop.id).update(prop);
                });
                return Promise.all(propUpdates);

            }).then(props => {
                return knex("service_template_properties").where(true, true)
            }).then(props => {
                    console.log(props);
                    let propUpdates = props.map(prop => {
                        if(prop.config && prop.config.value) {
                            prop.prop_values = prop.config.value
                        }
                        prop.prop_input_type = prop.type;
                        return knex("service_template_properties").where("id", prop.id).update(prop);
                    })
                    return Promise.all(propUpdates);
            }).then(properties => {

                    return knex.schema.alterTable("properties", t => {
                        t.dropColumns("config", "data", "type");
                    })

                }))
    }
}