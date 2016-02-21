'use strict';

angular.module('app').config([
    '$routeProvider', 'TabletopProvider',
    function ($routeProvider, $tabletopProvider) {    
    $tabletopProvider.setTabletopOptions({
        key: "https://docs.google.com/spreadsheets/d/18k_xx-K2UyOLkZUz3C-qf840aNaab1B6xElDdszeMS8/pubhtml",
        prettyColumnNames: false,
        parseNumbers: true
    });
    
    $routeProvider
        .when("/", { // Home
            templateUrl: "app/partials/main.html", controller: "MainController"
        });
}]);