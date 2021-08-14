'use strict';

angular.module('app').config([
    '$routeProvider',
    function ($routeProvider) {
    $routeProvider
        .when("/", { // Home
            templateUrl: "app/partials/main.html", controller: "MainController"
        });
}]);
