/*global google*/
define([
    'lib/fetch-json',
    'lodash/collections/groupBy',
    'lodash/arrays/flatten',
    'lodash/collections/pluck',
    'lodash/arrays/first',
    'lodash/arrays/last',
    'lodash/objects/values'
], function (
    fetchJson,
    groupBy,
    flatten,
    pluck,
    first,
    last,
    values
) {
    function initialise() {
        // riff raff - requires you to be on the guardian network
        var apiKey = document.getElementById('riffraff-api-key').value;
        var callback = 'stupidJSONP' + Math.floor(Math.random() * 1000);
        window[callback] = function (deployments) {
            // a hash of the last deployment each project
            var latestDeployments = { 'CODE': {}, 'PROD': {}};
            deployments.response.results.filter(function (deployment) {
                return deployment.projectName.indexOf('dotcom:') === 0;
            }).forEach(function (deploy) {
                var project = deploy.projectName;
                var stage = deploy.stage;
                if (stage && latestDeployments[stage] && !latestDeployments[stage].hasOwnProperty(project)) {
                    latestDeployments[stage][project] = deploy;
                }
            });

            function renderDeployer(stage, revision, deployer) {
                var targetId = stage + '-' + revision;

                if (!document.getElementById(targetId)) {
                    var list = document.getElementById('deployers' + stage);
                    var li = document.createElement('li');
                    li.setAttribute('id', targetId);
                    list.appendChild(li);
                    fetchJson('//' + location.host + '/radiator/commit/' + revision).then(
                        function (rev) {
                            if (rev.commit) {
                                li.innerHTML = rev.commit.author.name + ' <small>(deployed by ' + deployer + ')</small>';
                            }
                        }
                    );
                }
            }

            function renderDeploys(stage, target) {
                var sortedDeployments = Object.keys(latestDeployments[stage])
                    .sort(function(firstDeployment, secondDeployment) {
                        //sorting by build number (higher first) and then project name (alphabetical)
                        var d1 = latestDeployments[stage][firstDeployment];
                        var d2 = latestDeployments[stage][secondDeployment];
                        var buildDiff = d1.build - d2.build;
                        if (buildDiff !== 0) {
                            return buildDiff;
                        }
                        return d1.projectName.localeCompare(d2.projectName);
                    });

                sortedDeployments.forEach(function (deployment) {
                    var d  = latestDeployments[stage][deployment];
                    var nameAbbreviation = d.projectName.substr(7, 4); //start at 7 to drop 'dotcom: '

                    var link = document.createElement('a');
                    link.href = 'https://riffraff.gutools.co.uk/deployment/view/' + d.uuid;
                    link.innerHTML = nameAbbreviation + ' ' + d.build;

                    var li = document.createElement('li');
                    li.className = d.status;
                    li.setAttribute('title', d.projectName);
                    li.appendChild(link);

                    if (latestDeployments.CODE[deployment] && stage === 'PROD' && d.status === 'Completed') {
                        var codeBuild = (latestDeployments.CODE[deployment] || {}).build;
                        if (codeBuild !== d.build) {
                            li.className = 'Behind';
                        }
                    }

                    if (d.status !== 'Completed') {
                        renderDeployer(stage, d.tags.vcsRevision, d.deployer);
                    }

                    target.appendChild(li);
                });
            }
            renderDeploys('CODE', document.getElementById('riffraffCODE'));
            renderDeploys('PROD', document.getElementById('riffraffPROD'));
        };
        var jsonpScript = document.createElement('script');
        jsonpScript.src = 'https://riffraff.gutools.co.uk/api/history?' + [
            'projectName=dotcom' + encodeURIComponent(':'),
            'key=' + apiKey,
            'pageSize=200',
            'callback=' + callback
        ].join('&');
        document.body.appendChild(jsonpScript);


        // Page views
        fetchJson('//' + location.host + '/ophan/pageviews').then(
            function (data) {

                var todayData = groupBy(flatten(pluck(data.seriesData, 'data')),
                    function (entry) { return entry.dateTime; }
                );

                // Remove first & last Ophan entries, as they always seem slightly off
                var keys =  Object.keys(todayData);
                delete todayData[first(keys)];
                delete todayData[last(keys)];

                // Build Graph
                var graphData = [['time', 'pageviews']];

                Object.keys(todayData).reduce(function (graphData, timestamp) {
                    var epoch = parseInt(timestamp, 10),
                        time  = new Date(epoch),
                        hours = ('0' + time.getHours()).slice(-2),
                        mins  = ('0' + time.getMinutes()).slice(-2),
                        formattedTime = hours + ': ' + mins,
                        totalViews = todayData[timestamp].reduce(function (memo, entry) {
                            return entry.count + memo;
                        }, 0);

                    graphData.push([formattedTime, totalViews]);
                    return graphData;
                }, graphData);

                new google.visualization.LineChart(document.getElementById('pageviews'))
                    .draw(google.visualization.arrayToDataTable(graphData), {
                        title: 'Page views',
                        backgroundColor: '#fff',
                        colors: ['#e6711b'],
                        height: 160,
                        legend: 'none',
                        fontName: 'Georgia',
                        titleTextStyle: {color: '#999'},
                        hAxis: { textStyle: {color: '#ccc'}, gridlines: { count: 0 }, showTextEvery: 15, baselineColor: '#fff' },
                        smoothLine: true,
                        chartArea: {
                            width: '85%'
                        }
                    });

                // Average pageviews now
                var lastOphanEntry = last(values(todayData)).reduce(function (memo, entry) {
                    return entry.count + memo;
                }, 0);
                var viewsPerSecond = Math.round(lastOphanEntry / 60);
                document.querySelector('.pageviews-per-second').textContent = '(' + viewsPerSecond + ' views/sec)';
            }
        );
    }

    return {
        init: initialise
    };
});
