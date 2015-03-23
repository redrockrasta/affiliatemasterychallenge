(function(_) {
    'use strict';

    angular
        .module('amc.services')
        .factory('ajaxServices', ['common', '$http', ajaxServices]);

        function ajaxServices (common, $http) {
            var apiUrl = 'api.php';
            //var apiUrl = 'http://dev.affiliatemasterychallenge.com/video';
            // instantiate our initial object
            var aservices = function(params) {
                this.p = {
                      week_id : 1
                    , day_id : 1
                    , page : 1
                };
                _.extend(this.p, params);
            };

            // define the getProfile method which will fetch data
            // from API and *returns* a promise
            aservices.prototype = {
                get : get
            }


            return aservices;

            ///////////////////////////////////////////////////////


            function get () {

                var self = this;

                return $http.get(apiUrl + '?week_id=' + this.p.week_id + '&day_id=' + this.p.day_id + '&page=' + this.p.page)
                .then(function(response) {
                    return response;
                });
            }
        }

})(_);


