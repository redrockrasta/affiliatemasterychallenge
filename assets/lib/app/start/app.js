
(function() {
    'use strict';

    /* MODULE INITIALIZATION */


    angular.module('blocks.exception', ['blocks.logger']);
    angular.module('blocks.logger', []);
    angular.module('blocks.localstorage', []);
    angular.module('blocks.encryptor', []);
    angular.module('blocks.router', ['ngRoute', 'blocks.logger']);

    angular.module('amc.data', []);
    angular.module('amc.services', []);
    angular.module('amc.vids', []);

    angular.module('amc.core', [
          'ng'
        , 'ngRoute'
        , 'ui.router'
        , 'ngSanitize'


        /*
         * Our reusable cross amc code modules
         */
        , 'blocks.exception'
        , 'blocks.logger'
        , 'blocks.router'
        , 'blocks.localstorage'
        , 'blocks.encryptor'

        , 'amc.vidsTemplate'

        /* Third Party Modules*/
        , 'ngProgress'
        , 'angularMoment'

    ]);

    /* Main module Declaration */
    angular.module('amc', [
          'amc.core'
        , 'amc.data'
        , 'amc.services'

          /* FEATURE MODULES */
        , 'amc.vids'
    ]);

})();
