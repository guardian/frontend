import fetchJson from 'lib/fetch-json';
import flattenDeep from 'lodash/flattenDeep';

const initRadiator = () => {
    // riff raff - requires you to be on the guardian network
    const apiKeyElem = document.getElementById('riffraff-api-key');
    if (!apiKeyElem || !(apiKeyElem instanceof HTMLInputElement)) {
        return;
    }
    const apiKey = apiKeyElem.value;
    const callback = `stupidJSONP${Math.floor(Math.random() * 1000)}`;
    window[callback] = deployments => {
        // a hash of the last deployment each project
        const latestDeployments = {
            CODE: {},
            PROD: {},
        };
        deployments.response.results
            .filter(deployment => deployment.projectName.startsWith('dotcom:'))
            .forEach(deploy => {
                const { project, stage } = deploy;
                if (
                    stage &&
                    latestDeployments[stage] &&
                    !Object.keys(latestDeployments[stage]).includes(project)
                ) {
                    latestDeployments[stage][project] = deploy;
                }
            });

        const renderDeployer = (stage, revision, deployer) => {
            const targetId = `${stage}-${revision}`;

            if (!document.getElementById(targetId)) {
                const list = document.getElementById(`deployers${stage}`);
                const li = document.createElement('li');
                li.setAttribute('id', targetId);
                if (list) {
                    list.appendChild(li);

                    fetchJson(
                        `//${window.location.host}/radiator/commit/${revision}`
                    ).then(rev => {
                        if (rev.commit) {
                            li.innerHTML = `${
                                rev.commit.author.name
                            } <small>(deployed by ${deployer})</small>`;
                        }
                    });
                }
            }
        };

        const renderDeploys = (stage, target) => {
            const sortedDeployments = Object.keys(
                latestDeployments[stage]
            ).sort((firstDeployment, secondDeployment) => {
                // sorting by build number (higher first) and then project name (alphabetical)
                const d1 = latestDeployments[stage][firstDeployment];
                const d2 = latestDeployments[stage][secondDeployment];
                const buildDiff = d1.build - d2.build;
                if (buildDiff !== 0) {
                    return buildDiff;
                }
                return d1.projectName.localeCompare(d2.projectName);
            });

            sortedDeployments.forEach(deployment => {
                const d = latestDeployments[stage][deployment];
                const nameAbbreviation = d.projectName.substr(7, 4); // start at 7 to drop 'dotcom: '

                const link = document.createElement('a');
                link.href = `https://riffraff.gutools.co.uk/deployment/view/${
                    d.uuid
                }`;
                link.innerHTML = `${nameAbbreviation} ${d.build}`;

                const li = document.createElement('li');
                li.className = d.status;
                li.setAttribute('title', d.projectName);
                li.appendChild(link);

                if (
                    latestDeployments.CODE[deployment] &&
                    stage === 'PROD' &&
                    d.status === 'Completed'
                ) {
                    const codeBuild = (latestDeployments.CODE[deployment] || {})
                        .build;
                    if (codeBuild !== d.build) {
                        li.className = 'Behind';
                    }
                }

                if (d.status !== 'Completed') {
                    renderDeployer(stage, d.tags.vcsRevision, d.deployer);
                }
                if (target) {
                    target.appendChild(li);
                }
            });
        };
        renderDeploys('CODE', document.getElementById('riffraffCODE'));
        renderDeploys('PROD', document.getElementById('riffraffPROD'));
    };
    const jsonpScript = document.createElement('script');
    jsonpScript.src = `https://riffraff.gutools.co.uk/api/history?${[
        `projectName=dotcom${encodeURIComponent(':')}`,
        `key=${apiKey}`,
        'pageSize=200',
        `callback=${callback}`,
    ].join('&')}`;
    if (document.body) {
        document.body.appendChild(jsonpScript);
    }

    // Page views
    fetchJson(`//${window.location.host}/ophan/pageviews`).then(data => {
        const pluckedData = data.seriesData.map(dataObj => dataObj.data);

        const todayData = flattenDeep(pluckedData).reduce((days, day) => {
            const dateTime = day.dateTime;

            if (!days[dateTime]) {
                days[dateTime] = [];
            }

            days[dateTime].push(day);

            return days;
        }, {});

        // Remove first & last Ophan entries, as they always seem slightly off
        const keys = Object.keys(todayData);

        delete todayData[keys.shift()];
        delete todayData[keys.pop()];

        // Build Graph
        const builtGraphData = Object.keys(todayData).reduce(
            (graphData, timestamp) => {
                const epoch = parseInt(timestamp, 10);
                const time = new Date(epoch);
                const hours = `0${time.getHours()}`.slice(-2);
                const mins = `0${time.getMinutes()}`.slice(-2);
                const formattedTime = `${hours}: ${mins}`;
                const totalViews = todayData[timestamp].reduce(
                    (memo, entry) => entry.count + memo,
                    0
                );

                graphData.push([formattedTime, totalViews]);

                return graphData;
            },
            [['time', 'pageviews']]
        );

        new window.google.visualization.LineChart(
            document.getElementById('pageviews')
        ).draw(window.google.visualization.arrayToDataTable(builtGraphData), {
            title: 'Page views',
            backgroundColor: '#fff',
            colors: ['#e6711b'],
            height: 160,
            legend: 'none',
            fontName: 'Georgia',
            titleTextStyle: {
                color: '#999',
            },
            hAxis: {
                textStyle: {
                    color: '#ccc',
                },
                gridlines: {
                    count: 0,
                },
                showTextEvery: 15,
                baselineColor: '#fff',
            },
            smoothLine: true,
            chartArea: {
                width: '85%',
            },
        });

        // Average pageviews now
        const lastOphanEntry = Object.keys(todayData)
            .map(key => todayData[key])
            .pop()
            .reduce((memo, entry) => entry.count + memo, 0);
        const viewsPerSecond = Math.round(lastOphanEntry / 60);
        const viewsPerSecondElem = document.querySelector(
            '.pageviews-per-second'
        );

        if (viewsPerSecondElem) {
            viewsPerSecondElem.textContent = `(${viewsPerSecond} views/sec)`;
        }
    });
};

export { initRadiator };
