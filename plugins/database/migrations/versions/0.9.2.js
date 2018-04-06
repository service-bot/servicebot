module.exports = {


    up: async function (knex) {
        let SystemOptions = require("../../../../models/base/entity")("system_options", [], "option", knex);
        let optionUpdates = {
            "service_box_body_text_color": {
                "option": "service_box_body_text_color",
                "value": "#000000",
            },
            "service_box_body_background_color": {
                "option": "service_box_body_background_color",
                "value": "#DBE3E6",
            },
            "button_info_hover_color": {
                "option": "button_info_hover_color",
                "value": "#039BE5",
            },
            "button_default_hover_color": {
                "option": "button_default_hover_color",
                "value": "#EEEEEE",
            },
            "button_info_text_color": {
                "option": "button_info_text_color",
                "value": "#ffffff",
            },
            "button_primary_color": {
                "option": "button_primary_color",
                "value": "#30468A",
            },
            "home_featured_description": {
                "option": "home_featured_description",
                "value": "You can customize these texts in the system settings",
            },
            "button_default_text_color": {
                "option": "button_default_text_color",
                "value": "#000000",
            },
            "button_info_color": {
                "option": "button_info_color",
                "value": "#30468A",
            },
            "primary_theme_background_color": {
                "option": "primary_theme_background_color",
                "value": "#03A9F4",
            },
            "home_featured_heading": {
                "option": "home_featured_heading",
                "value": "Start selling your offerings in minutes!",
            },
            "home_featured_text_color": {
                "option": "home_featured_text_color",
                "value": "#FFFFFF",
            },
            "featured_service_list_count": {
                "option": "featured_service_list_count",
                "value": "6",
            },
            "breadcrumb_color": {
                "option": "breadcrumb_color",
                "value": "#FFFFFF",
            },
            "button_default_color": {
                "option": "button_default_color",
                "value": "#FFFFFF",
            },
            "purchase_page_featured_area_overlay_color": {
                "option": "purchase_page_featured_area_overlay_color",
                "value": "#039BE5",
            },
            "purchase_page_featured_area_text_color": {
                "option": "purchase_page_featured_area_text_color",
                "value": "#ffffff",
            },
            "button_primary_hover_color": {
                "option": "button_primary_hover_color",
                "value": "#0CB175",
            },
            "header_text_color": {
                "option": "header_text_color",
                "value": "#30468a",
            },
            "service_box_header_text_color": {
                "option": "service_box_header_text_color",
                "value": "#000000",
            },
            "service_box_header_background_color": {
                "option": "service_box_header_background_color",
                "value": "#A2B7BF",
            },
            "primary_theme_text_color": {
                "option": "primary_theme_text_color",
                "value": "#FFFFFF",
            },
            "button_primary_text_color": {
                "option": "button_primary_text_color",
                "value": "#ffffff",
            },
            "background_color": {
                "option": "background_color",
                "value": "#EAEFF1",
            },
            "page_link_color": {
                "option": "page_link_color",
                "value": "#0cb175",
            },
            "featured_service_section_background_color": {
                "option": "featured_service_section_background_color",
                "value": "#FFFFFF",
            },
            "service_template_icon_background_color": {
                "option": "service_template_icon_background_color",
                "value": "#03A9F4",
            },
            "service_template_icon_fill_color": {
                "option": "service_template_icon_fill_color",
                "value": "#FFFFFF",
            }};
            return await SystemOptions.batchUpdate(Object.values(optionUpdates));
        },

    down: async function (knex) {
    }
}