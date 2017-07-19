
module.exports  = [
    {packagePath: "../plugins/core"},
    {packagePath: "../plugins/stripe"},
    {packagePath: "../plugins/updates", "interval" : 86400000, "master" : "https://devhub.servicebot.cloud/api/v1/announcements"}
];