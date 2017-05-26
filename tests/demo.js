
let User = require("../models/user");
let ServiceInstance = require("../models/service-instance");
let ServiceTemplate = require("../models/service-template");
let ServiceTemplateProperty = require("../models/service-template-property");
let ServiceInstanceProperty = require("../models/service-instance-property");
let ServiceCategory = require("../models/service-category");
let Invoice = require("../models/invoice");
let InvoiceLine = require("../models/invoice-line");
let Transaction = require("../models/transaction");

//password 1234
var demo_users = [
    {
        role_id: 1,
        name: null,
        email: 'admin',
        password: '$2a$10$yxdyUmvHJPOfS6xhz7ri4uaKXgFAxWa60p16ybJJRzUeXOZBi27d2',
        active: true,
        customer_id: null,
        phone: null,
        last_login: null,
    },
    {
        role_id: 3,
        name: null,
        email: 'user',
        password: '$2a$10$yxdyUmvHJPOfS6xhz7ri4uaKXgFAxWa60p16ybJJRzUeXOZBi27d2',
        active: true,
        customer_id: null,
        phone: null,
        last_login: null,
    },
    {
        role_id: 2,
        name: null,
        email: 'staff',
        password: '$2a$10$yxdyUmvHJPOfS6xhz7ri4uaKXgFAxWa60p16ybJJRzUeXOZBi27d2',
        active: true,
        customer_id: null,
        phone: null,
        last_login: null,
    }

];

var demo_service_category = [
    {
        name: 'Web Development',
        description: 'Development of custom websites and applications'
    },
    {
        name: 'Website Maintenance',
        description: 'Maintenance for applications and websites'
    },
    {
        name: 'Marketing',
        description: 'Marketing Services'
    },
    {
        name: 'Hosting',
        description: 'Hosting Services'
    }
];

