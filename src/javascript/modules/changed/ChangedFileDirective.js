'use strict';

angular
    .module('spids')

    .directive('changedFile', [
        'ChangedService',
//        'URL_ROOT',
        function (ChangedService) { //$http, urlRoot) {

            function link($scope, $element) { //, $attrs) {
                $element.on('click', function() {
                    ChangedService.select($element.data('file'));

                    var currentlySelected = ChangedService.get();
                    $element.parent('ul').find('li').removeClass('active');
                    for (var i = 0; i < currentlySelected.length; i++) {
                        $element.parent('ul').find('li[data-file=\'' + currentlySelected[i] + '\']').addClass('active');
                    }
                });
            }
            return {
                restrict: 'A',
                link: link
            };
        }
    ]);