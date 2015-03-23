/* APPLICATION */

/* Core */
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


/* global toastr:false, moment:false */
(function ($) {
    'use strict';

    angular
        .module('amc.core')
        .constant('moment', moment)
})(jQuery);


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


(function(_) {
    'use strict';

    angular
        .module('amc.core')
        .factory('EventDispatcher', EventDispatcher);

    EventDispatcher.$inject = ['common'];

    function EventDispatcher (common) {

        var service = function () {
            this._listeners={}
        }

        service.prototype = {


            initlisteners : function (params) {
                var self = this
                if (!_.isArray(params)) return;

                _.each(params, function (p) {
                    self.addEventListener(p.event, p.cb);
                })
            },


            /**
            * Add a listener on the object
            * @param type : Event type
            * @param listener : Listener callback
            */
            addEventListener:function(type, listener){
                this._listeners[type] = this._listeners[type] || [];
                if(this._listeners[type]){
                    var index = this._listeners[type].indexOf(listener);

                    if(index===-1){
                        this._listeners[type].push(listener);
                    }
                }
            },


            /**
            * Remove a listener on the object
            * @param type : Event type
            * @param listener : Listener callback
            */
            removeEventListener:function(type, listener){
              if(this._listeners[type]){
                var index = this._listeners[type].indexOf(listener);

                if(index!==-1){
                    this._listeners[type].splice(index,1);
                }
              }
            },

            // Retrieve the list of event handlers for a given type.
            _getListeners: function(type) {
                if (this._listeners.hasOwnProperty(type)) {
                    return this._listeners[type];
                }

                return [];
            },


            /**
            * Dispatch an event to all registered listener
            * @param Mutiple params available, first must be string
            */
            dispatchEvent:function(type){
                var listeners;

                var args = [],
                listeners = this._getListeners(type);
                Array.prototype.push.apply(args, arguments);
                args = args.slice(1);

                for (var i = 0; i < listeners.length; i += 1) {
                    listeners[i].apply(null, args);
                }
            }
        }

        return service;

        /////////////////////////////////////////


    }


})(_);


(function(_) {
    'use strict';

    angular
        .module('amc.core')
        .factory('nspace', Namespace);

    Namespace.$inject = ['common'];

    function Namespace (common) {

        var _ns = 'AMC';
        //register namespace to window
        common.$window.AMC || (common.$window.AMC = {});

        var ns = function(namespaces){

            var names = (_.isEmpty(namespaces)) ? [] : namespaces.split('.');
            var namespace  = common.$window.AMC;
            var name  = null;
            var i     = null;

            for(i in names){
                name = names[i];

                if(namespace[name]===undefined){
                namespace[name] = {};
                }

                namespace = namespace[name];
            }

            return namespace;
        }

        return ns;
    }

})(_);



// Include in index.html so that app level exceptions are handled.
// Exclude from testRunner.html which should run exactly what it wants to run
(function() {
    'use strict';

    angular
        .module('blocks.exception')
        .provider('exceptionConfig', exceptionConfigProvider)
        .config(['$provide', exceptionConfig]);

    // Must configure the service and set its
    // events via the exceptionConfigProvider
    function exceptionConfigProvider() {
        /* jshint validthis:true */
        this.config = {
            // These are the properties we need to set
            appErrorPrefix: 'sc'
        };

        this.$get = function() {
            return {
                config: this.config
            };
        };
    }

    // Configure by setting an optional string value for appErrorPrefix.
    // Accessible via config.appErrorPrefix (via config value).
    function exceptionConfig($provide) {
        $provide.decorator('$exceptionHandler', ['$delegate', 'exceptionConfig', 'logger', extendExceptionHandler]);
    }

    // Extend the $exceptionHandler service to also display a toast.
    function extendExceptionHandler($delegate, exceptionConfig, logger) {
        var appErrorPrefix = exceptionConfig.config.appErrorPrefix || '';
        return function(exception, cause) {
            $delegate(exception, cause);
            var errorData = {exception: exception, cause: cause};
            var msg = appErrorPrefix + exception.message;
            /**
             * Could add the error to a service's collection,
             * add errors to $rootScope, log errors to remote web server,
             * or log locally. Or throw hard. It is entirely up to you.
             * throw exception;
             *
             * @example
             *     throw { message: 'error message we added' };
             *
             */
            logger.error(msg, errorData);
        };
    }

})();