var demo_service_template = [
    {
        created_by: 1,
        name: 'Small Website',
        description: 'Development of custom small CMS managed website (less than 10 pages)',
        details: '<h1>CMS-Based Website</h1><p>We offer CMS-based website development with&nbsp;a main focus on&nbsp;<strong>WordPress</strong>&nbsp;and&nbsp;<strong>Drupal</strong><strong>!</strong>&nbsp;This product includes a completely custom CMS&nbsp;based website with your satisfaction guaranteed. This package is for a small website of <strong>up to 10 pages</strong>.&nbsp;<br></p>',
        published: true,
        category_id: 1,
        statement_descriptor: "Vampeo Web",
        trial_period_days: 0,
        amount: 200000,
        overhead: 100000,
        currency: "USD",
        interval: "day",
        interval_count: 1,
        subscription_prorate: false,
        type:'one_time'
    },
    {
        created_by: 1,
        name: 'Large Website',
        description: 'Development of custom small CMS managed website (less than 50 pages)',
        details: '<h1>CMS-Based Website</h1><p>We offer CMS-based website development with a main focus on&nbsp;<strong>WordPress</strong>&nbsp;and&nbsp;<strong>Drupal</strong><strong>!</strong>&nbsp;This product includes a completely custom CMS&nbsp;based website with your satisfaction guaranteed. This package is for a large website of <strong>up to 50 pages</strong>.&nbsp;<br></p>',
        published: true,
        category_id: 1,
        statement_descriptor: "Vampeo Web",
        trial_period_days: 0,
        amount: 700000,
        overhead: 400000,
        currency: "USD",
        interval: "day",
        interval_count: 1,
        subscription_prorate: false,
        type:'one_time'
    },
    {
        category_id: 1,
        created_by: 1,
        name: "Ecommerce Website",
        description: "Fully custom E-commerce website for your company ",
        details: "<h1>Ecommerce Website</h1><p>We specialize in building completely customized e-commerce websites to increase your online sales! We can build it with&nbsp;<strong>Magento<span id=\"redactor-inline-breakpoint\"></span></strong>,&nbsp;<strong>WooCommerce<span id=\"redactor-inline-breakpoint\"></span></strong>, or&nbsp;<strong>Shopify<span id=\"redactor-inline-breakpoint\"></span></strong> based on the requirements of your shop. Your satisfaction is guaranteed and you will end up with a fully functioning e-commerce site, we just hope you're ready to handle the sales.&nbsp;</p>",
        published: true,
        statement_descriptor: "Vampeo Web",
        trial_period_days: 0,
        amount: 1200000,
        overhead: null,
        currency: "USD",
        interval: "day",
        interval_count: 1,
        subscription_prorate: false,
        type:'one_time'
    },
    {
        category_id: 1,
        created_by: 1,
        name: "Custom Web Application",
        description: "Ground up custom Web Application",
        details: "<h1>Custom Web Application</h1><p>Do you want to create a website or web application that a CMS&nbsp;or boiler plate website wont fulfill? Do you believe you've found a <strong>groundbreaking</strong> or <strong>new</strong> way of doing something online? Well you've come to the right place. We specialize in building web applications from the ground up. We have a lot of experience with <strong>Node</strong> and other <strong>cutting edge frameworks</strong>. If a computer can do it, we can build it.</p>",
        published: true,
        statement_descriptor: "Vampeo Web",
        trial_period_days: 0,
        amount: 0,
        overhead: null,
        currency: "USD",
        interval: "day",
        interval_count: null,
        subscription_prorate: false,
        type:'custom'
    },
    {
        created_by: 1,
        name: 'Small Website Maintenance',
        description: 'Maintenance for small website',
        details: 'This maintenance package includes many things',
        published: true,
        category_id: 2,
        statement_descriptor: "Vampeo Web",
        trial_period_days: 0,
        amount: 5000,
        overhead: 3000,
        currency: "USD",
        interval: "month",
        interval_count: 12,
        subscription_prorate: true,
        type:'subscription'
    },
    {
        created_by: 1,
        name: 'Large Website Maintenance',
        description: 'Maintenance for large website',
        details: 'This maintenance package includes many things',
        published: true,
        category_id: 2,
        statement_descriptor: "Vampeo Web",
        trial_period_days: 0,
        amount: 10000,
        overhead: 5000,
        currency: "USD",
        interval: "month",
        interval_count: 12,
        subscription_prorate: true,
        type:'subscription'
    },
    {
        created_by: 1,
        name: 'SSL',
        description: 'SSL for your domain',
        details: 'This includes SSL certificate for your domain',
        published: true,
        category_id: 2,
        statement_descriptor: "Vampeo Web",
        trial_period_days: 0,
        amount: 60000,
        overhead: 50000,
        currency: "USD",
        interval: "year",
        interval_count: 1,
        subscription_prorate: true,
        type:'subscription'
    },
    {
        created_by: 1,
        name: 'Brand Logo',
        description: 'Design of new brand logo',
        details: 'This includes x number of iterations and x number of sessions. Satisfaction guaranteed',
        published: true,
        category_id: 3,
        statement_descriptor: "Vampeo Web",
        trial_period_days: 0,
        amount: 50000,
        overhead: 30000,
        currency: "USD",
        interval: "day",
        interval_count: 1,
        subscription_prorate: false,
        type:'one_time'
    },
    {
        category_id: 4,
        created_by: 1,
        name: "Small Website Hosting",
        description: "Cloud hosting for small websites",
        details: "<p>We host your website and promise uptime and x time before response</p>",
        published: true,
        statement_descriptor: "Vampeo Web",
        trial_period_days: 0,
        amount: 10000,
        overhead: 7500,
        currency: "USD",
        interval: "month",
        interval_count: 12,
        subscription_prorate: true,
        type:'subscription'
    },
    {
        category_id: 4,
        created_by: 1,
        name: "Large Website Hosting",
        description: "Cloud hosting for large websites",
        details: "<p>We host your website and promise uptime and x time before response</p>",
        published: true,
        statement_descriptor: "Vampeo Web",
        trial_period_days: 0,
        amount: 20000,
        overhead: 12000,
        currency: "USD",
        interval: "month",
        interval_count: 12,
        subscription_prorate: true,
        type:'subscription'
    }
];

