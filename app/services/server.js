'use strict';

const configGoogleSheetId = '1NoSg0Sj_ZCcoYfZXMGxP0hcvFtipKUGZ5r0e6xPMrX0'
const sheets = [
  'Groups',
  'Activities',
  'Baselines',
  'Result Interpretation',
  'Settings'
]

angular.module('app').factory('ServerService', ['$http', 'UiBasicService', '$q', 'Papa', function($http, $uiBasic, $q, $papa) {
    return {
        loadData: function() {
            return $q(function (resolve, reject) {
                Promise.all(sheets.map(function(sheet) {
                  return new Promise(function(resolve, reject) {
                    const url = `https://docs.google.com/spreadsheets/d/${configGoogleSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURI(sheet)}&headers=1`
                    console.log(`Downloading sheet ${sheet} from ${url}`)


                    $papa.parse(url, {
                      download: true,
                      header: true,
                      transformHeader:function(h) {
                        return h.replace(/[^a-zA-Z0-9]/g, '') // remove special characters
                          .toLowerCase()//.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()) // to camel case
                      },
                      complete: function(results) {
                        var data = results.data
                        resolve(data)
                      }
                    })
                  })
                })
              ).then(function(results) {
                const resultsMap = sheets.reduce(function(s, sheet, i) {
                  s[sheet] = results[i]
                  return s
                }, {})

                resolve(resultsMap)
              }).catch(reject)
            });
        }
    };
}]);
