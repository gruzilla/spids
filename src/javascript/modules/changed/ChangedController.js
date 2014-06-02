'use strict';

angular
    .module('spids')

    .controller('ChangedController', [
        '$scope',
        'ChangedService',
        '$http',
        'URL_ROOT',
        function ($scope, ChangedService, $http, urlRoot) {
            jQuery('#container').removeClass('post').addClass('changed');

            $http({
                method: 'GET',
                url: urlRoot + '/spids/public/changed'
            }).
                success(function (data) { // , status, headers, config
                    // this callback will be called asynchronously
                    // when the response is available
                    $scope.files = data;
                    $scope.currentlySelected = ChangedService.get();
                    $scope.blocks = [];
                    $scope.summary = {};

                    $scope.compare = function () {
                        $scope.summary = {
                            added: {
                                level: '',
                                amount: 0
                            },
                            removed: {
                                level: '',
                                amount: 0
                            },
                            changed: {
                                level: '',
                                amount: 0
                            },
                            danger: {
                                level: 'danger',
                                amount: 0
                            }
                        };

                        $scope.currentlySelected = ChangedService.get();
                        var currentlySelected = ChangedService.get();
                        $http({
                            method: 'POST',
                            data: currentlySelected,
                            url: urlRoot + '/spids/public/compare'
                        }).
                            success(function (data) { // , status, headers, config
                                $scope.blocks = data;
                                for (var i = 0; i < data.length; i++) {
                                    switch (data[i].type) {
                                    case 'a':
                                        $scope.summary.added.amount++;
                                        break;
                                    case 'd':
                                        $scope.summary.removed.amount++;
                                        break;
                                    case 'c':
                                        $scope.summary.changed.amount++;
                                        break;
                                    }

                                    if (data[i].level && '' !== data[i].level) {
                                        $scope.summary[data[i].level].amount++;
                                    }
                                }

                                jQuery('.collapse').collapse('show');
                            }).
                            error(function () {
                                console.error('error receiving changed files');
                            });
                    };
                }).
                error(function () {
                    console.error('error receiving changed files');
                });
        }
    ]);