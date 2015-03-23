(function () {
    'use strict';

    angular
        .module('amc.vids')
        .run(['routehelper', '$templateCache', routeConfig]);

    function routeConfig(routehelper, $templateCache) {
        routehelper.configureRoutes(getRoutes($templateCache));
    }

    function getRoutes($templateCache) {
        return [
            {
                url: '/',
                config: {
                    controller : 'VidsController',
                    template : $templateCache.get('vids_tpl'),
                    reloadOnSearch : false,
                    resolve: {
                        init : ['amc.vids.init', function(ChatsInitializer) {
                                    return ChatsInitializer.loadapp();
                        }]
                    }
                }
            },

            {
                url: '/watch/:id',
                config: {
                    controller : 'WatchController',
                    template : $templateCache.get('video_tpl'),
                    reloadOnSearch : false
                    /*, resolve: {
                        init : ['amc.vids.init', function(ChatsInitializer) {
                                    return ChatsInitializer.loadapp();
                        }]
                    }*/
                }
            }
        ];
    }


})();