var demo_service_template_properties = [
    {
        name: "small_website_company_name",
        value: "Your Companies Name",
        prop_class: null,
        prop_label: "Company Name",
        prop_description: "Enter the Company for the website",
        parent_id: 1,
        private: false,
        prompt_user: true,
        required: true,
        prop_input_type: "text",
        prop_values: null
    },
    {
        name: "small_website_domain",
        value: "yourdomain.com",
        prop_class: null,
        prop_label: "Domain Name",
        prop_description: "Enter the domain of the website",
        parent_id: 1,
        private: false,
        prompt_user: true,
        required: false,
        prop_input_type: "text",
        prop_values: null
    },
    {
        name: "small_website_industry",
        value: "",
        prop_class: null,
        prop_label: "Industry",
        prop_description: "Select the industry your company is in",
        parent_id: 1,
        private: false,
        prompt_user: true,
        required: true,
        prop_input_type: "select",
        prop_values: [
            "Medical",
            "Construction",
            "Consulting",
            "Other"
        ]
    },
    {
        name: "large_website_company_name",
        value: "Your Companies Name",
        prop_class: null,
        prop_label: "Company Name",
        prop_description: "Enter the Company for the website",
        parent_id: 2,
        private: false,
        prompt_user: true,
        required: true,
        prop_input_type: "text",
        prop_values: null
    },
    {
        name: "large_website_domain",
        value: "yourdomain.com",
        prop_class: null,
        prop_label: "Domain Name",
        prop_description: "Enter the domain of the website",
        parent_id: 2,
        private: false,
        prompt_user: true,
        required: false,
        prop_input_type: "text",
        prop_values: null
    },
    {
        name: "large_website_industry",
        value: "",
        prop_class: null,
        prop_label: "Industry",
        prop_description: "Select the industry your company is in",
        parent_id: 2,
        private: false,
        prompt_user: true,
        required: true,
        prop_input_type: "select",
        prop_values: [
            "Medical",
            "Construction",
            "Consulting",
            "Other"
        ]
    }
];

var demo_service_instance = [
    {
        service_id: 7,
        user_id: 1,
        requested_by: 1,
        payment_plan: {
            id: "SSL-ID4",
            name: "SSL",
            amount: 60000,
            object: "plan",
            created: 1492817037,
            currency: "usd",
            interval: "year",
            livemode: false,
            metadata: {},
            interval_count: 1,
            trial_period_days: null,
            statement_descriptor: "Vampeo Web"
        },
        name: "SSL",
        description: "SSL for your domain <hr> null",
        subscription_id: null,
        status: "requested",
        type:'subscription',
        created_at: "2017-04-21T23:23:56.384Z",
        updated_at: "2017-04-21T23:23:57.179Z",
    },
    {
        service_id: 9,
        user_id: 2,
        requested_by: 1,
        payment_plan: {
            id: "Small-Website Hosting-ID5",
            name: "Small Website Hosting",
            amount: 10000,
            object: "plan",
            created: 1492817124,
            currency: "usd",
            interval: "month",
            livemode: false,
            metadata: {},
            interval_count: 12,
            trial_period_days: null,
            statement_descriptor: "Vampeo Web"
        },
        name: "Small Website Hosting",
        description: "Cloud hosting for small websites <hr> <p>We host your website and promise uptime and x time before response</p>",
        subscription_id: "sub_AWDZrTVCqJntJI",
        status: "running",
        type:'subscription',
        created_at: "2017-04-21T23:25:23.358Z",
        updated_at: "2017-04-21T23:25:25.095Z",
    },
    {
        service_id: 7,
        user_id: 3,
        requested_by: 3,
        payment_plan: {
            id: "SSL-ID6",
            name: "SSL",
            amount: 60000,
            object: "plan",
            created: 1492817178,
            currency: "usd",
            interval: "year",
            livemode: false,
            metadata: {},
            interval_count: 1,
            trial_period_days: null,
            statement_descriptor: "Vampeo Web"
        },
        name: "SSL",
        description: "SSL for your domain <hr> null",
        subscription_id: "sub_AWDZNVLJ3za12p",
        status: "running",
        type:'subscription',
        created_at: "2017-04-21T23:26:17.224Z",
        updated_at: "2017-04-21T23:26:18.940Z",
    },
    {
        service_id: 7,
        user_id: 3,
        requested_by: 1,
        payment_plan: {
            id: "SSL-ID7",
            name: "SSL",
            amount: 60000,
            object: "plan",
            created: 1492817534,
            currency: "usd",
            interval: "year",
            livemode: false,
            metadata: {},
            interval_count: 1,
            trial_period_days: null,
            statement_descriptor: "Vampeo Web"
        },
        name: "SSL",
        description: "SSL for your domain <hr> ",
        subscription_id: "sub_AWDfE8XE5E9Yki",
        status: "running",
        type:'subscription',
        created_at: "2017-04-21T23:32:13.842Z",
        updated_at: "2017-04-21T23:32:15.487Z",
    },
    {
        service_id: 1,
        user_id: 3,
        requested_by: 3,
        payment_plan: {
            id: "Small-Website-ID8",
            name: "Small Website",
            amount: 200000,
            object: "plan",
            created: 1492875366,
            currency: "usd",
            interval: "day",
            livemode: false,
            metadata: {},
            interval_count: 1,
            trial_period_days: null,
            statement_descriptor: "Vampeo Web"
        },
        name: "Small Website",
        description: "Development of custom small CMS managed website (less than 10 pages) <hr> ",
        subscription_id: "sub_AWTD4lx48k63zB",
        status: "running",
        type:'one_time',
        created_at: "2017-04-22T15:36:02.214Z",
        updated_at: "2017-04-22T15:36:04.043Z",
    }
];


