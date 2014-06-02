'use strict';

angular
    .module('spids')

    .controller('PostController', [
        '$scope',
        '$http',
        '$q',
        'URL_ROOT',
        'PostService',
        function ($scope, $http, $q, urlRoot, PostService) {
            jQuery('#container').removeClass('changed').addClass('post');

            $scope.archive = null;
            $scope.archives = [];
            $scope.summary = {};

            $scope.load = function(index, seek) {
                var deferred = $q.defer();
                var $pre = jQuery('#file-'+index);
                if ('' === $pre.text().trim()) {
                    PostService.load(index, seek).then(function() {
                        $pre.toggle();
                        deferred.resolve();
                    });
                } else {
                    $pre.toggle();
                    deferred.resolve();
                }

                return deferred.promise;
            };

            $scope.repeatedLoad = function(index) {
                PostService.repeatedLoad(index);
            };

            $scope.repeatedCalculateDanger = function(index) {
                PostService.repeatedCalculateDanger(index).then(function(total) {
                    $scope.summary = total;
                });
            };

            $http({
                method: 'GET',
                url: urlRoot + '/spids/public/post'
            }).
                success(function (data) { // , status, headers, config
                    // this callback will be called asynchronously
                    // when the response is available
                    $scope.archives = data;
                    var d = new Date('1970-01-01T00:00:00+00:00');
                    var selected = null;
                    for (var i = 0; i < data.length; i++) {
                        var d2 = new Date(data[i].mtime);
                        if (d.getTime() < d2.getTime()) {
                            d = d2;
                            selected = data[i].name;
                        }
                    }
                    $scope.archive = selected;
                }).
                error(function () {
                    console.error('error receiving changed files');
                });
        }
    ]);