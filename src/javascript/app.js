'use strict';

var urlRoot;

if ('undefined' === typeof urlRoot) {
    urlRoot = '';
}

var spids = angular.module('spids', [
    'ngRoute',
    'ui.bootstrap'
]);

spids.constant('URL_ROOT', urlRoot);

spids.config([
    '$routeProvider',
    '$locationProvider',
    'URL_ROOT',
    function (
        $routeProvider,
        $locationProvider,
        urlRoot
    ) {

        $locationProvider.html5Mode(true);

        $routeProvider
            .when(urlRoot + '/changed', {
                templateUrl: 'javascript/modules/changed/index.html',
                controller: 'ChangedController'
            })
            .when(urlRoot + '/post', {
                templateUrl: 'javascript/modules/post/index.html',
                controller: 'PostController'
            })
            .otherwise({
                redirectTo: urlRoot + '/post'
            });
    }
]);