const fs = require('fs');
const AWS = require('aws-sdk');

let cloudwatch;

module.exports.getProperty = (property, file) =>
    file
        .toString()
        .split('\n')
        .filter(line => line.search(property) !== -1)[0]
        .split('=')[1];

module.exports.configure = filename => new Promise((resolve, reject) => {
    fs.readFile(filename, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
            return reject(
                new Error('Failed to read AWS credentials from file')
            );
        }

        AWS.config.update({
            region: 'eu-west-1',
            accessKeyId: module.exports.getProperty('aws.access.key', data),
            secretAccessKey: module.exports.getProperty(
                'aws.access.secret.key',
                data
            ),
        });

        try {
            cloudwatch = new AWS.CloudWatch();
            return resolve({});
        } catch (e) {
            return reject(e);
        }
    });
});

module.exports.log = (metricName, metricData) => new Promise((
    resolve,
    reject
) => {
    const params = {
        Namespace: 'Assets',
        MetricData: [
            {
                MetricName: metricName,
                Value: metricData.uncompressed,
                Unit: 'Kilobytes',
                Dimensions: [
                    {
                        Name: 'Compression',
                        Value: 'None',
                    },
                ],
            },
            {
                MetricName: metricName,
                Value: metricData.compressed,
                Unit: 'Kilobytes',
                Dimensions: [
                    {
                        Name: 'Compression',
                        Value: 'GZip',
                    },
                ],
            },
        ],
    };
    if (metricData.rules) {
        params.MetricData.push({
            MetricName: metricName,
            Value: metricData.rules,
            Unit: 'Count',
            Dimensions: [
                {
                    Name: 'Metric',
                    Value: 'Rules',
                },
            ],
        });
    }

    if (metricData.totalSelectors) {
        params.MetricData.push({
            MetricName: metricName,
            Value: metricData.totalSelectors,
            Unit: 'Count',
            Dimensions: [
                {
                    Name: 'Metric',
                    Value: 'Total Selectors',
                },
            ],
        });
    }

    if (metricData.averageSelectors) {
        params.MetricData.push({
            MetricName: metricName,
            Value: metricData.averageSelectors,
            Unit: 'Count',
            Dimensions: [
                {
                    Name: 'Metric',
                    Value: 'Average Selectors',
                },
            ],
        });
    }

    cloudwatch.putMetricData(params, (err, data) => {
        if (err) {
            return reject(
                new Error(`Failed to log metrics to cloudwatch: ${err}`)
            );
        }
        return resolve({
            file: metricName,
            id: data.ResponseMetadata.RequestId,
        });
    });
});
