(function(_) {

    'use strict';

    angular
        .module('amc.core')
        .factory('common', common);

    common.$inject = [
        '$route'
        , '$q'
        , '$document'
        , '$window'
        , '$templateCache'
        , '$http'
        , '$location'
        , '$timeout'
        , '$cacheFactory'
        , 'logger'
        ];

    function common(
        $route
        , $q
        , $document
        , $window
        , $templateCache
        , $http
        , $location
        , $timeout
        , $cacheFactory
        , logger
        ) {

        String.prototype.toProperCase = function () {
            return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        };

        var service = {
            // common angular dependencies
              $q : $q
            , $document : $document
            , $window : $window
            , $templateCache : $templateCache
            , $http : $http
            , $location : $location
            , $route : $route
            , $cacheFactory : $cacheFactory
            , $timeout : $timeout
            , logger : logger
        };

        return service;
    }

})(_);
