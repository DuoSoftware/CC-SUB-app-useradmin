////////////////////////////////
// App : UserAdmin
// Owner  : Gihan Herath
// Last changed date : 2017/10/31
// Version : 6.1.0.3
// Modified By : Gihan
/////////////////////////////////

(function ()
{
    'use strict';

    angular
        .module('app.useradmin', [])
        .config(config)
        .filter('parseDate',parseDateFilter);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider, mesentitlementProvider)
    {

        $stateProvider
            .state('app.useradmin', {
                url    : '/useradmin',
                views  : {
                    'useradmin@app': {
                        templateUrl: 'app/main/useradmin/useradmin.html',
                        controller : 'UserAdminController as vm'
                    }
                },
                resolve: {
					security: ['$q','mesentitlement','$timeout','$rootScope','$state','$location', function($q,mesentitlement,$timeout,$rootScope,$state, $location){
						return $q(function(resolve, reject) {
							$timeout(function() {
								if (true) {
									resolve(function () {
										var entitledStatesReturn = mesentitlement.stateDepResolver('useradmin');

										mesentitlementProvider.setStateCheck("useradmin");

										if(entitledStatesReturn !== true){
											return $q.reject("unauthorized");
										}
									});
								} else {
									return $location.path('/guide');
								}
							});
						});
					}]
                },
                bodyClass: 'useradmin'
            });

        msNavigationServiceProvider.saveItem('useradmin', {
            title    : 'User Admin',
            state    : 'app.useradmin',
            weight   : 13
        });
    }

    function parseDateFilter(){
        return function(input){
            return new Date(input);
        };
    }
})();
