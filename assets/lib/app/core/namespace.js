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
