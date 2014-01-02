define([
    'common/utils/ajax',
    'common/$',
    'lodash/chaining',
    'lodash/collections',
    'lodash/arrays',
    'lodash/objects',
    'lodash/main' // this is needed to enable chaining, despite being unreferenced.
], function(
    ajax,
    $,
    chaining,
    collections,
    arrays,
    objects,
    lodash
) {
    function initialise() {
        // bootstrap for http://localhost:9003/radiator

        // pingdom
        var pingdom = document.getElementById('pingdom')
        ajax({
            url:'/radiator/pingdom',
            type: 'json',
            crossOrigin: false
        }).then(
            function(status) {
                JSON.parse(status).checks.filter(function (check) {
                    return /ELB|Host|CDN/.test(check.name);
                }).forEach(function(check){
                        var li = document.createElement('li');
                        li.className = check.status;
                        li.textContent = check.name;
                        li.setAttribute('title', check.name);
                        pingdom.appendChild(li);
                })
            }
        )

        // riff raff - requires you to be on the guardian network
        ajax({
            url: 'https://riffraff.gutools.co.uk/api/history?projectName=frontend%3A%3A&key=oFsACDUt5L2HfLgfdSW2Xf1nbOKHLN5A&pageSize=200',
            type: 'jsonp',
            crossOrigin: true
        }).then(
            function(deployments) {

                // a hash of the last deployment each project
                var latestDeployments = { "CODE": {}, "PROD": {}};
                deployments.response.results.filter(function (deployment) {

                        return /^frontend::/.test(deployment.projectName)

                    }).forEach(function(deploy) {

                        var project = deploy.projectName;
                        var stage = deploy.stage;
                        if (stage && !latestDeployments[stage].hasOwnProperty(project)) {
                            latestDeployments[stage][project] = deploy;
                        }
                    });

                function renderDeployer(stage, revision, deployer){
                    var targetId = stage + "-" + revision;

                    if (!document.getElementById(targetId)) {
                        var list = document.getElementById("deployers" + stage);
                        var li = document.createElement('li');
                        li.setAttribute("id", targetId);
                        list.appendChild(li);
                        ajax({
                                url: '/radiator/commit/' + revision,
                                type: 'json'
                        }).then(
                            function(rev) {
                                li.innerHTML = rev.commit.author.name + " <small>(deployed by " + deployer + ")</small>";
                            }
                        );
                    }
                }

                function renderDeploys(stage, target) {
                    Object.keys(latestDeployments[stage]).forEach(function (deployment)  {
                        var d  = latestDeployments[stage][deployment];
                        var li = document.createElement('li');
                        li.className = d.status;
                        li.innerHTML = d.projectName;
                        li.setAttribute('title', d.projectName);
                        target.appendChild(li);
                        if(d.status !== "Completed"){
                            renderDeployer(stage, d.tags.vcsRevision, d.deployer);
                        }
                    });
                }
                renderDeploys("CODE", riffraffCODE);
                renderDeploys("PROD", riffraffPROD);
            }
        );

        // Page views
        ajax({
            url: '/ophan/pageviews',
            type: 'json'
        }).then(
            function(data) {

                var todayData = chaining.chain(data.seriesData)
                                 .pluck('data')
                                 .flatten()
                                 .groupBy(function(entry) { return entry.dateTime })
                                 .value();

                // Remove first & last Ophan entries, as they always seem slightly off
                var keys = objects.keys(todayData);
                delete todayData[arrays.first(keys)];
                delete todayData[arrays.last(keys)];

                // Build Graph
                var graphData = [['time', 'pageviews']];

                collections.each(todayData, function(viewsBreakdown, timestamp) {
                    var epoch = parseInt(timestamp, 10),
                        time  = new Date(epoch),
                        hours = ("0" + time.getHours()).slice(-2),
                        mins  = ("0" + time.getMinutes()).slice(-2),
                        formattedTime = hours + ':' + mins,
                        totalViews = collections.reduce(viewsBreakdown, function(memo, entry) { return entry.count + memo }, 0);

                    graphData.push([formattedTime, totalViews]);
                });

                new google.visualization.LineChart(document.getElementById('pageviews'))
                    .draw(google.visualization.arrayToDataTable(graphData), {
                        title: 'Page views',
                        backgroundColor: '#fff',
                        colors: ['#333'],
                        height: 125,
                        legend: 'none',
                        fontName: 'Georgia',
                        titleTextStyle: {color: '#999'},
                        hAxis: { textStyle: {color: '#ccc'}, gridlines: { count: 0 }, showTextEvery: 15, baselineColor: '#fff' },
                        smoothLine: true
                    });

                // Average pageviews now
                var lastOphanEntry = chaining.chain(todayData)
                    .values()
                    .last()
                    .reduce(function(memo, entry) { return entry.count + memo }, 0)
                    .value();
                var viewsPerSecond = Math.round(lastOphanEntry/60);
                $('.pageviews-per-second').html('(' + viewsPerSecond + ' views/sec)');

            }
        )
    }

    return {
        init: initialise
    };
});
