const path = require('path');
const fs = require("fs");

const { vendor, src } = require('../../config').paths;

const vendorlistJson = path.join( vendor, 'data/cmp_vendorlist.json')
const vendorlistJs   = path.join( src , 'javascripts/projects/commercial/modules/cmp/vendorlist.js' )


module.exports = {
    description: 'Transforming data files',
    task: () =>
        new Promise(function(resolve, reject ){
            const vendorList = require( vendorlistJson )
            resolve( vendorList )
        }).then(function( vendorList ){
            // Do the massaging and shortening
            const shortVendors = { 
                version: vendorList.vendorListVersion,
                purposeIDs: [],
                purposesByVID: {},
                legIntPurposesByVID: {},
                featuresIdsByVID: {}
            };
            vendorList.purposes.map(function(purpose){
                shortVendors.purposeIDs.push( purpose.id );
            })

            vendorList.vendors.map(function(vendor){
                shortVendors.purposesByVID[vendor.id] = vendor.purposeIds;
                shortVendors.legIntPurposesByVID[vendor.id] = vendor.legIntPurposeIds;
                shortVendors.featuresIdsByVID[vendor.id] = vendor.featureIds;
            });
            return shortVendors;
        }).then(function( shortVendors ){
            const vendorListJsCode =
                  '/* DO NOT EDIT THIS. Generated at ' + new Date() + ' by '  + __filename + '\n' +
                  ' Regenerate by doing make compile-dev or make watch.\n' +
                  ' See tools/__tasks__/compile/data/transform.js  */\n' +
                  'export const shortVendorList = \n' + 
                  JSON.stringify(shortVendors) +
                  ';\n';
            fs.writeFileSync( vendorlistJs , vendorListJsCode );
            return true;
        })
};
