const path = require('path');
const fs = require('fs');
const cpy = require('cpy');

const { vendor, src, target } = require('../../config').paths;

// Sources
const currentVendorListJSON = path.join(vendor, 'data/cmp_vendorlist.json');

// Destinations

// The backed-in shortlist
const vendorListJsCode = path.join(
    src,
    'javascripts/projects/commercial/modules/cmp/vendorlist.js'
);

// The static assets
const fullVendorListJSONStaticDir = path.resolve(target, 'data', 'vendor');
const shortVendorListJSONStatic = path.join(
    path.resolve(target, 'data', 'vendor'),
    'cmp_shortvendorlist.json'
);

module.exports = {
    description: 'Transforming data files',
    task: () =>
        new Promise(resolve => {
            // Import the original vendor list.
            // flowlint-next-line import/no-dynamic-require:off
            const rawdata = fs.readFileSync(currentVendorListJSON);
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
                // Write the files
                const shortJSON = JSON.stringify(shortVendors);
                const jsCode =
                    `// @flow\n` +
                    `/* eslint-disable */\n` +
                    `/* DO NOT EDIT THIS.\n` +
                    ` Regenerate by doing 'make compile', 'make compile-dev' or 'make watch'.\n` +
                    ` See tools/__tasks__/compile/data/aib_cmp.js  */\n` +
                    `export const shortVendorList = \n${shortJSON};\n`;
                fs.writeFileSync(vendorListJsCode, jsCode);

                return cpy(currentVendorListJSON, fullVendorListJSONStaticDir, {
                    parents: false,
                    nodir: false,
                }).then(() => {
                    fs.writeFileSync(shortVendorListJSONStatic, shortJSON);
                });
            }),
};
