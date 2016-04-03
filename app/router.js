'use strict';

angular.module('app').config([
    '$routeProvider', 'TabletopProvider',
    function ($routeProvider, $tabletopProvider) {    
    $tabletopProvider.setTabletopOptions({
        key: "https://docs.google.com/spreadsheets/d/1NoSg0Sj_ZCcoYfZXMGxP0hcvFtipKUGZ5r0e6xPMrX0/pubhtml",
        prettyColumnNames: false,
        parseNumbers: true
    });
    
    $routeProvider
        .when("/", { // Home
            templateUrl: "app/partials/main.html", controller: "MainController"
        });
}]);
