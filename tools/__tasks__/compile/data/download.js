const path = require('path');
const fs = require('fs');
const request = require('request');
const chalk = require('chalk');

const warning = chalk.keyword('orange');

const { vendor } = require('../../config').paths;

// Sources
const vendorListOfficialUrl = 'https://vendorlist.consensu.org/vendorlist.json';
const fallbackVendorListJSON = path.join(
    vendor,
    'data/cmp_fallback_vendorlist.json'
);

// Destination
const currentVendorListJSON = path.join(vendor, 'data/cmp_vendorlist.json');

module.exports = {
    description: 'Downloading data files',
    task: () =>
        new Promise((resolve, reject) => {
            request(vendorListOfficialUrl, (error, response, body) => {
                if (error) {
                    return reject(
                        new Error(
                            `Error GETting '${vendorListOfficialUrl}': ${response}`
                        )
                    );
                }
                // Do some basic sanity check on the body
                let vendorList;
                try {
                    vendorList = JSON.parse(body);
                } catch (JSONerr) {
                    console.error(
                        warning(
                            `Body from GETting '${vendorListOfficialUrl}' is not valid JSON`
                        )
                    );
                    return reject(JSONerr);
                }

                if (!vendorList.vendorListVersion) {
                    console.error(
                        warning(
                            `Body from GETting '${vendorListOfficialUrl}' does not look like a vendorList`
                        )
                    );
                    return reject(new Error('Bad vendor list format'));
                }

                return resolve(body);
            });
        }).then(
            vendorsJSON => {
                fs.writeFileSync(currentVendorListJSON, vendorsJSON);
                return true;
            },
            () => {
                console.error(
                    warning(`\nFalling back to ${fallbackVendorListJSON}`)
                );
                fs.copyFileSync(fallbackVendorListJSON, currentVendorListJSON);
                return true;
            }
        ),
};
