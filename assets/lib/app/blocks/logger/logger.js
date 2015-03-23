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
