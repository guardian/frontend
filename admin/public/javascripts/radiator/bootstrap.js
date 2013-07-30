
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
                        riffraff.appendChild(li);
                    });

                }})
});
