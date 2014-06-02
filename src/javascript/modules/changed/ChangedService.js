'use strict';

angular
    .module('spids')

    .service('ChangedService', [
        function() {
            var selectedFiles = [];

            return {
                select: function(file) {
                    var index = selectedFiles.indexOf(file);

                    if (index >= 0) {
                        selectedFiles.splice(index, index+1);
                        return false;
                    }

                    if (selectedFiles.length > 1) {
                        selectedFiles.splice(selectedFiles.length-1, 1);
                    }

                    selectedFiles.push(file);
                    return true;
                },
                get: function() {
                    return selectedFiles;
                }
            };
        }
    ]);