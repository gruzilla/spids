'use strict';

angular
    .module('spids')

    .service('PostService', [
        '$http',
        'URL_ROOT',
        '$q',
        function($http, urlRoot, $q) {
            var requestFiles = [];
            var currentArchive = null;
            var dangerSteps = 10;


            function select(archive) {
                requestFiles = [];
                currentArchive = archive;

                var deferred = $q.defer();

                $http({
                    method: 'POST',
                    url: urlRoot + '/spids/public/postFiles',
                    data: {
                        archive: archive
                    }
                }).
                    success(function (data) { // , status, headers, config
                        requestFiles = data;
                        jQuery('button.load-additional').attr('disabled', null);

                        deferred.resolve(requestFiles);
                    }).
                    error(function () {
                        console.error('error receiving post requests');

                        deferred.reject('error receiving post requests');
                    });

                return deferred.promise;
            }

            function calculateDanger($rows, seeks) {
                var deferred = $q.defer();

                $http({
                    method: 'POST',
                    url: urlRoot + '/spids/public/calcDanger',
                    data: {
                        archive: currentArchive,
                        seeks: seeks
                    }
                }).
                    success(function (data) { // , status, headers, config

                        var summary = {};

                        // iterate rows
                        for (var i = 0; i < data.length; i++) {
                            // iterate dangers
                            var level = '';
                            for (var d = 0; d < data[i].length; d++) {
                                if (!data[i][d] || !data[i][d].name) {
                                    continue;
                                }
                                if ('danger' !== level && level !== data[i][d].level) {
                                    level = data[i][d].level;

                                    $rows[i].addClass(level);
                                }

                                var prevt = $rows[i].attr('title');
                                if (!prevt || 'undefined' === prevt) {
                                    prevt = '';
                                } else {
                                    prevt += ' ';
                                }
                                $rows[i].attr('title', prevt + data[i][d].name);

                                if ('undefined' === typeof summary[data[i][d].name]) {
                                    summary[data[i][d].name] = {
                                        level: '',
                                        amount: 0
                                    };
                                }
                                summary[data[i][d].name].level = level;
                                summary[data[i][d].name].amount++;
                            }
                        }

                        deferred.resolve(summary);
                    }).
                    error(function () {
                        console.error('error receiving danger levels');

                        deferred.reject('error receiving danger levels');
                    });

                return deferred.promise;
            }

            function repeatedCalculateDanger(index, deferred, total) {

                if ('undefined' === typeof deferred) {
                    deferred = $q.defer();
                }
                if ('undefined' === typeof total) {
                    total = {};
                }
                var seeks = [];
                var $rows = [];
                for (var i = index; i < index + dangerSteps; i++) {

                    var $tr = jQuery('tbody tr:eq(' + i + ')');
                    $rows.push($tr);

                    if (0 === $tr.length) {
                        continue;
                    }

                    seeks.push(
                        $tr.data('seek')
                    );
                }

                var $progress = jQuery('#progress');
                var $buttons = jQuery('button.load-additional');

                if (0 === seeks.length) {
                    $progress.hide();
                    $buttons.attr('disabled', null);
                    jQuery('.collapse').collapse('show');

                    deferred.resolve(total);

                    return deferred.promise;
                }

                $buttons.attr('disabled', 'disabled');
                var rowsAmount = jQuery('tbody tr').length;
                var value = Math.ceil(index / rowsAmount * 100);
                $progress.show().find('.progress-bar')
                    .attr('aria-valuenow', value)
                    .css({width: value + '%'})
                    .find('span').html(value + '%');

                calculateDanger($rows, seeks).then(function(summary) {
                    for (var i in summary) {
                        if (summary.hasOwnProperty(i)) {
                            if ('undefined' !== typeof total[i]) {
                                total[i].level = summary[i].level;
                                total[i].amount += summary[i].amount;
                            } else {
                                total[i] = summary[i];
                            }
                        }
                    }
                    repeatedCalculateDanger(index + dangerSteps, deferred, total);
                });

                return deferred.promise;
            }

            function repeatedLoad(index) {

                var deferred = $q.defer();
                var $progress = jQuery('#progress');
                var $buttons = jQuery('button.load-additional');

                var $tr = jQuery('tbody tr:eq(' + index + ')');
                if (0 === $tr.length) {
                    $progress.hide();
                    $buttons.attr('disabled', null);

                    deferred.resolve();

                    return deferred.promise;
                }

                $buttons.attr('disabled', 'disabled');
                var rowsAmount = jQuery('tbody tr').length;
                var value = Math.ceil(index / rowsAmount * 100);
                $progress.show().find('.progress-bar')
                    .attr('aria-valuenow', value)
                    .css({width: value + '%'})
                    .find('span').html(value + '%');

                load(index, $tr.data('seek')).then(function() {
                    repeatedLoad(index + 1);
                });

                return deferred.promise;
            }

            function load(index, seek) {

                var deferred = $q.defer();
                $http({
                    method: 'POST',
                    url: urlRoot + '/spids/public/load',
                    data: {
                        archive: currentArchive,
                        seek: seek
                    }
                }).
                    success(function (data) { // , status, headers, config
                        jQuery('#file-' + index).text(data);
                        deferred.resolve();
                    }).
                    error(function () {
                        console.error('error receiving request data');
                        deferred.reject('Error receiving request data');
                    });

                return deferred.promise;
            }

            return {
                select: select,
                calculateDanger: calculateDanger,
                load: load,
                repeatedLoad: repeatedLoad,
                repeatedCalculateDanger: repeatedCalculateDanger,
                get: function() {
                    return requestFiles;
                }
            };
        }
    ]);