
module.exports = function(analytics) {
    function getVersion(req, res, next){
        res.json({"version": process.env.npm_package_version})

    }

    async function getData(req, res) {
        res.json(await analytics.getAnalyticsData());
    }

    return [
        {
            endpoint: "/analytics/version",
            method: "get",
            middleware: [getVersion],
            permissions: [],
            description: "Get Servicebot version"
        },
        {
            endpoint: "/analytics/data",
            method: "get",
            middleware: [getData],
            permissions: ["get_analytics_data"],
            description: "Get analytical data"
        }
    ]
}
