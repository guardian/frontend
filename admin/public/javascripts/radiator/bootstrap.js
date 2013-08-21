
// bootstrap for http://localhost:9003/radiator

window.addEventListener('load', function() {

    // pingdom
    var pingdom = document.getElementById('pingdom')
    $.ajax({ url:'/radiator/pingdom', success: function(status) {
                JSON.parse(status).checks.filter(function (check) {

                    return /ELB|Host|CDN/.test(check.name);

                    }).forEach(function(check){
                        var li = document.createElement('li');
                        li.className = check.status;
                        li.textContent = check.name;
                        li.setAttribute('title', textContent);
                        pingdom.appendChild(li);
                    })
                }})

    // riff raff - requires you to be on the guardian network

    $.ajax({
                url: 'https://riffraff.gutools.co.uk/api/history?stage=PROD&projectName=frontend&key=oFsACDUt5L2HfLgfdSW2Xf1nbOKHLN5A&pageSize=50', 
                dataType: 'jsonp',
                success: function(deployments) {

                    // a hash of the last deployment each project 
                    var latestDeployments = {};
                    deployments.response.results.filter(function (deployment) {
                        
                            return /^frontend::/.test(deployment.projectName)

                        }).forEach(function(deploy) {
                            
                            var project = deploy.projectName;
                            if (!latestDeployments.hasOwnProperty(project)) {
                                latestDeployments[project] = deploy;
                            }
                        })

                    // render
                    Object.keys(latestDeployments).forEach(function (deployment)  {
                        var d  = latestDeployments[deployment];
                        var li = document.createElement('li');
                        li.className = d.status;
                        li.innerHTML = d.projectName;
                        li.setAttribute('title', d.projectName);
                        riffraff.appendChild(li);
                    });

                }})


    // Page views
    $.ajax({
        url: 'http://dashboard.ophan.co.uk/graph/pageviews/data?hours=2&platform=next-gen&callback=?',
        dataType: 'jsonp',
        cache: true,
        jsonpCallback: 'ophanCallback',
        success: function(data) {

            var todayData = data.seriesData.filter(function(item) {
               return item.name === "Today";
            })[0].data;

            var graphData = [['time', 'pageviews']];
            todayData.forEach(function(item) {
                var time  = new Date(item.x * 1000),
                    hours = ("0" + time.getHours()).slice(-2),
                    mins  = ("0" + time.getMinutes()).slice(-2),
                    formattedTime = hours + ':' + mins;

                graphData.push([formattedTime, item.y]);
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
        },
        error: function() {
            document.getElementById('pageviews').innerHTML = '<a href="http://dashboard.ophan.co.uk/login" target="_new">Login to Ophan for Pageviews</a>';
        }
    })
});