var demo_service_instance_properties = [
    {
        name: "small_website_company_name",
        value: "Your Companies Name",
        prop_class: null,
        prop_label: "Company Name",
        prop_description: "Enter the Company for the website",
        parent_id: 5
    },
    {
        name: "small_website_domain",
        value: "yourdomain.com",
        prop_class: null,
        prop_label: "Domain Name",
        prop_description: "Enter the domain of the website",
        parent_id: 5
    },
    {
        name: "small_website_industry",
        value: "Construction",
        prop_class: null,
        prop_label: "Industry",
        prop_description: "Select the industry your company is in",
        parent_id: 5
    }
];

let demo_invoices = [
    {
        user_id: 1,
        service_instance_id: null,
        invoice_id: "in_1A9gqWHSBbxioZ9IGj89ulGg",
        subscription: "sub_A8Zqw22C79cQHJ",
        charge: "ch_1A9oUiHSBbxioZ9IXzInhEDA",
        description: null,
        amount_due: 3000,
        discount: null,
        attempt_count: 1,
        closed: true,
        currency: "usd",
        forgiven: false,
        date: "1492462396",
        next_attempt: null,
        paid: true,
        period_end: "1492462276",
        period_start: "1489783876",
        receipt_number: null,
        starting_balance: 0,
        ending_balance: 0,
        total: 3000,
        livemode: false,
        created_at: "2017-04-20T01:38:40.834Z",
        updated_at: "2017-04-20T01:38:40.834Z",
    },
    {
        user_id: 1,
        service_instance_id: null,
        invoice_id: "in_19yS3aHSBbxioZ9Icjb7ot0T",
        subscription: "sub_A8Zqw22C79cQHJ",
        charge: "ch_19yT06HSBbxioZ9I9AsIzQW3",
        description: null,
        amount_due: 5513,
        discount: null,
        attempt_count: 1,
        closed: true,
        currency: "usd",
        forgiven: false,
        date: "1489783938",
        next_attempt: null,
        paid: true,
        period_end: "1489783876",
        period_start: "1487364676",
        receipt_number: null,
        starting_balance: 0,
        ending_balance: 0,
        total: 5513,
        livemode: false,
        created_at: "2017-04-20T01:38:40.942Z",
        updated_at: "2017-04-20T01:38:40.942Z",
    },
    {
        user_id: 1,
        service_instance_id: null,
        invoice_id: "in_19pl1gHSBbxioZ9IyVyZvmvn",
        subscription: "sub_AA5Cg5yzGeI3ck",
        charge: "ch_19pl1gHSBbxioZ9ID7hR7Eho",
        description: null,
        amount_due: 200,
        discount: null,
        attempt_count: 1,
        closed: true,
        currency: "usd",
        forgiven: false,
        date: "1487711904",
        next_attempt: null,
        paid: true,
        period_end: "1487711904",
        period_start: "1485294927",
        receipt_number: null,
        starting_balance: 0,
        ending_balance: 0,
        total: 200,
        livemode: false,
        created_at: "2017-04-20T01:38:42.899Z",
        updated_at: "2017-04-20T01:38:42.899Z",
    }
];

