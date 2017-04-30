let map = {
    "users" : {

    },
    "service-instances" : {
        "GET" : {
            "/" : ["get_service_instances"],
            "search" : ["get_service_instances"],
            ":id" : ["get_service_instances"],
            "own" : ["can_view_owned"],
            ":id/files" : ["can_eat"]
        },
        "POST" : {
            "/" : ["can_create_service_instances"]
        },
        "PUT" : {
            "/" : ["can_update_service_instance"]
        }

    },
    "service-templates" : {

    },
    "service-categories" : {

    }

};
module.exports = map;