(function() {
    'use strict';

    angular
        .module('blocks.exception')
        .factory('exception', exception);

    exception.$inject = ['logger'];
    function exception(logger) {
        var service = {
            catcher: catcher
        };
        return service;

        function catcher(message) {
            return function(reason) {
                logger.error(message, reason);
            };
        }
    }
})();


(function() {
    'use strict';

    angular
        .module('blocks.logger')
        .factory('logger', logger);

    logger.$inject = ['$log'];

    function logger($log) {
        var service = {
            showToasts: true,

            error   : error,
            info    : info,
            success : success,
            warning : warning,

            // straight to console; bypass toastr
            log     : $log.log
        };

        return service;
        /////////////////////

        function error(message, data, title) {
            title = title || 'Error';
            $log.error('Error: ' + message, data);
            //Bugsnag.notify(title, message, {}, "error");
        }

        function info(message, data, title) {
            title = title || 'Info';
            $log.info('Info: ' + message, data);
            //Bugsnag.notify(title, message, {}, "info");
        }

        function success(message, data, title) {
            $log.info('Success: ' + message, data);
        }

        function warning(message, data, title) {
            title = title || 'Warning';
            $log.warn('Warning: ' + message, data);
            //Bugsnag.notify(title, message, {}, "warning");
        }
    }
}());


(function() {
    'use strict';

    angular
        .module('blocks.router')
        .provider('routehelperConfig', routehelperConfig)
        .factory('routehelper', routehelper);

    routehelper.$inject = ['$location', '$rootScope', '$route', 'logger', 'routehelperConfig'];

    // Must configure via the routehelperConfigProvider
    function routehelperConfig() {
        /* jshint validthis:true */
        this.config = {
            // These are the properties we need to set
            // $routeProvider: undefined
            // docTitle: ''
            // resolveAlways: {ready: function(){ } }
        };

        this.$get = function() {
            return {
                config: this.config
            };
        };
    }

    function routehelper($location, $rootScope, $route, logger, routehelperConfig) {
        var handlingRouteChangeError = false;
        var routeCounts = {
            errors: 0,
            changes: 0
        };
        var routes = [];
        var $routeProvider = routehelperConfig.config.$routeProvider;
        var $controllerProvider = routehelperConfig.config.$controllerProvider;
        var $stateProvider = routehelperConfig.config.$stateProvider;
        var $urlRouterProvider = routehelperConfig.config.$urlRouterProvider;

        var service = {
            configureRoutes: configureRoutes,
            getRoutes: getRoutes,
            routeCounts: routeCounts
        };

        init();

        return service;
        ///////////////

        function configureRoutes(routes) {

            routes.forEach(function(route) {
                route.config.resolve =
                    angular.extend(route.config.resolve || {}, routehelperConfig.config.resolveAlways);
                $routeProvider.when(route.url, route.config);
            });

            $routeProvider.otherwise({redirectTo: '/'});
            $controllerProvider.allowGlobals();

        }

        function handleRoutingErrors() {
            // Route cancellation:
            // On routing error, go to the dashboard.
            // Provide an exit clause if it tries to do it twice.
            $rootScope.$on('$routeChangeError',
                function(event, current, previous, rejection) {
                    if (handlingRouteChangeError) {
                        return;
                    }
                    routeCounts.errors++;
                    handlingRouteChangeError = true;
                    var destination = (current && (current.title || current.name || current.loadedTemplateUrl)) ||
                        'unknown target';
                    var msg = 'Error routing to ' + destination + '. ' + (rejection.msg || '');
                    logger.warning(msg, [current]);
                    $location.url('/');
                }
            );
        }

        function init() {
            handleRoutingErrors();
            updateDocTitle();
        }

        function getRoutes() {
            for (var prop in $route.routes) {
                if ($route.routes.hasOwnProperty(prop)) {
                    var route = $route.routes[prop];
                    var isRoute = !!route.title;
                    if (isRoute) {
                        routes.push(route);
                    }
                }
            }
            return routes;
        }

        function updateDocTitle() {
            $rootScope.$on('$routeChangeSuccess',
                function(event, current, previous) {
                    routeCounts.changes++;
                    handlingRouteChangeError = false;
                    var title = routehelperConfig.config.docTitle + ' ' + (current.title || '');
                    $rootScope.title = title; // data bind to <title>
                }
            );
        }
    }
})();