let demo_invoice_lines = [
    {
        invoice_id: 1,
        line_item_id: "sub_A8Zqw22C79cQHJ",
        amount: 3000,
        currency: "usd",
        description: null,
        proration: false,
        quantity: 1,
        type: "subscription",
        livemode: false,
        created_at: "2017-04-20T01:38:41.831Z",
        updated_at: "2017-04-20T01:38:41.831Z"
    },
    {
        invoice_id: 2,
        line_item_id: "ii_19pklBHSBbxioZ9IlZxiZqsq",
        amount: 125,
        currency: "usd",
        description: "Testing",
        proration: false,
        quantity: null,
        type: "invoiceitem",
        livemode: false,
        created_at: "2017-04-20T01:38:42.245Z",
        updated_at: "2017-04-20T01:38:42.245Z"
    },
    {
        invoice_id: 2,
        line_item_id: "ii_19pklBHSBbxioZ9IU4USNUXU",
        amount: 124,
        currency: "usd",
        description: "New charge tests",
        proration: false,
        quantity: null,
        type: "invoiceitem",
        livemode: false,
        created_at: "2017-04-20T01:38:42.245Z",
        updated_at: "2017-04-20T01:38:42.245Z"
    },
    {
        invoice_id: 2,
        line_item_id: "ii_19pklBHSBbxioZ9I2qNMhmYf",
        amount: 126,
        currency: "usd",
        description: "Testing",
        proration: false,
        quantity: null,
        type: "invoiceitem",
        livemode: false,
        created_at: "2017-04-20T01:38:42.245Z",
        updated_at: "2017-04-20T01:38:42.245Z"
    },
    {
        invoice_id: 2,
        line_item_id: "ii_19pklBHSBbxioZ9I6VZVjCJm",
        amount: 127,
        currency: "usd",
        description: "Testing",
        proration: false,
        quantity: null,
        type: "invoiceitem",
        livemode: false,
        created_at: "2017-04-20T01:38:42.245Z",
        updated_at: "2017-04-20T01:38:42.245Z"
    },
    {
        invoice_id: 2,
        line_item_id: "ii_19pkSIHSBbxioZ9IMjJ3196t",
        amount: 123,
        currency: "usd",
        description: "New charge tests",
        proration: false,
        quantity: null,
        type: "invoiceitem",
        livemode: false,
        created_at: "2017-04-20T01:38:42.245Z",
        updated_at: "2017-04-20T01:38:42.245Z"
    },
    {
        invoice_id: 2,
        line_item_id: "ii_19pkB0HSBbxioZ9IU7EtnbyY",
        amount: 444,
        currency: "usd",
        description: "test3 ",
        proration: false,
        quantity: null,
        type: "invoiceitem",
        livemode: false,
        created_at: "2017-04-20T01:38:42.245Z",
        updated_at: "2017-04-20T01:38:42.245Z"
    },
    {
        invoice_id: 2,
        line_item_id: "ii_19pkAfHSBbxioZ9IuUAr6fJH",
        amount: 444,
        currency: "usd",
        description: "test3",
        proration: false,
        quantity: null,
        type: "invoiceitem",
        livemode: false,
        created_at: "2017-04-20T01:38:42.245Z",
        updated_at: "2017-04-20T01:38:42.245Z"
    },
    {
        invoice_id: 2,
        line_item_id: "ii_19oKhMHSBbxioZ9I9lepU4EI",
        amount: 500,
        currency: "usd",
        description: "Manual Generation",
        proration: false,
        quantity: null,
        type: "invoiceitem",
        livemode: false,
        created_at: "2017-04-20T01:38:42.245Z",
        updated_at: "2017-04-20T01:38:42.245Z"
    },
    {
        invoice_id: 2,
        line_item_id: "ii_19oKgvHSBbxioZ9IAwunjbVh",
        amount: 500,
        currency: "usd",
        description: "Manual Generation",
        proration: false,
        quantity: null,
        type: "invoiceitem",
        livemode: false,
        created_at: "2017-04-20T01:38:42.245Z",
        updated_at: "2017-04-20T01:38:42.245Z"
    },
    {
        invoice_id: 2,
        line_item_id: "sub_A8Zqw22C79cQHJ",
        amount: 3000,
        currency: "usd",
        description: null,
        proration: false,
        quantity: 1,
        type: "subscription",
        livemode: false,
        created_at: "2017-04-20T01:38:42.245Z",
        updated_at: "2017-04-20T01:38:42.245Z"
    },
    {
        invoice_id: 3,
        line_item_id: "sub_AA5Cg5yzGeI3ck",
        amount: 200,
        currency: "usd",
        description: null,
        proration: false,
        quantity: 1,
        type: "subscription",
        livemode: false,
        created_at: "2017-04-20T01:38:44.106Z",
        updated_at: "2017-04-20T01:38:44.106Z"
    }
];

