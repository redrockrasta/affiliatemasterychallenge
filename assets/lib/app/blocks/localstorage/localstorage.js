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
