'use strict';

angular.module('app').factory('ServerService', ['$http', 'UiBasicService', '$q', 'Tabletop', function($http, $uiBasic, $q, $tabletop) {
    return {
        loadData: function() {
            return $q(function (resolve, reject) {
                $tabletop.then(function(data) {
                    resolve(data[1]);
                });
            });
        }
        
        /*listPersons: function (success, error) {
            $http.get('api/person/list.php').
                success(function(data, status, headers, config) {
                    if (angular.isFunction(success))
                        success(data, status, headers, config);
                }).
                error(function(data, status, headers, config) {
                  $uiBasic.message('Error: ' + data.message);
                  if (angular.isFunction(error))
                    error(data, status, headers, config);
                }); 
        },
        
        listOsaSessions: function (personId, success, error) {
            $http.get('api/osa_session/list.php?person_id=' + personId).
                success(function(data, status, headers, config) {
                    if (angular.isFunction(success))
                        success(data, status, headers, config);
                }).
                error(function(data, status, headers, config) {
                  $uiBasic.message('Error: ' + data.message);
                  if (angular.isFunction(error))
                    error(data, status, headers, config);
                }); 
        },
        
        getOsaSessionData: function (resultSessionId, from, success, error) {
            var url = 'api/osa_session_data/get.php?session_id=' + resultSessionId;
            if (angular.isDefined(from) && from != null)
                url += '&from=' + from;
                
            
            $http.get(url).
                success(function(data, status, headers, config) {
                    if (angular.isFunction(success))
                        success(data, status, headers, config);
                }).
                error(function(data, status, headers, config) {
                  $uiBasic.message('Error: ' + data.message);
                  if (angular.isFunction(error))
                    error(data, status, headers, config);
                }); 
        }*/
    };
}]);