let demo_transactions = [
    {
        invoice_id: 1,
        user_id: 1,
        charge_id: "ch_1A9oUiHSBbxioZ9IXzInhEDA",
        invoice: "in_1A9gqWHSBbxioZ9IGj89ulGg",
        amount: 3000,
        refunded: false,
        amount_refunded: 0,
        refunds: {
            url: "/v1/charges/ch_1A9oUiHSBbxioZ9IXzInhEDA/refunds",
            data: [],
            object: "list",
            has_more: false,
            total_count: 0
        },
        captured: true,
        currency: "usd",
        dispute: null,
        paid: true,
        description: null,
        failure_code: null,
        failure_message: null,
        statement_descriptor: "Testing Cancellations",
        status: "succeeded",
        livemode: false,
        created_at: "2017-04-20T01:38:41.833Z",
        updated_at: "2017-04-20T01:38:41.833Z"
    },
    {
        invoice_id: 2,
        user_id: 1,
        charge_id: "ch_19yT06HSBbxioZ9I9AsIzQW3",
        invoice: "in_19yS3aHSBbxioZ9Icjb7ot0T",
        amount: 5513,
        refunded: false,
        amount_refunded: 0,
        refunds: {
            url: "/v1/charges/ch_19yT06HSBbxioZ9I9AsIzQW3/refunds",
            data: [],
            object: "list",
            has_more: false,
            total_count: 0
        },
        captured: true,
        currency: "usd",
        dispute: null,
        paid: true,
        description: null,
        failure_code: null,
        failure_message: null,
        statement_descriptor: "Testing Cancellations",
        status: "succeeded",
        livemode: false,
        created_at: "2017-04-20T01:38:42.251Z",
        updated_at: "2017-04-20T01:38:42.251Z"
    },
    {
        invoice_id: 3,
        user_id: 1,
        charge_id: "ch_19pl1gHSBbxioZ9ID7hR7Eho",
        invoice: "in_19pl1gHSBbxioZ9IyVyZvmvn",
        amount: 200,
        refunded: false,
        amount_refunded: 62,
        refunds: {
            url: "/v1/charges/ch_19pl1gHSBbxioZ9ID7hR7Eho/refunds",
            data: [
                {
                    id: "re_19qd6QHSBbxioZ9I4MzzMD0Z",
                    amount: 14,
                    charge: "ch_19pl1gHSBbxioZ9ID7hR7Eho",
                    object: "refund",
                    reason: "duplicate",
                    status: "succeeded",
                    created: 1487919774,
                    currency: "usd",
                    metadata: {},
                    receipt_number: null,
                    balance_transaction: "txn_19qd6QHSBbxioZ9Ib5IKmsxj"
                },
                {
                    id: "re_19qd5LHSBbxioZ9IlI74AU4m",
                    amount: 13,
                    charge: "ch_19pl1gHSBbxioZ9ID7hR7Eho",
                    object: "refund",
                    reason: "duplicate",
                    status: "succeeded",
                    created: 1487919707,
                    currency: "usd",
                    metadata: {},
                    receipt_number: null,
                    balance_transaction: "txn_19qd5LHSBbxioZ9IMwPOOEwF"
                },
                {
                    id: "re_19qcz1HSBbxioZ9Ik2njjQFZ",
                    amount: 12,
                    charge: "ch_19pl1gHSBbxioZ9ID7hR7Eho",
                    object: "refund",
                    reason: "duplicate",
                    status: "succeeded",
                    created: 1487919315,
                    currency: "usd",
                    metadata: {},
                    receipt_number: null,
                    balance_transaction: "txn_19qcz1HSBbxioZ9IZOvMMHpu"
                },
                {
                    id: "re_19qcxkHSBbxioZ9I9k0gysCg",
                    amount: 12,
                    charge: "ch_19pl1gHSBbxioZ9ID7hR7Eho",
                    object: "refund",
                    reason: "duplicate",
                    status: "succeeded",
                    created: 1487919236,
                    currency: "usd",
                    metadata: {},
                    receipt_number: null,
                    balance_transaction: "txn_19qcxkHSBbxioZ9ISzf3BEcJ"
                },
                {
                    id: "re_19qcskHSBbxioZ9ILdPmwdlf",
                    amount: 11,
                    charge: "ch_19pl1gHSBbxioZ9ID7hR7Eho",
                    object: "refund",
                    reason: "duplicate",
                    status: "succeeded",
                    created: 1487918926,
                    currency: "usd",
                    metadata: {},
                    receipt_number: null,
                    balance_transaction: "txn_19qcskHSBbxioZ9IYmL1enJB"
                }
            ],
            object: "list",
            has_more: false,
            total_count: 5
        },
        captured: true,
        currency: "usd",
        dispute: null,
        paid: true,
        description: null,
        failure_code: null,
        failure_message: null,
        statement_descriptor: "somehting",
        status: "succeeded",
        livemode: false,
        created_at: "2017-04-20T01:38:44.107Z",
        updated_at: "2017-04-20T01:38:44.107Z"
    }
];


