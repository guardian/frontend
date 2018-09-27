const path = require('path');
const fs = require('fs');

const { vendor, src } = require('../../config').paths;

const vendorlistJson = path.join(vendor, 'data/cmp_vendorlist.json');
const vendorlistJs = path.join(
    src,
    'javascripts/projects/commercial/modules/cmp/vendorlist.js'
);

module.exports = {
    description: 'Transforming data files',
    task: () =>
        new Promise(resolve => {
            // flowlint-next-line import/no-dynamic-require:off
            const rawdata = fs.readFileSync(vendorlistJson);
            const vendorList = JSON.parse(rawdata);
            return resolve(vendorList);
        })
            .then(vendorList => {
                // Do the massaging and shortening
                const shortVendors = {
                    version: vendorList.vendorListVersion,
                    purposeIDs: [],
                    purposesByVID: {},
                    legIntPurposesByVID: {},
                    featuresIdsByVID: {},
                };
                vendorList.purposes.forEach(purpose => {
                    shortVendors.purposeIDs.push(purpose.id);
                });

                vendorList.vendors.forEach(theVendor => {
                    shortVendors.purposesByVID[theVendor.id] =
                        theVendor.purposeIds;
                    shortVendors.legIntPurposesByVID[theVendor.id] =
                        theVendor.legIntPurposeIds;
                    shortVendors.featuresIdsByVID[theVendor.id] =
                        theVendor.featureIds;
                });
                return shortVendors;
            })
            .then(shortVendors => {
                const vendorListJsCode =
                    `// @flow\n` +
                    `/* eslint-disable */\n` +
                    `/* DO NOT EDIT THIS.\n` +
                    ` Regenerate by doing make compile-dev or make watch.\n` +
                    ` See tools/__tasks__/compile/data/transform.js  */\n` +
                    `export const shortVendorList = \n${JSON.stringify(
                        shortVendors
                    )};\n`;
                fs.writeFileSync(vendorlistJs, vendorListJsCode);
                return true;
            }),
};