(function(_lf, _) {
    'use strict';

    angular
        .module('blocks.localstorage')
        .factory('localstore', localstore);

        localstore.$inject = ['nspace'];

    function localstore(ns) {
        var service = {
              get : get
            , set : set
            , remove : remove
        };

        return service;
        /////////////////////

        function get (key) {
            return _lf.getItem(key).then(function(item) {

                if(!item || new Date().getTime() > (item.timestamp + item.expireTimeInMilliseconds)) {
                    return null
                } else {
                    return item.data
                }
            })
        }


        function set (key , value, expireTimeInSeconds) {
            expireTimeInSeconds = expireTimeInSeconds || ns('settings.storageExp');
            expireTimeInSeconds = (expireTimeInSeconds == 0) ? 123456789 : expireTimeInSeconds;
            return _lf.setItem(key, {
                data: value,
                timestamp: new Date().getTime(),
                expireTimeInMilliseconds: expireTimeInSeconds * 1000
            });
        }

        function remove (key) {
            return _lf.removeItem(key);
        }
    }
}(localforage, _));


(function() {
    'use strict';

    angular
        .module('blocks.encryptor')
        .factory('encryptor', encryptor);

    function encryptor() {
        var service = {
            md5: md5
        };

        return service;

        /////////////////////////////////////////////////

        /*
        * Add integers, wrapping at 2^32. This uses 16-bit operations internally
        * to work around bugs in some JS interpreters.
        */
        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        /*
        * Bitwise rotate a 32-bit number to the left.
        */
        function bit_rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        /*
        * These functions implement the four basic operations the algorithm uses.
        */
        function md5_cmn(q, a, b, x, s, t) {
            return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
        }
        function md5_ff(a, b, c, d, x, s, t) {
            return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }
        function md5_gg(a, b, c, d, x, s, t) {
            return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }
        function md5_hh(a, b, c, d, x, s, t) {
            return md5_cmn(b ^ c ^ d, a, b, x, s, t);
        }
        function md5_ii(a, b, c, d, x, s, t) {
            return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        /*
        * Calculate the MD5 of an array of little-endian words, and a bit length.
        */
        function binl_md5(x, len) {
            /* append padding */
            x[len >> 5] |= 0x80 << (len % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            var i, olda, oldb, oldc, oldd,
                a =  1732584193,
                b = -271733879,
                c = -1732584194,
                d =  271733878;

            for (i = 0; i < x.length; i += 16) {
                olda = a;
                oldb = b;
                oldc = c;
                oldd = d;

                a = md5_ff(a, b, c, d, x[i],       7, -680876936);
                d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
                c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
                b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
                a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
                d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
                c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
                b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
                a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
                d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
                c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
                d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

                a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
                d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
                c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
                b = md5_gg(b, c, d, a, x[i],      20, -373897302);
                a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
                d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
                c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
                a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
                d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
                c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
                b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
                a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
                d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
                c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
                b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

                a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
                d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
                c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
                b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
                d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
                c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
                b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
                d = md5_hh(d, a, b, c, x[i],      11, -358537222);
                c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
                b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
                a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
                d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
                b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

                a = md5_ii(a, b, c, d, x[i],       6, -198630844);
                d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
                c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
                a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
                d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
                c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
                a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
                d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
                b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
                a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
                d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
                b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

                a = safe_add(a, olda);
                b = safe_add(b, oldb);
                c = safe_add(c, oldc);
                d = safe_add(d, oldd);
            }
            return [a, b, c, d];
        }

        /*
        * Convert an array of little-endian words to a string
        */
        function binl2rstr(input) {
            var i,
                output = '';
            for (i = 0; i < input.length * 32; i += 8) {
                output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
            }
            return output;
        }

        /*
        * Convert a raw string to an array of little-endian words
        * Characters >255 have their high-byte silently ignored.
        */
        function rstr2binl(input) {
            var i,
                output = [];
            output[(input.length >> 2) - 1] = undefined;
            for (i = 0; i < output.length; i += 1) {
                output[i] = 0;
            }
            for (i = 0; i < input.length * 8; i += 8) {
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
            }
            return output;
        }

        /*
        * Calculate the MD5 of a raw string
        */
        function rstr_md5(s) {
            return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
        }

        /*
        * Calculate the HMAC-MD5, of a key and some data (raw strings)
        */
        function rstr_hmac_md5(key, data) {
            var i,
                bkey = rstr2binl(key),
                ipad = [],
                opad = [],
                hash;
            ipad[15] = opad[15] = undefined;
            if (bkey.length > 16) {
                bkey = binl_md5(bkey, key.length * 8);
            }
            for (i = 0; i < 16; i += 1) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }
            hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
            return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
        }

        /*
        * Convert a raw string to a hex string
        */
        function rstr2hex(input) {
            var hex_tab = '0123456789abcdef',
                output = '',
                x,
                i;
            for (i = 0; i < input.length; i += 1) {
                x = input.charCodeAt(i);
                output += hex_tab.charAt((x >>> 4) & 0x0F) +
                    hex_tab.charAt(x & 0x0F);
            }
            return output;
        }

        /*
        * Encode a string as utf-8
        */
        function str2rstr_utf8(input) {
            return unescape(encodeURIComponent(input));
        }

        /*
        * Take string arguments and return either raw or hex encoded strings
        */
        function raw_md5(s) {
            return rstr_md5(str2rstr_utf8(s));
        }
        function hex_md5(s) {
            return rstr2hex(raw_md5(s));
        }
        function raw_hmac_md5(k, d) {
            return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
        }
        function hex_hmac_md5(k, d) {
            return rstr2hex(raw_hmac_md5(k, d));
        }

        function md5(string, key, raw) {
            if (!key) {
                if (!raw) {
                    return hex_md5(string);
                }
                return raw_md5(string);
            }
            if (!raw) {
                return hex_hmac_md5(key, string);
            }
            return raw_hmac_md5(key, string);
        }
    }
}());





(function (_) {
    'use strict';

    angular
        .module('amc.vids')
        .controller('VidsController',
            ['$scope', 'common', 'nspace', Vids]);

        function Vids ($scope, common, ns) {

            var Constructor = function () {
                var d = common.$route.current.locals.init.data;
                this.data = d.data;
                this.limit = d.limit;
                this.page = d.page;
                this.pages = d.pages;
                this.total = d.total;
            }

            $scope.videos =  new Constructor

        }


})(_);





(function (_) {
    'use strict';

    angular
        .module('amc.vids')
        .controller('WatchController',
            ['$scope', 'common', 'nspace', '$sce', Watch]);

        function Watch ($scope, common, ns, $sce) {
            var Constructor = function () {
                this.id = common.$route.current.params.id
                var v = _.findWhere(ns('videoData'), { id : parseInt(this.id) });
                if (typeof v != 'undefined') {
                    this.url =  $sce.trustAsResourceUrl(v.url);
                    this.data = v;
                } else {
                    common.$location.url('/');
                }
            }

            $scope.video =  new Constructor

        }


})(_);




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




