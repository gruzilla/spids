'use strict';

angular
    .module('spids')

    .directive('requests', [
        'PostService',
        function (PostService) { //$http, urlRoot) {

            function link($scope, $element) { //, $attrs) {
                $element.on('click', function() {
                    PostService.select($scope.archive).then(function(files) {
                        $scope.files = files;
                    });
                });
            }
            return {
                restrict: 'A',
                link: link
            };
        }
    ]);