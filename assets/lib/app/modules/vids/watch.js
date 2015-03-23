
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


