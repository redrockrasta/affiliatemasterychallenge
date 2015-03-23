(function() {
    'use strict';

    angular
        .module('amc.data')
        .factory('amc.vids.init', ['common', 'ajaxServices', 'nspace', VidsInitializer]);

        function VidsInitializer (common, ajaxServices, ns) {
            var $q = common.$q;
            var defer = $q.defer();
            return {
                loadapp : loadapplication
            }

            function loadapplication (argument) {

                var ajax = new ajaxServices();
                ajax.get().then(function (response) {
                    ns().videoData = response.data.data.data;
                    defer.resolve(response.data);
                });

                return defer.promise;
            }
        }

})();
