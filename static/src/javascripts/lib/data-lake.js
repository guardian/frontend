const endpoint = 'http://performance-events.code.dev-guardianapis.com/commercial-metrics'

const logData = () => {

    const timestamp = new Date().toISOString();
    const date = timestamp.slice(0, 10);

    const jsonData = {
        received_timestamp: timestamp,
        received_date: date,
        platform: "NEXT_GEN",
        //metrics:  [{name: "xxx", value: "yyy"}],
        //properties: [{name: "xxzzzzzx", value: "zzzz"}]
    };

    if (window.guardian && window.guardian.ophan) {
        jsonData.page_view_id = window.guardian.ophan.pageViewId;
        jsonData.browser_id = window.guardian.config.ophan.browserId;
    }



    const analyticsData = new Blob([JSON.stringify(jsonData)], {
        headers: {
        'Content-Type': 'application/json',
        }
    })

    return analyticsData;

}

export { endpoint };
export default logData;
