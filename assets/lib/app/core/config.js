(function() {
    'use strict';

    var core = angular.module('amc.core');

    core.config(configure);

    configure.$inject = [
        '$logProvider', '$routeProvider', '$controllerProvider',
        'exceptionConfigProvider', 'routehelperConfigProvider', '$locationProvider', '$stateProvider', '$urlRouterProvider'
    ];

    /* @ngInject */
    function configure(
        $logProvider, $routeProvider, $controllerProvider,
        exceptionConfigProvider, routehelperConfigProvider, $locationProvider, $stateProvider, $urlRouterProvider) {

        configureLogging();
        configureExceptions();
        configureRouting();

        function configureLogging() {
            // turn debugging off/on (no info or warn)
            if ($logProvider.debugEnabled) {
                $logProvider.debugEnabled(true);
            }
        }

        function configureExceptions() {
            exceptionConfigProvider.config.appErrorPrefix = '[AMC Error] ';
        }

        function configureRouting() {
            /*$locationProvider.html5Mode({
              enabled: true,
              requireBase: false
            });*/

            var routeCfg = routehelperConfigProvider;
            routeCfg.config.$stateProvider = $stateProvider;
            routeCfg.config.$urlRouterProvider = $urlRouterProvider;
            routeCfg.config.$routeProvider = $routeProvider;
            routeCfg.config.$controllerProvider = $controllerProvider;
            routeCfg.config.docTitle = 'AMC: ';
            routeCfg.config.resolveAlways = { /* @ngInject */

            };
        }
    }
})();