module.exports = new Promise(function (resolve_top, reject_top) {


    return new Promise(function (resolve, reject) {
        //Create users
        Promise.all(demo_users.map(function (userData) {
            return new Promise(function (resolve_user, reject_user) {
                let newUser = new User(userData);
                newUser.createWithStripe(function (err, result) {
                    if(!err) {
                        return resolve_user(result);
                    } else {
                        return reject_user(err);
                    }
                });
            });
        })).then(function () {
            console.log('User creation completed');
            return resolve('User creation completed');
        }).catch(function (err) {
            return reject(err);
        });
    }).then(function () {
        //Create Service categories
        return new Promise(function (resolve, reject) {
            ServiceCategory.batchCreate(demo_service_category, function (result) {
                return resolve(result);
            });
        });
    }).then(function () {
        //Create Service templates
        return new Promise(function (resolve, reject) {
            ServiceTemplate.batchCreate(demo_service_template, function (result) {
                return resolve(result);
            });
        });
    }).then(function () {
        //Create Service templates
        return new Promise(function (resolve, reject) {
            ServiceTemplateProperty.batchCreate(demo_service_template_properties, function (result) {
                return resolve(result);
            });
        });
    }).then(function () {
        //Create Service templates
        return new Promise(function (resolve, reject) {
            ServiceInstance.batchCreate(demo_service_instance, function (result) {
                return resolve(result);
            });
        });
    }).then(function () {
        //Create Service templates
        return new Promise(function (resolve, reject) {
            ServiceInstanceProperty.batchCreate(demo_service_instance_properties, function (result) {
                return resolve(result);
            });
        });
    }).then(function () {
        //Create Service templates
        return new Promise(function (resolve, reject) {
            Invoice.batchCreate(demo_invoices, function (result){
                return resolve(result);
            });
        });
    }).then(function () {
        //Create Service templates
        return new Promise(function (resolve, reject) {
            Transaction.batchCreate(demo_transactions, function (result) {
                return resolve(result);
            });
        });
    }).then(function () {
        //Create Service templates
        return new Promise(function (resolve, reject) {
            InvoiceLine.batchCreate(demo_invoice_lines, function (result) {
                return resolve(result);
            });
        });
    }).then(function () {
        return resolve_top('Completed demo data setup');
    }).catch(function (err) {
        return reject_top(err);
    });

});

//user
//service template
    //service template properties
        //service instance
            //service instance properties
            //messages
                //invoice
                    //transaction
                    //invoice lines

