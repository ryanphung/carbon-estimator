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
    };
}]);