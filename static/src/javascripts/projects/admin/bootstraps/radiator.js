/*global google*/
define([
    'common/utils/ajax',
    'common/utils/$',
    'common/utils/_'
], function(
    ajax,
    $,
    _
) {
    function initialise() {
        var pingdom = document.getElementById('pingdom');
        ajax({
            url:'/radiator/pingdom',
            type: 'json',
            crossOrigin: false
        }).then(
            function(status) {
                status.checks.filter(function (check) {
                    return /elb|host|cdn|rss/.test(check.name.toLowerCase());
                }).forEach(function(check){
                        var li = document.createElement('li');
                        li.className = check.status;
                        li.textContent = check.name;
                        li.setAttribute('title', check.name);
                        pingdom.appendChild(li);
                });
            }
        );

        // riff raff - requires you to be on the guardian network
        ajax({
            url: 'https://riffraff.gutools.co.uk/api/history?projectName=dotcom%3A&key=oFsACDUt5L2HfLgfdSW2Xf1nbOKHLN5A&pageSize=200',
            type: 'jsonp',
            crossOrigin: true
        }).then(
            function(deployments) {

                // a hash of the last deployment each project
                var latestDeployments = { 'CODE': {}, 'PROD': {}};
                deployments.response.results.filter(function (deployment) {

                        return /^dotcom:/.test(deployment.projectName);

                    }).forEach(function(deploy) {

                        var project = deploy.projectName;
                        var stage = deploy.stage;
                        if (stage && latestDeployments[stage] && !latestDeployments[stage].hasOwnProperty(project)) {
                            latestDeployments[stage][project] = deploy;
                        }
                    });

                function renderDeployer(stage, revision, deployer){
                    var targetId = stage + '-' + revision;

                    if (!document.getElementById(targetId)) {
                        var list = document.getElementById('deployers' + stage);
                        var li = document.createElement('li');
                        li.setAttribute('id', targetId);
                        list.appendChild(li);
                        ajax({
                                url: '/radiator/commit/' + revision,
                                type: 'json'
                        }).then(
                            function(rev) {
                                if (rev.commit) {
                                    li.innerHTML = rev.commit.author.name + ' <small>(deployed by ' + deployer + ')</small>';
                                }
                            }
                        );
                    }
                }

                function renderDeploys(stage, target) {
                    Object.keys(latestDeployments[stage]).forEach(function (deployment)  {
                        var d  = latestDeployments[stage][deployment];
                        var nameAbbreviation = d.projectName.substr(7, 4); //start at 7 to drop 'dotcom:'

                        var link = document.createElement('a');
                        link.href = 'https://riffraff.gutools.co.uk/deployment/view/' + d.uuid;
                        target.appendChild(link);

                        var li = document.createElement('li');
                        li.className = d.status;
                        li.innerHTML = nameAbbreviation + ' ' + d.build;
                        li.setAttribute('title', d.projectName);
                        link.appendChild(li);

                        if (latestDeployments.CODE[deployment] && stage === 'PROD' && d.status === 'Completed') {
                            var codeBuild = (latestDeployments.CODE[deployment] || {}).build;
                            if (codeBuild !== d.build){
                                li.className = 'Behind';
                            }
                        }

                        if(d.status !== 'Completed'){
                            renderDeployer(stage, d.tags.vcsRevision, d.deployer);
                        }
                    });
                }
                /*global riffraffCODE, riffraffPROD*/
                renderDeploys('CODE', riffraffCODE);
                renderDeploys('PROD', riffraffPROD);
            }
        );

        // Page views
        ajax({
            url: '/ophan/pageviews',
            type: 'json'
        }).then(
            function(data) {

                var todayData = _.groupBy(_.flatten(_.pluck(data.seriesData, 'data')),
                    function(entry) { return entry.dateTime; }
                );

                // Remove first & last Ophan entries, as they always seem slightly off
                var keys =  Object.keys(todayData);
                delete todayData[_.first(keys)];
                delete todayData[_.last(keys)];

                // Build Graph
                var graphData = [['time', 'pageviews']];

                _.forEach(todayData, function(viewsBreakdown, timestamp) {
                    var epoch = parseInt(timestamp, 10),
                        time  = new Date(epoch),
                        hours = ('0' + time.getHours()).slice(-2),
                        mins  = ('0' + time.getMinutes()).slice(-2),
                        formattedTime = hours + ':' + mins,
                        totalViews = _.reduce(viewsBreakdown, function(memo, entry) { return entry.count + memo; }, 0);

                    graphData.push([formattedTime, totalViews]);
                });

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
                var lastOphanEntry = _.reduce(_.last(_.values(todayData)),
                    function(memo, entry) { return entry.count + memo; }, 0);
                var viewsPerSecond = Math.round(lastOphanEntry / 60);
                $('.pageviews-per-second').html('(' + viewsPerSecond + ' views/sec)');
            }
        );

        // "upgrade" build icons
        $('.buildConfigurationName').each(function(build){
            var icon = $('img', build);
            var success = icon.attr('src').indexOf('success.png') >= 0;
            var link = $('a', build);
            var buildName = link[0].innerText;
            var status = success ? 'success' : 'failure';
            icon.replaceWith('<div title="' + buildName + '" class="' + status + '">' + buildName + '</div>');
            link.remove();
        });
    }

    return {
        init: initialise
    };
});
