'use strict';

angular.module('app').factory('UiBasicService', ['$mdToast', function($mdToast) {
    return {
        message: function(msg) {
            $mdToast.show(
              $mdToast.simple()
                .content(msg)
                .position('bottom right')
                .hideDelay(3000)
            );
        }
    };
}]);