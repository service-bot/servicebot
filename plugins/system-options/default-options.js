//the default system options
let systemOptions =
    {
        options: [
            {
                "option": "button_default_color",
                "value": "#FFFFFF",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "button_default_hover_color",
                "value": "#EEEEEE",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "button_default_text_color",
                "value": "#000000",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "button_info_color",
                "value": "#30468A",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "button_info_hover_color",
                "value": "#039BE5",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "button_info_text_color",
                "value": "#ffffff",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "button_primary_color",
                "value": "#30468A",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "button_primary_hover_color",
                "value": "#0CB175",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "button_primary_text_color",
                "value": "#ffffff",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },

            {
                "option": "app_version",
                "value": process.env.npm_package_version,
                public: false,
                "type": "system",
                "data_type": "system"
            },
            {
                "option": "background_color",
                "value": "#EAEFF1",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "page_link_color",
                "value": "#0cb175",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "header_text_color",
                "value": "#30468a",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {"option": "text_size", "value": "12", public: true, "type": "theme", "data_type": "number"},
            {"option": "allow_registration", "value": "false", public: true, "type": "system", "data_type": "bool"},
            {"option": "company_name", public: true, "type": "system", "data_type": "text"},
            {"option": "company_address", public: true, "type": "system", "data_type": "text"},
            {"option": "company_phone_number", public: true, "type": "system", "data_type": "text"},
            {"option": "company_email", public: true, "type": "system", "data_type": "text"},
            {"option": "hostname", public: true, "type": "system", "data_type": "text"},
            {
                "option": "featured_service_heading",
                "value": "Featured Services",
                public: true,
                "type": "featured services",
                "data_type": "text"
            },
            {
                "option": "services_listing_page_heading_text",
                "value": "All Products and Services",
                public: true,
                "type": "services listing page",
                "data_type": "text"
            },
            {
                "option": "featured_service_list_count",
                "value": "6",
                public: true,
                "type": "featured services",
                "data_type": "number"
            },
            {
                "option": "service_box_body_text_color",
                "value": "#000000",
                public: true,
                "type": "service box",
                "data_type": "color_picker"
            },
            {
                "option": "service_box_body_background_color",
                "value": "#FFFFFF",
                public: true,
                "type": "service box",
                "data_type": "color_picker"
            },
            {
                "option": "service_box_icon_display",
                "value": true,
                public: true,
                "type": "service box",
                "data_type": "bool"
            },
            {
                "option": "service_box_request_button_text",
                "value": "default",
                public: true,
                "type": "service box",
                "data_type": "text"
            },
            {
                "option": "service_box_category_display",
                "value": true,
                public: true,
                "type": "service box",
                "data_type": "bool"
            },
            {
                "option": "service_box_header_text_color",
                "value": "#000000",
                public: true,
                "type": "service box",
                "data_type": "color_picker"
            },
            {
                "option": "service_box_header_background_color",
                "value": "#A2B7BF",
                public: true,
                "type": "service box",
                "data_type": "color_picker"
            },
            {
                "option": "primary_theme_text_color",
                "value": "#FFFFFF",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "primary_theme_background_color",
                "value": "#03A9F4",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "home_featured_description",
                "value": "You can customize these texts in the system settings.",
                public: true,
                "type": "content",
                "data_type": "text"
            },
            {
                "option": "home_featured_heading",
                "value": "Start selling your offerings in minutes!",
                public: true,
                "type": "content",
                "data_type": "text"
            },
            {
                "option": "home_featured_text_color",
                "value": "#ffffff",
                public: true,
                "type": "content",
                "data_type": "color_picker"
            },
            {
                "option": "breadcrumb_color",
                "value": "#FFFFFF",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "featured_service_show_all_button_text",
                "value": "Show All",
                public: true,
                "type": "featured services",
                "data_type": "text"
            },
            {
                "option": "featured_service_section_background_color",
                "value": "#FFFFFF",
                public: true,
                "type": "featured services",
                "data_type": "color_picker"
            },
            {"option": "upload_limit", "value": 10, public: false, "type": "system", "data_type": "number"},
            {
                "option": "service_template_icon_background_color",
                "value": "#03A9F4",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "service_template_icon_fill_color",
                "value": "#FFFFFF",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "purchase_page_featured_area_overlay_color",
                "value": "#039BE5",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "purchase_page_featured_area_overlay_opacity",
                "value": "0.6",
                public: true,
                "type": "theme",
                "data_type": "text"
            },
            {
                "option": "purchase_page_featured_area_text_color",
                "value": "#ffffff",
                public: true,
                "type": "theme",
                "data_type": "color_picker"
            },
            {
                "option": "purchase_page_featured_area_height",
                "value": "500",
                public: true,
                "type": "theme",
                "data_type": "text"
            },
            {
                "option": "purchase_page_featured_area_padding_top",
                "value": "20",
                public: true,
                "type": "theme",
                "data_type": "text"
            },
            {
                "option": "purchase_page_featured_area_padding_bottom",
                "value": "20",
                public: true,
                "type": "theme",
                "data_type": "text"
            },
            {
                "option": "service_request_title_description",
                "value": "What you are getting",
                public: true,
                "type": "theme",
                "data_type": "text"
            },
            {
                "option": "service_request_title_form",
                "value": "Get your service",
                public: true,
                "type": "theme",
                "data_type": "text"
            },
            {"option": "google_analytics", public: true, "type": "system", "data_type": "text"},
            {"option": "show_trial", "value": false, public: true, "type": "service box", "data_type": "bool"},
            {"option": "extra_css", "value": false, public: true, "type": "theme", "data_type": "text"},
            {
                "option": "currency",
                "public": true,
                "type": "system",
                "data_type": "currency",
                "value": "usd"
            },
            {"option": "site_title", "value": "Servicebot - Subscription Management and Billing Automation System", public: true, "type": "theme", "data_type": "text"},
            {"option": "site_description", "value": "Services served and managed in a single app", public: true, "type": "theme", "data_type": "text"},
            {"option": "auto_approve_cancellations", "value": true, public: true, "type": "system", "data_type": "bool"}

        ],
        populateOptions: function (options = systemOptions.options, model = require("../models/system-options")) {
            return Promise.all(options.map((option) => {
                return new Promise((resolve, reject) => {
                    new model(option).create((err, result) => {
                        if (err) {
                            if (err.code === '23505') {
                                resolve(`option ${option.option} already exists`);
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve(`option ${option.option} was created`)
                        }
                    })
                })
            }))
        }
    };

module.exports = systemOptions;