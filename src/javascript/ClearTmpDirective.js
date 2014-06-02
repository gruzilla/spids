'use strict';

angular
    .module('spids')

    .directive('clearTmp', [
        '$http',
        'URL_ROOT',
        function ($http, urlRoot) {

            function link($scope, $element) { //, $attrs) {
                $element.on('click', function() {
                    $http({
                        method: 'GET',
                        url: urlRoot + '/spids/public/cleartmp'
                    }).
                        success(function () { // , status, headers, config
                            console.debug('cache cleared');
                        }).
                        error(function () {
                            console.error('error clearing cache');
                        });

                });
            }
            return {
                restrict: 'A',
                link: link
            };
        }
    ]);
