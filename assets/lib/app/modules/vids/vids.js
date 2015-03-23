
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


