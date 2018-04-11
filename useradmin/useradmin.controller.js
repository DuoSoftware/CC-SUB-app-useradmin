////////////////////////////////
// App : UserAdmin
// File : UserAdmin Controller
// Owner  : GihanHerath
// Last changed date : 2016/12/19
// Version : 6.0.0.10
/////////////////////////////////

(function ()
{
	'use strict';

	angular
		.module('app.useradmin')
		.controller('UserAdminController', UserAdminController);

	/** @ngInject */
	function UserAdminController($scope, $http, $state, $stateParams, notifications, $document, $timeout, $mdDialog, $mdMedia, $mdSidenav,$charge,$productHandler,$filter)
	{
		var vm = this;

		vm.appInnerState = "default";
		vm.pageTitle="Users";
		vm.checked = [];
		vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];

		vm.selectedInvoice = {};
		vm.toggleSidenav = toggleSidenav;

		vm.responsiveReadPane = undefined;
		vm.activeInvoicePaneIndex = 0;
		vm.dynamicHeight = false;

		vm.scrollPos = 0;
		vm.scrollEl = angular.element('#content');

		//vm.invoices = Invoice.data;
		//console.log(vm.invoices);
		//invoice data getter !
		//vm.selectedInvoice = vm.invoices[0];
		vm.selectedMailShowDetails = false;

		// Methods
		vm.checkAll = checkAll;
		vm.closeReadPane = closeReadPane;
		vm.addInvoice = toggleinnerView;
		vm.isChecked = isChecked;
		vm.selectInvoice = selectInvoice;
		vm.toggleStarred = toggleStarred;
		vm.toggleCheck = toggleCheck;
		vm.switchAdminPanel = switchAdminPanel;
		vm.updateShareStep = updateShareStep;

		var domain = getCurrentDomain();

		//////////

		// Watch screen size to activate responsive read pane
		$scope.$watch(function ()
		{
			return $mdMedia('gt-md');
		}, function (current)
		{
			vm.responsiveReadPane = !current;
		});

		// Watch screen size to activate dynamic height on tabs
		$scope.$watch(function ()
		{
			return $mdMedia('xs');
		}, function (current)
		{
			vm.dynamicHeight = current;
		});

		/**
		 * Select product
		 *
		 * @param product
		 */
		function selectInvoice(invoice,appid,appname)
		{
			$scope.share(appid,appname);

			$timeout(function ()
			{
				vm.activeInvoicePaneIndex = 1;

				// Store the current scrollPos
				vm.scrollPos = vm.scrollEl.scrollTop();

				// Scroll to the top
				vm.scrollEl.scrollTop(0);
			});
		}

		(function(){
			$http.get('app/core/cloudcharge/js/config.json').then(function (res) {
				$scope.configURL = res.data;
			}, function(res) {});
		})();

		/**
		 * Close read pane
		 */
		function closeReadPane()
		{
			vm.activeInvoicePaneIndex = 0;
			$scope.shareStepOneDone = false;
			$scope.activeShareStep = 0;

			$timeout(function ()
			{
				vm.scrollEl.scrollTop(vm.scrollPos);
			}, 650);
		}

		/**
		 * Toggle starred
		 *
		 * @param mail
		 * @param event
		 */
		function toggleStarred(mail, event)
		{
			event.stopPropagation();
			mail.starred = !mail.starred;
		}

		/**
		 * Toggle checked status of the mail
		 *
		 * @param invoice
		 * @param event
		 */
		function toggleCheck(invoice, event)
		{
			if ( event )
			{
				event.stopPropagation();
			}

			var idx = vm.checked.indexOf(invoice);

			if ( idx > -1 )
			{
				vm.checked.splice(idx, 1);
			}
			else
			{
				vm.checked.push(invoice);
			}
		}

		/**
		 * Return checked status of the invoice
		 *
		 * @param invoice
		 * @returns {boolean}
		 */
		function isChecked(invoice)
		{
			return vm.checked.indexOf(invoice) > -1;
		}

		/**
		 * Check all
		 */
		function checkAll()
		{
			if ( vm.allChecked )
			{
				vm.checked = [];
				vm.allChecked = false;
			}
			else
			{
				angular.forEach(vm.invoices, function (invoice)
				{
					if ( !isChecked(invoice) )
					{
						toggleCheck(invoice);
					}
				});

				vm.allChecked = true;
			}
		}

		/**
		 * Open compose dialog
		 *
		 * @param ev
		 */
		function addProductDialog(ev)
		{
			$mdDialog.show({
				controller         : 'AddProductController',
				controllerAs       : 'vm',
				locals             : {
					selectedMail: undefined
				},
				templateUrl        : 'app/main/product/dialogs/compose/compose-dialog.html',
				parent             : angular.element($document.body),
				targetEvent        : ev,
				clickOutsideToClose: true
			});
		}

		/**
		 * Toggle sidenav
		 *
		 * @param sidenavId
		 */
		function toggleSidenav(sidenavId)
		{
			$mdSidenav(sidenavId).toggle();
		}

		/**
		 * Toggle innerview
		 *
		 */

		function toggleinnerView(){
			if(vm.appInnerState === "default"){
				vm.appInnerState = "add";
				vm.pageTitle="Share Apps";
			}else{
				vm.appInnerState = "default";
				vm.pageTitle="Users";
			}
		}

		toggleinnerView();



		//---------------------UserControler-------------------------

		var baseUrl = "http://" + window.location.hostname;//localhost
		//var baseUrl = "http://dev.cloudcharge.com";
		$scope.showGlobalProgress = true;
		$scope.adduser=[];
		$scope.EmailAddress={};

		$scope.emaill=[];

		function getBaseURL(){
			var url="";
			var port="9000";
			url = "http://" + window.location.hostname +":"+port;
			if(window.location.hostname=="localhost")
			{
				url = "http://dev.cloudcharge.com:"+port;
			}
			return url;
		}

		$scope.jwtToken="";
		function getInviteJWT(){
			$http.get(getBaseURL()+"/invite/getAccessTokenOpenID")
			//$http.get(baseUrl+"/auth/GetSession/"+$auth.getSecurityToken()+"/"+'dev.cloudcharge.com')
				.success(function(data){
					$scope.jwtToken=data.access_token;
					//return jwtToken;
				}).error(function(data){
				console.log(data);
				//return jwtToken;
			});
		}
		//getInviteJWT();

		function gst(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
			}
			//debugger;
			return null;
		}

		function getDomainName() {
			var _st = gst("domain");
			return (_st != null) ? _st : ""; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
		}

		function getIdToken() {
			var _st = gst("securityToken");
			return (_st != null) ? _st : ""; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
		}

		var idToken = gst("securityToken");
		var category = gst("category");
		// var idToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.eyJleHAiOjE1MDc3ODQwMzMsIm5iZiI6MTUwNzcwMTIzMywidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tL2MxZjlmOGU2LTM0NjktNGQ1Zi1hMzI2LTgzZTk5MGE5OTI2YS92Mi4wLyIsInN1YiI6ImM1YzA1MmUxLWY0NjQtNDgzYS04OTRiLTRlNWRiOGQ4ZjFjNCIsImF1ZCI6ImQwODRhMjI3LWJiNTItNDk5Mi04ODlkLTZlNDgzNTYxMGU3NiIsIm5vbmNlIjoiZGVmYXVsdE5vbmNlIiwiaWF0IjoxNTA3NzAxMjMzLCJhdXRoX3RpbWUiOjE1MDc3MDEyMzMsIm9pZCI6ImM1YzA1MmUxLWY0NjQtNDgzYS04OTRiLTRlNWRiOGQ4ZjFjNCIsImdpdmVuX25hbWUiOiJjaGlubyIsIm5hbWUiOiJuaWNvZGVtdXMiLCJjb3VudHJ5IjoiU3JpIExhbmthIiwiZXh0ZW5zaW9uX21vZGUiOiJ0ZXN0IiwiZXh0ZW5zaW9uX0RvbWFpbiI6Im5pY29kZW11cy5hcHAuY2xvdWRjaGFyZ2UuY29tIiwiZmFtaWx5X25hbWUiOiJmcmVlX3RyaWFsIiwiam9iVGl0bGUiOiJhZG1pbiIsImVtYWlscyI6WyJjaGluby5uaWNvZGVtdXNAb291LnVzIl0sInRmcCI6IkIyQ18xX0RlZmF1bHRQb2xpY3kifQ.omLBXMvaSq7p3DGB9csxnzo9SSMQ7xtnDT2J2ZPbw3RVGJHfOOvTLEv4s1Ie59Yw6aKZ9LAGh1KbPvnyZCOGNE7rZ9ezSwruloVwDet9e6PUQI_enk7dDkUeRkbIuzoFD7_Cne3zxi1TDkAGEGs7pbYr9XHiDT2pbpe3QXE_chKcnk5BtoZY11voReycBF23U0AwyixOT0tI_RNKPy9yF6iSHxoP_77RdKirGo7dU_VBqfmc9ea7fIg8WIdqgaWR73cVsI_Tj9NkDgpWQQLpRsjvcgh7e2e2u8BX0rd20uJi5jp13Sy4HPEvIrkCG4GKV4MC3yTm-e6iaGBIk2FDjw";

		function getCurrentDomain() {
			var _st = gst("currentDomain");
			var __st = gst("domain");
			return (_st != null) ? _st : __st; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
		}

		function parseJwt (token) {
			var base64Url = token.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			return JSON.parse(window.atob(base64));
		}

		$scope.companyName="";
		$scope.companyAddress="";
		$scope.companyLogo="";
		
		$scope.currDomainGlobal = getCurrentDomain();

		$charge.settingsapp().getDuobaseValuesByTableName("CTS_CompanyAttributes").success(function(data) {
			//
			$scope.companyName=data[0].RecordFieldData;
			$scope.companyAddress=data[1].RecordFieldData;
			$scope.companyLogo=(data[4].RecordFieldData=="")?"":data[4].RecordFieldData=="Array"?"":data[4].RecordFieldData;

			if($scope.companyLogo.split('/')[$scope.companyLogo.split('/').length-1].split('.')[0] == 'dummy_logo'){
				$scope.companyLogo="";
			}

		}).error(function(data) {
			$scope.companyName="";
			$scope.companyAddress="";
			$scope.companyLogo="";
		})

		function loaduser(){
			$scope.searchText="";
			//$http.get(baseUrl + "/devportal/project/share/getusers")
			//$http.get(baseUrl + "/apis/usercommon/getSharableObjects")
			//  .success(function(data)
			//  {
			//    $scope.adduser=data;
			//    console.log(data);
			//    $scope.showGlobalProgress = false;
			//    $scope.emailadd=[];
			//    for(var i=0; i<$scope.adduser.length; i++){
			//      console.log($scope.adduser[i].Id);
			//
			//      if($scope.emailadd.indexOf($scope.adduser[i]) == -1){
			//
			//        $scope.emailadd.push($scope.adduser[i].Id);
			//
			//        console.log($scope.emailadd);
			//      }
			//
			//    }
			//
			//    $scope.EmailAddress={
			//      email:$scope.emailadd
			//    };
			//
			//    console.log($scope.EmailAddress);
			//
			//    //getUser's more details of json
			//    getuserdatabulk();
			//  });

			//$http.get(getBaseURL()+"/invite/getAccessTokenOpenID")
			//  //$http.get(baseUrl+"/auth/GetSession/"+$auth.getSecurityToken()+"/"+'dev.cloudcharge.com')
			//  .success(function(data){
			//    $scope.jwtToken=data.access_token;
			//    //return jwtToken;
			//    $http({
			//      method: 'GET',
			//      //url: 'http://'+window.location.hostname+':9000/invite/getUsersByTenant?tenant="lanap.dev.cloudcharge.com"',
			//      url: getBaseURL()+"/invite/getUsersByTenant?tenant='dev3.dev.cloudcharge.com'",
			//      headers: {
			//        'Content-Type': 'application/json',
			//        'Authorization': 'Bearer '+$scope.jwtToken
			//      }
			//    })
			//      .success(function(data)
			//      {
			//        if(data.status=="OK")
			//        {
			//          $scope.adduser=data.error.value;
			//          console.log(data.error.value);
			//          $scope.showGlobalProgress = false;
			//          $scope.users=$scope.adduser;
			//        }
			//      });
			//  }).error(function(data){
			//    console.log(data);
			//    $scope.showGlobalProgress = false;
			//    //return jwtToken;
			//  });

			var tenantName="'"+getCurrentDomain()+"'";

			$charge.useradmin().getTenantUsers(tenantName).success(function (data) {

				if(data.status=="OK")
				{
					$scope.adduser=data.result.value;
					//console.log(data.error.value);
					$scope.users=$scope.adduser;

					// $http({method:'GET',url:'app/core/cloudcharge/js/config.json'}).then(function (res) {
					// 	$scope.configURL = res.data;
					// 	$http({
					// 		method:'GET',
					// 		url: $scope.configURL.invitationLog.invitationDomainLogURL,
					// 		headers: {
					// 			'idToken':idToken,
					// 			'domain':domain,
					// 			'Content-type':'applicatoin/json'
					// 		}
					// 	}).then(function(res) {
					// 		// debugger;
					// 		if(res != null && res.data != null){
					// 			angular.forEach(res.data.result[0], function (log) {
					// 				angular.forEach($scope.users, function (user) {
					// 					if(user.signInNames[0].value == log.email){
					// 						user.status = log.status
					// 					}else{
					// 						if(log.status == 'Expired' || log.status == 'Confirmed'){
					// 							$scope.users.push({
					// 								email:log.email,
					// 								status:log.status,
					// 								name:log.name,
					// 								createdDate:log.createdDate,
					// 								updatedDate:log.updatedDate
					// 							});
					// 						}
					// 					}
					// 				});
					// 			});
					// 		}
					// 		$scope.showGlobalProgress = false;
					// 	}, function (errorRes) {
					// 		debugger;
					// 	});
					// }, function (res) {});
				}
				else
				{
					$scope.showGlobalProgress = false;
				}
			}).error(function (data) {
				//console.log(data);
				$scope.showGlobalProgress = false;

			});

		}

		$scope.invitationLogs = [];
		function loadInvitationLogs() {
			$scope.invitationLogs = [];
			$http({
				method:'GET',
				url: $scope.configURL.invitationLog.invitationDomainLogURL,
				headers: {
					'idToken':idToken,
					'domain':domain,
					'Content-type':'applicatoin/json'
				}
			}).then(function(res) {
				if(res.data.status){
					angular.forEach(res.data.result[0], function (log) {
						$scope.invitationLogs.push({
							email:log.email,
							status:log.status,
							name:log.name,
							createdDate:log.createdDate,
							updatedDate:log.updatedDate
						});


						// angular.forEach($scope.users, function (user) {
						// 	if(user.signInNames[0].value == log.email){
						// 		user.status = log.status
						// 	}else{
						// 		if(log.status == 'Expired' || log.status == 'Confirmed'){
						// 			$scope.users.push({
						// 				email:log.email,
						// 				status:log.status,
						// 				name:log.name,
						// 				createdDate:log.createdDate,
						// 				updatedDate:log.updatedDate
						// 			});
						// 		}
						// 	}
						// });
					});
				}
				$scope.showGlobalProgress = false;
			}, function (errorRes) {
				$scope.showGlobalProgress = false;
			});
		}

		$scope.appIdList=[];

		function loadallapps(){

			$scope.allApps = [];

			//$http.get(getBaseURL()+"/invite/getAccessTokenOpenID")
			//  //$http.get(baseUrl+"/auth/GetSession/"+$auth.getSecurityToken()+"/"+'dev.cloudcharge.com')
			//  .success(function(data){
			//    $scope.jwtToken=data.access_token;
			//    //return jwtToken;
			//    $http({
			//      method: 'GET',
			//      //url: 'http://'+window.location.hostname+':9000/invite/getUsersByTenant?tenant="lanap.dev.cloudcharge.com"',
			//      url: getBaseURL()+"/invite/getGrpsByTenant",
			//      headers: {
			//        'Content-Type': 'application/json',
			//        'id_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiI2MjFmZDliOS1kMzk4LTQ4MTEtYjY5Mi1kZGExMGUwYmUwNjEiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9jMWY5ZjhlNi0zNDY5LTRkNWYtYTMyNi04M2U5OTBhOTkyNmEvIiwiaWF0IjoxNDg1OTQ1MjkwLCJuYmYiOjE0ODU5NDUyOTAsImV4cCI6MTQ4NTk0OTE5MCwiYW1yIjpbInB3ZCJdLCJlbWFpbCI6ImNsb3VkY2hhcmdlQGhvdG1haWwuY29tIiwiZmFtaWx5X25hbWUiOiJhZG1pbiIsImdpdmVuX25hbWUiOiJhZG1pbiIsImlkcCI6ImxpdmUuY29tIiwiaXBhZGRyIjoiMTI0LjQzLjc1Ljc4IiwibmFtZSI6ImFkbWluIiwib2lkIjoiMTYzZmI0MmQtNjkwZC00MTc2LThlMTgtMmMwNGQ4MWUzM2M0IiwicGxhdGYiOiIzIiwic3ViIjoiRFFtWDFpdFI4Qjh2S1FTQThsU2tTd0g0S0lQNWYxb1U2Q3l0M2stSks4cyIsInRpZCI6ImMxZjlmOGU2LTM0NjktNGQ1Zi1hMzI2LTgzZTk5MGE5OTI2YSIsInVuaXF1ZV9uYW1lIjoibGl2ZS5jb20jY2xvdWRjaGFyZ2VAaG90bWFpbC5jb20iLCJ2ZXIiOiIxLjAifQ.'
			//      }
			//    })
			//      .success(function(data)
			//      {
			//        if(data.status=="OK")
			//        {
			//          var appname="";
			//          for(var i=0; i<data.Result.length; i++){
			//            appname=data.Result[i].displayName.split('_')[1];
			//            if(appname!="" && appname!=undefined && appname!="User")
			//            {
			//              $scope.allApps.push({
			//                'Name': appname,
			//                'ApplicationID': data.Result[i].id
			//              });
			//            }
			//          }
			//          $scope.app=$scope.allApps;
			//        }
			//      });
			//  }).error(function(data){
			//    console.log(data);
			//    //return jwtToken;
			//  });

			$scope.appIdList=[];

			var tenantId = parseJwt(idToken).oid;

			$charge.useradmin().getUserApps(tenantId).success(function (data) {

				if(data.status=="OK")
				{
					var appname="";
					for(var i=0; i<data.data.length; i++){
						appname=data.data[i].body.displayName.split('_')[1];
						var domain=data.data[i].body.displayName.split('_')[0];
						if(appname!="" && appname!=undefined && appname!="User" && appname!="myaccount" && appname!="setupguide")
						{
							if(domain == $scope.currDomainGlobal){
								$.each($scope.configURL.apps[category], function(index, categoryapp){
									if(appname == categoryapp){
										$scope.allApps.push({
											'Name': appname,
											'ApplicationID': data.data[i].body.id,
											'isSelected': false,
											'domain' : domain
										});
									}
								});
							}
							//$scope.appIdList.push(data.data[i].body.id);
						}
					}
					$scope.app=$scope.allApps;
				}

			}).error(function (data) {
				//console.log(data);

			});

		}

		function getuserdatabulk(){
			//This holds the UI logic for the collapse cards
			$scope.toggles = {};
			$scope.toggleOne = function($index) {
				$scope.toggles = uiInitilize.openOne(this.users, $index);
			};

			$http({
				method : 'POST',
				url : baseUrl + "/apis/profile/userprofile/getuserdatabulk",
				data : $scope.EmailAddress
			}).then(function(response) {
				console.log(response);
				console.log(response.data);
				$scope.users=response.data;
				if($scope.users.length==0)
					$scope.users=$scope.adduser;

			}, function(response) {
				console.log(response);
			});
		}

		loaduser();
		loadallapps();

		$scope.selectAppForInviteUser=function(app){
			app.isSelected=!app.isSelected;
		}

		$scope.userinvited=false;
		$scope.userAppSelectEnabled=false;
		$scope.inviting = false;

		$scope.enterInviteUserProcess=function(text,ev){
			$scope.userAppSelectEnabled=false;
			$scope.inviting = true;

			$scope.appIdList=[];

			for(var i=0; i<$scope.allApps.length; i++){
				var appObj=$scope.allApps[i];
				if(appObj.isSelected)
				{
					$scope.appIdList.push(appObj.ApplicationID);
				}
				appObj.isSelected=false;
			}

			var inviteData={
				"groups": $scope.appIdList,
				"displayName":text.split('@')[0],
				"givenName":text.split('@')[0],
				"email":text,
				"password":"abc@1234",
				"sites":getCurrentDomain(),
				"companyName":$scope.companyName,
				"companyLogo":$scope.companyLogo
			};

			$charge.useradmin().inviteUser(inviteData).success(function (data) {

				if(data.status=="OK")
				{
					notifications.toast("Invitation success", "success",3000);
					loaduser();
					vm.selectedEmailInvite="";
					$scope.activeShareStep=0;
					$scope.shareStepOneDone = false;
					$scope.inviting = false;
				}
				else if(data.status=="EXIST")
				{
					notifications.toast("This user exist in our system", "error",3000);
					//notifications.toast(data.result['odata.error'].message.value, "error",3000);
					$scope.activeShareStep=0;
					$scope.shareStepOneDone = false;
					$scope.inviting = false;
				}
				else if(data.status=="NOK")
				{
					//notifications.toast("User Invitation sending failed", "error",3000);
					if(data.result['odata.error'].message.value.indexOf("signInNames already exists") !=-1)
					{
						notifications.toast("This user has been already invited", "error",3000);
					}
					else
					{
						notifications.toast(data.result['odata.error'].message.value, "error",3000);
					}
					$scope.activeShareStep=0;
					$scope.shareStepOneDone = false;
					$scope.inviting = false;
				}

				$scope.userinvited=false;
				$scope.activeShareStep=0;
				$scope.shareStepOneDone = false;
				$scope.inviting = false;

			}).error(function (data) {
				//console.log(data);
				$mdDialog.show(
					$mdDialog.alert()
						.parent(angular.element(document.querySelector('#popupContainer')))
						.clickOutsideToClose(true)
						.title('Alert')
						.content('User Invitaion Failed!')
						.ariaLabel('Alert Dialog Demo')
						.ok('Got it!')
						.targetEvent(ev)
				);
				$scope.userinvited=false;
				$scope.activeShareStep=0;
				$scope.shareStepOneDone = false;
				$scope.inviting = false;
			});
		}

		$scope.enterInviteUser=function(text,ev){
			//console.log(text);
			$scope.userinvited=true;
			if(text!=="" && text!==undefined ){
				$scope.checkUserAlredyIn=false;
				//for(var j=0; j<$scope.adduser.length; j++){
				//  var emailAddress="";
				//  if($scope.adduser[j].EmailAddress!=undefined)
				//  {
				//    emailAddress = $scope.adduser[j].EmailAddress;
				//  }
				//  else
				//  {
				//    emailAddress = $scope.adduser[j].Id;
				//  }
				//  console.log(emailAddress);
				//  if(emailAddress==text){
				//    $scope.checkUserAlredyIn=true;
				//    notifications.toast("This user already invited", "error");
				//    $scope.userinvited=false;
				//    break;
				//  }else{
				//    $scope.checkUserAlredyIn=false;
				//  }
				//}

				if(!$scope.checkUserAlredyIn){
					var atpos = text.indexOf("@");
					var dotpos = text.lastIndexOf(".");
					if (atpos<1 || dotpos<atpos+2 || dotpos+2>=text.length) {
						notifications.toast("Please enter valid e-mail address", "error");
						$scope.userinvited=false;
						//return false;
						//break;
					}
					else{
						//var objCheckProcess={
						//  "appId":"user",
						//  "amount":"1"
						//};
						//$charge.ratingengine().checkProcess(objCheckProcess).success(function (data2) {
						//  console.log("checkprocess: "+data2.amount);
						//  if(data2.success)
						//  {
						//    $http.get( "/auth/GetUser/"+text)
						//      .success(function(response){
						//        //http://admin.dev.cloudcharge.com/auth/GetUser/support@cloudcharge.com
						//        //despunir@norih.com
						//        console.log(response);
						//        if(response.Error)
						//        {
						//          $http.get( $v6urls.auth + "/tenant/AddUser/"+text+"/user")
						//            .success(function(data){
						//              $scope.user=data;
						//              console.log(data);
						//
						//              if(data=="true"){
						//                console.log(data);
						//                notifications.toast("Successfully Invited", "success",3000);
						//                loaduser();
						//                //$state.go("app.useradmin");
						//                //document.getElementById('userInviteId').value = '';
						//                vm.selectedEmailInvite="";
						//
						//                //$scope.userinvited=false;
						//                //var userAmount=parseInt(data2.amount)+1;
						//                //lirtayut@begoz.com
						//                //var data = {
						//                //  "appId":"user",
						//                //  "amount":userAmount,
						//                //  "expiry":"",
						//                //  "sign":"<="
						//                //}
						//                var data = {
						//                  "appId":"user",
						//                  "amount":"1"
						//                }
						//                var meta={
						//                  "domainUrl":window.location.hostname,
						//                  "securityToken":$helpers.getCookie('securityToken')
						//                }
						//
						//                data=JSON.stringify(data);
						//                meta=JSON.stringify(meta);
						//                $http.get('app/main/useradmin/models/ratingengineservice.php/?method=processrule&&data='+data+'&&meta='+meta
						//                ).then(function (response) {
						//                    debugger;
						//                    if(response.data.success){
						//                      console.log("Rule processed!");
						//                      $scope.userinvited=false;
						//                    }
						//                  }, function () {
						//                    //debugger;
						//                    //$scope.serviceError = "Unexpected Error Occurred. Please try again later"
						//                    console.log("process rule failed!");
						//                    $scope.userinvited=false;
						//                  });
						//
						//
						//              }
						//              else{
						//                $mdDialog.show(
						//                  $mdDialog.alert()
						//                    .parent(angular.element(document.querySelector('#popupContainer')))
						//                    .clickOutsideToClose(true)
						//                    .title('Alert')
						//                    .content('User Invitaion Failed!')
						//                    .ariaLabel('Alert Dialog Demo')
						//                    .ok('Got it!')
						//                    .targetEvent(ev)
						//                );
						//                $scope.userinvited=false;
						//              }
						//
						//            });
						//        }
						//        else
						//        {
						//          notifications.toast("This user already exist in CloudCharge", "error", 5000);
						//          //vm.selectedEmailInvite="";
						//          $scope.userinvited=false;
						//        }
						//      });
						//  }
						//  else
						//  {
						//    notifications.toast("Sorry, Maximum User Limit Reached! Cannot add more Users!", "error");
						//    $scope.userinvited=false;
						//  }
						//}).error(function (data) {
						//  notifications.toast("Add user permission checking Error!", "error");
						//  $scope.userinvited=false;
						//});

						//getInviteJWT();

						//$http({
						//  method: 'POST',
						//  //url: 'http://'+window.location.hostname+':9000/invite/inviteUser',
						//  url: getBaseURL()+'/invite/inviteUser',
						//  headers: {
						//    'Content-Type': 'application/json',
						//    'id_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiI2MjFmZDliOS1kMzk4LTQ4MTEtYjY5Mi1kZGExMGUwYmUwNjEiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9jMWY5ZjhlNi0zNDY5LTRkNWYtYTMyNi04M2U5OTBhOTkyNmEvIiwiaWF0IjoxNDg1OTQ1MjkwLCJuYmYiOjE0ODU5NDUyOTAsImV4cCI6MTQ4NTk0OTE5MCwiYW1yIjpbInB3ZCJdLCJlbWFpbCI6ImNsb3VkY2hhcmdlQGhvdG1haWwuY29tIiwiZmFtaWx5X25hbWUiOiJhZG1pbiIsImdpdmVuX25hbWUiOiJhZG1pbiIsImlkcCI6ImxpdmUuY29tIiwiaXBhZGRyIjoiMTI0LjQzLjc1Ljc4IiwibmFtZSI6ImFkbWluIiwib2lkIjoiMTYzZmI0MmQtNjkwZC00MTc2LThlMTgtMmMwNGQ4MWUzM2M0IiwicGxhdGYiOiIzIiwic3ViIjoiRFFtWDFpdFI4Qjh2S1FTQThsU2tTd0g0S0lQNWYxb1U2Q3l0M2stSks4cyIsInRpZCI6ImMxZjlmOGU2LTM0NjktNGQ1Zi1hMzI2LTgzZTk5MGE5OTI2YSIsInVuaXF1ZV9uYW1lIjoibGl2ZS5jb20jY2xvdWRjaGFyZ2VAaG90bWFpbC5jb20iLCJ2ZXIiOiIxLjAifQ.'
						//  },
						//  data: {
						//    'invitedUserDisplayName': text.split('@')[0],
						//    'invitedUserEmailAddress': text
						//  }
						//})
						//  .success(function (data) {
						//    console.log(data);
						//    if(data.status=="OK")
						//    {
						//      notifications.toast("Successfully Invited", "success",3000);
						//      loaduser();
						//      vm.selectedEmailInvite="";
						//    }
						//    else if(data.status=="EXIST")
						//    {
						//      notifications.toast("This user has already Invited", "error",3000);
						//    }
						//    else if(data.status=="NOK")
						//    {
						//      notifications.toast("User Invitation sending failed", "error",3000);
						//    }
						//
						//    $scope.userinvited=false;
						//  })
						//  .error(function (data) {
						//    console.log(data);
						//    $mdDialog.show(
						//      $mdDialog.alert()
						//        .parent(angular.element(document.querySelector('#popupContainer')))
						//        .clickOutsideToClose(true)
						//        .title('Alert')
						//        .content('User Invitaion Failed!')
						//        .ariaLabel('Alert Dialog Demo')
						//        .ok('Got it!')
						//        .targetEvent(ev)
						//    );
						//    $scope.userinvited=false;
						//  });

						$scope.userAppSelectEnabled=true;
						$scope.activeShareStep=1;
						$scope.shareStepOneDone = true;

						//var inviteData={
						//  "groups": $scope.appIdList,
						//  "displayName":text.split('@')[0],
						//  "givenName":text.split('@')[0],
						//  "email":text,
						//  "password":"abc@1234",
						//  "sites":getCurrentDomain(),
						//  "companyName":$scope.companyName,
						//  "companyLogo":$scope.companyLogo
						//};
						//
						//$charge.useradmin().inviteUser(inviteData).success(function (data) {
						//
						//  if(data.status=="OK")
						//  {
						//    notifications.toast("Successfully Invited", "success",3000);
						//    loaduser();
						//    vm.selectedEmailInvite="";
						//  }
						//  else if(data.status=="EXIST")
						//  {
						//    notifications.toast("This user exist in our System", "error",3000);
						//    //notifications.toast(data.result['odata.error'].message.value, "error",3000);
						//  }
						//  else if(data.status=="NOK")
						//  {
						//    //notifications.toast("User Invitation sending failed", "error",3000);
						//    if(data.result['odata.error'].message.value.indexOf("signInNames already exists") !=-1)
						//    {
						//      notifications.toast("This user has already Invited", "error",3000);
						//    }
						//    else
						//    {
						//      notifications.toast(data.result['odata.error'].message.value, "error",3000);
						//    }
						//  }
						//
						//  $scope.userinvited=false;
						//
						//}).error(function (data) {
						//  //console.log(data);
						//  $mdDialog.show(
						//    $mdDialog.alert()
						//      .parent(angular.element(document.querySelector('#popupContainer')))
						//      .clickOutsideToClose(true)
						//      .title('Alert')
						//      .content('User Invitaion Failed!')
						//      .ariaLabel('Alert Dialog Demo')
						//      .ok('Got it!')
						//      .targetEvent(ev)
						//  );
						//  $scope.userinvited=false;
						//
						//});

					}
				}

			}
			else{
				notifications.toast("Please enter an email address", "error");
				$scope.userinvited=false;
			}

		};

		//$auth.checkSession();

		function loadOwernTenantDetails(){
			$http.get("/auth/GetSession/"+$helpers.getCookie('securityToken')+"/"+window.location.hostname)
			//$http.get(baseUrl+"/auth/GetSession/"+$auth.getSecurityToken()+"/"+'dev.cloudcharge.com')
				.success(function(data){
					$scope.owernUser=data;
					console.log($scope.owernUser);
				}).error(function(data){
				console.log(data);
			});
		}

		//loadOwernTenantDetails();

		$scope.removeInviteUser=function(data, ev){
			console.log(data);
			var confirm = $mdDialog.confirm()
				.title('Are you sure?')
				.content('Are you sure you want to delete this user permanently?')
				.ariaLabel('Lucky day')
				.targetEvent(ev)
				.ok('Yes')
				.cancel('No');

			$mdDialog.show(confirm).then(function() {
				console.log(data);
				$scope.showGlobalProgress = true;

				if(data.email==$scope.owernUser.Email){
					console.log(data.email);
					console.log($scope.owernUser.Email);
					$scope.showGlobalProgress = false;
					notifications.toast("System will not authorized to delete the tenant owner", "error");
				}
				else{

					$http.get($v6urls.auth + "/tenant/RemoveUser/"+ data.email)
						.success(function(data)
						{
							$scope.removedInviteUser=data;
							console.log(data);
							loaduser();
							$scope.showGlobalProgress = false;

							//$charge.ratingengine().checkProcess(objCheckProcess).success(function (data2) {
							//  var userAmount=parseInt(data2.amount)-1;
							//  var removedUserData = {
							//    "appId":"user",
							//    "amount":userAmount,
							//    "expiry":"",
							//    "sign":"<="
							//  }
							//  var meta={
							//    "domainUrl":window.location.hostname,
							//    "securityToken":$helpers.getCookie('securityToken')
							//  }
							//
							//  removedUserData=JSON.stringify(removedUserData);
							//  meta=JSON.stringify(meta);
							//  $http.get('app/main/useradmin/models/ratingengineservice.php/?method=updaterule&&data='+removedUserData+'&&meta='+meta
							//  ).then(function (response) {
							//      debugger;
							//      if(response.data.success){
							//        console.log("Rule processed!");
							//      }
							//    }, function () {
							//      //debugger;
							//      //$scope.serviceError = "Unexpected Error Occurred. Please try again later"
							//      console.log("process rule failed!");
							//    });
							//}).error(function (data) {
							//  notifications.toast("user permission checking Error!", "error");
							//});

						});

					$http.get("/apis/usercommon/updateSharedAppsAndGroups/"+ data.email)
						.success(function(data)
						{
							console.log(data);
						});

				}




			});

		};


		//------------------------ShareAppsController---------------------------

		$scope.showGlobalProgress = true;

		//$apps.onAppsRetrieved(function(e,apps){
		//  //here are the apps
		//  //$scope.app=apps.apps;
		//  console.log(apps.apps);
		//  $scope.showGlobalProgress = false;
		//
		//  if($scope.app.length===0){
		//    $scope.showGlobalProgress = true;
		//  }
		//
		//});

		//$apps.getAppsForUser();

		$scope.applicationKey="";

		$scope.share=function(appId,appNamee){
			//console.log(appId);
			//console.log(appNamee);
			//$state.go('main.share',{appId: appId , appNamee: appNamee});
			$scope.appkey = appId;
			$scope.name = appNamee;
			//loadSharableObject();
			//loadShareData();
			//getInviteJWT();
			$scope.loading=false;
			$scope.selected = [];
			$scope.shareData=[];
			$scope.activeShareStep = 1;
			$scope.shareStepOneDone = true;
			loadSharedUserList();

		};

		function loadSharedUserList() {

			//$http({
			//  method: 'GET',
			//  //url: 'http://'+window.location.hostname+':9000/invite/getUsersByTenant?tenant="lanap.dev.cloudcharge.com"',295711c5-93c8-49ed-9a1a-7db38367ab3d
			//  url: getBaseURL()+"/invite/getUsersByApp?groupId="+$scope.appkey,
			//  headers: {
			//    'Content-Type': 'application/json',
			//    'Authorization': 'Bearer '+$scope.jwtToken
			//  }
			//})
			//  .success(function(data)
			//  {
			//    if(data.status=="OK")
			//    {
			//      $scope.selected=data.error.value;
			//      $scope.loadUiShareData=data.error.value;
			//    }
			//  });

			$charge.useradmin().getAppUsers($scope.appkey).success(function (data) {

				if(data.status=="OK")
				{
					$scope.selected=data.result.value;
					$scope.loadUiShareData=data.result.value;
				}

			}).error(function (data) {
				//console.log(data);

			});
		}


		//----------------------------ShareController-----------------------------

		$scope.loading=true;
		$scope.getSharableuserAndGroup= [];

		function loadSharableObject() {
			$http.get(baseUrl + "/apis/usercommon/getSharableObjects")
				.success(function(data)
				{
					console.log(data);
					$scope.loading=false;
					$scope.getSharableuserAndGroup = data;

				}).error(function(){

				alert ("Oops! There was a problem retrieving the User");
			});
		}

		//loadSharableObject();

		// chips ctrl CLOSE
		$scope.selected=[];
		$scope.loadUiShareData=[];
		$scope.shareData=[];

		$scope.onDropOne = function (data, event) {
			//console.log(data);

			// Get custom object data.
			var customObjectData= data['json/custom-object']; // {foo: 'bar'}

			$scope.setcustomObjectData={};
			$scope.setcustomObjectData=customObjectData;
			//$scope.setcustomObjectData.id=customObjectData.id;
			$scope.setcustomObjectData.image="app/core/cloudcharge/img/user.png";
			//$scope.setcustomObjectData.displayName=customObjectData.displayName;
			//$scope.setcustomObjectData.mail=customObjectData.mail;

			//console.log($scope.setcustomObjectData);
			// Get other attached data.
			var uriList = data['text/uri-list'];
			// console.log(uriList);

			for (var ind in $scope.selected)
			{
				//console.log($scope.selected[ind].id);

				if($scope.selected[ind].objectId == $scope.setcustomObjectData.objectId)
				{
					$scope.selected.splice(ind,1);

					for(var k=0; k<$scope.shareData.length; k++){
						if($scope.shareData[k].usrId == $scope.setcustomObjectData.objectId)
						{
							$scope.shareData.splice(k,1);
						}
					}
				}
			}

			if($scope.loadUiShareData.length !== 0){

				for(var j=0; j<$scope.loadUiShareData.length; j++){
					if($scope.setcustomObjectData.objectId !== $scope.loadUiShareData[j].objectId){
						$scope.selected.push($scope.setcustomObjectData);
						$scope.shareData.push({
							'id': $scope.setcustomObjectData.objectId,
							'status':'add'
						})
						break;
					}
					else{
						$scope.selected.push($scope.setcustomObjectData);
						$scope.shareData.push({
							'id': $scope.setcustomObjectData.objectId,
							'status':'add'
						})
						//console.log($scope.selected);

					}
				}

			}
			else {
				//$scope.selected.push($scope.setcustomObjectData);
				if($scope.selected.length ==0)
				{
					$scope.selected.push($scope.setcustomObjectData);
					$scope.shareData.push({
						'id': $scope.setcustomObjectData.objectId,
						'status':'add'
					})
					//console.log($scope.selected);

				}
				else{
					$scope.selected.push($scope.setcustomObjectData);
					$scope.shareData.push({
						'id': $scope.setcustomObjectData.objectId,
						'status':'add'
					})
					//console.log($scope.selected);
				}
			}
		};

		//$scope.appkey = $stateParams.appId;
		//$scope.name = $stateParams.appNamee;
		//console.log($scope.name);
		//console.log($scope.appkey);

		$scope.updateSharedApps=false;

		$scope.shareUser = function(data) {
			//console.log(data);
			$scope.updateSharedApps=true;

			//$scope.shareData=[];
			//for(var i=0; i<data.length; i++){
			//  $scope.shareData.push({
			//    'usrId': data[i].id
			//  })
			//}

			//console.log($scope.shareData);

			//This post method for save UI share data
			//$http({
			//  method: 'POST',
			//  //url: 'http://'+window.location.hostname+':9000/invite/inviteUser',
			//  url: getBaseURL()+'/apprestriction/addPermission',
			//  headers: {
			//    'Content-Type': 'application/json',
			//    'Authorization': 'Bearer '+$scope.jwtToken
			//  },
			//  data: {
			//    'groupId': $scope.appkey,
			//    'users': $scope.shareData
			//  }
			//})
			//.then(function(response) {
			//  console.log(response);
			//  if(response.data.status){
			//    // $mdToast.show(
			//    // 	$mdToast.simple()
			//    // 	.textContent('Shared Users Suceesfully!')
			//    // 	.position($scope.getToastPosition())
			//    // 	.hideDelay(3000)
			//    // 	);
			//    notifications.toast("Shared Successfully!", "success",3000);
			//  }
			//  else{
			//    notifications.toast("Share App Failed!", "error",3000);
			//  }
			//  $scope.updateSharedApps=false;
			//  //$mdDialog.hide();
			//}, function(response) {
			//  console.log(response);
			//  $scope.updateSharedApps=false;
			//});

			var appUserList = {
				'groupId': $scope.appkey,
				'users': $scope.shareData
			};

			$charge.useradmin().shareApp(appUserList).success(function (data) {

				if(data.status){
					notifications.toast("Shared Successfully!", "success",3000);
					$scope.shareData=[];
				}
				else{
					notifications.toast("Share App Failed!", "error",3000);
				}
				$scope.updateSharedApps=false;

			}).error(function (data) {
				//console.log(data);
				$scope.updateSharedApps=false;
			});

		};

		//loadShare data according to app key
		function loadShareData() {
			$http.get(baseUrl + "/apis/usercommon/loadUiShareData/"+ $scope.appkey)
				.success(function(data)
				{
					console.log(data);

					if(data.length !== 0){
						$scope.loadUiShareData=data;
						$scope.selected = $scope.loadUiShareData;
						console.log($scope.selected);
						console.log(data);
					}
					else{
						loadSharableObject();
						$scope.selected = [];
						$scope.loadUiShareData=[];
						//createAllUserAndGroup(data);
					}

				}).error(function(){

				alert ("Oops! There was a problem retrieving the User");
			});
		}

		//loadShareData();

		$scope.deleteApp= function(ev, data){
			//console.log(data);
			if($scope.selected.length<=1)
			{
				notifications.toast("Cannot remove all Users!", "error",3000);
			}
			else
			{
				for (var ind in $scope.selected)
				{
					//console.log($scope.selected[ind].id);

					if($scope.selected[ind].objectId == data.objectId)
					{
						$scope.selected.splice(ind,1);
						//console.log($scope.selected);
						$scope.shareData.push({
							'id': data.objectId,
							'status':'delete'
						});
					}
				}

				var elem = document.getElementById(data.objectId);
				elem.style.backgroundColor = "#fff";
			}
		};

		$scope.getCatLetter=function(catName){
			try{
				var catogeryLetter = "app/core/cloudcharge/img/material_alperbert/avatar_tile_"+catName.charAt(0).toLowerCase()+"_28.png";
			}catch(exception){}
			return catogeryLetter;
		};



		//invoice list ctrl functions

		//var skip=0;
		//var take=1000;
		//var invoicePrefix="";
		//var prefixLength=0;
		//$scope.invoices=[];
		//$scope.users=[];
		//
		////this function fetches a random text and adds it to array
		//$scope.more = function(){
		//  //debugger;
		//  //$scope.spinnerInvoice=true;
		//  $charge.invoice().all(skip,take,"desc").success(function(data) {
		//    //debugger;
		//    if(data.length<=take)
		//      $scope.lastSet=true;
		//      data.forEach(function(inv){
		//        //debugger;
		//        var accountID=inv.guAccountID;
		//        var invoiceDate=moment(inv.invoiceDate).format('LL');
		//        //debugger;
		//
		//        var user = $scope.getUserByID(accountID);
		//        //debugger;
		//        //while(user != undefined)
		//        //{
		//        //debugger;
		//        var invoice={};
		//        //debugger;
		//        if(user!=null) {
		//          invoice.person_name = user.profilename;
		//          invoice.othername=user.othername;
		//          invoice.email=user.email;
		//        }
		//        //debugger;
		//        invoice.invoice_type = inv.invoiceType;
		//
		//        invoice.code=inv.invoiceNo;
		//        invoice.invoiceAmount=inv.invoiceAmount;
		//        invoice.currency=inv.currency;
		//        invoice.invoiceDate=invoiceDate;
		//        if(inv.paidAmount==0)
		//          invoice.status='Not paid';
		//        else if(inv.paidAmount>0 && inv.paidAmount<inv.invoiceAmount)
		//          invoice.status='Partial Paid';
		//        else if(inv.paidAmount==inv.invoiceAmount)
		//          invoice.status='Paid';
		//        //invoice.status='Paid';
		//        invoice.select=false;
		//        $scope.invoices.push(invoice);
		//        // break;
		//        // }
		//
		//      });
		//
		//      //debugger;
		//      for (var i = 0; i < $scope.invoices.length; i++) {
		//        //debugger;
		//        if ($scope.invoices[i].status == "Paid") {
		//          $scope.invoices[i].StatusColor = "green";
		//        } else if ($scope.invoices[i].status == "Partial Paid") {
		//          $scope.invoices[i].StatusColor = "skyblue";
		//        }
		//        else if ($scope.invoices[i].status == "Not paid") {
		//          $scope.invoices[i].StatusColor = "orange";
		//        }
		//        else if ($scope.invoices[i].status == "Void") {
		//          $scope.invoices[i].StatusColor = "red";
		//        }
		//
		//      }
		//    vm.invoices=$scope.invoices;
		//    vm.selectedInvoice = vm.invoices[0];
		//      //debugger;
		//      //skip += take;
		//  }).error(function(data) {
		//    //debugger;
		//    $scope.lastSet=true;
		//  })
		//};
		//
		//
		//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_InvoiceAttributes","InvoicePrefix").success(function(data) {
		//  invoicePrefix=data[0];
		//  //debugger;
		//}).error(function(data) {
		//  console.log(data);
		//})
		//
		//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_InvoiceAttributes","PrefixLength").success(function(data) {
		//  prefixLength=data[0];
		//}).error(function(data) {
		//  console.log(data);
		//})
		//
		//
		//
		//
		//$scope.loadmore = function(take){
		//  debugger;
		//  $scope.spinnerInvoice=true;
		//  $charge.invoice().all(skip,take,"desc").success(function(data) {
		//    //debugger;
		//    if(data.length<take)
		//      $scope.lastSet=true;
		//    data.forEach(function(inv){
		//      //debugger;
		//      var accountID=inv.guAccountID;
		//      var invoiceDate=moment(inv.invoiceDate).format('LL');
		//      //debugger;
		//
		//      var user = $scope.getUserByID(accountID);
		//      var invoice={};
		//      if(user!=null) {
		//        invoice.person_name = user.profilename;
		//        invoice.othername=user.othername;
		//      }
		//      invoice.invoice_type = inv.invoiceType;
		//
		//      invoice.code=inv.invoiceNo;
		//      invoice.invoiceDate=invoiceDate;
		//      if(inv.paidAmount==0)
		//        invoice.status='Not paid';
		//      else if(inv.paidAmount>0 && inv.paidAmount<inv.invoiceAmount)
		//        invoice.status='Partial Paid';
		//      else if(inv.paidAmount==inv.invoiceAmount)
		//        invoice.status='Paid';
		//      //invoice.status='Paid';
		//      $scope.invoices.push(invoice);
		//
		//    });
		//    for (var i = 0; i < $scope.invoices.length; ++i) {
		//      if ($scope.invoices[i].status == "Paid") {
		//        $scope.invoices[i].StatusColor = "green";
		//      } else if ($scope.invoices[i].status == "Partial Paid") {
		//        $scope.invoices[i].StatusColor = "skyblue";
		//      }
		//      else if ($scope.invoices[i].status == "Not paid") {
		//        $scope.invoices[i].StatusColor = "orange";
		//      }
		//      else if ($scope.invoices[i].status == "Void") {
		//        $scope.invoices[i].StatusColor = "red";
		//      }
		//
		//    }
		//    $scope.spinnerInvoice=false;
		//    skip += take;
		//
		//  }).error(function(data) {
		//    //response=data;
		//    //debugger;
		//    var da=$scope.invoices;
		//    $scope.lastSet=true;
		//    $scope.spinnerInvoice=false;
		//  })
		//};
		//var skipUsr= 0,takeUsr=1000;
		//$scope.loadingUsers = true;
		//$scope.loadUsers = function(){
		//
		//  $charge.profile().all(skipUsr,takeUsr,'asc').success(function(data)
		//  {
		//    console.log(data);
		//    if($scope.loadingUsers)
		//    {
		//      for (var i = 0; i < data.length; i++) {
		//        var obj = data[i];
		//        if(obj.profile_type=='Individual')
		//        {
		//          $scope.users.push({
		//            profilename : obj.first_name,
		//            profileId : obj.profileId,
		//            othername : obj.last_name,
		//            profile_type : obj.profile_type,
		//            bill_addr:obj.bill_addr,
		//            category:obj.category,
		//            email:obj.email_addr
		//          });
		//        }
		//        else if(obj.profile_type=='Business') {
		//          $scope.users.push({
		//            profilename : obj.business_name,
		//            profileId : obj.profileId,
		//            othername : obj.business_contact_name,
		//            profile_type : obj.profile_type,
		//            bill_addr:obj.bill_addr,
		//            category:obj.category,
		//            email:obj.email_addr
		//
		//          });
		//        }
		//
		//      }
		//
		//      skipUsr += takeUsr;
		//      $scope.loadUsers();
		//    }
		//
		//  }).error(function(data)
		//  {
		//    //console.log(data);
		//    $scope.isSpinnerShown=false;
		//    $scope.more();
		//  })
		//
		//};
		//$scope.loadUsers();
		////$scope.more();
		//
		//$scope.editOff = true;
		//$scope.openInvoiceLst = function(invoice)
		//{
		//  //debugger;
		//  //all event false
		//  $scope.spinnerInvoice=true;
		//
		//  $charge.invoice().getByID(invoice.code).success(function(data) {
		//
		//    //debugger;
		//    console.log(data);
		//    $scope.invProducts=[];
		//    var invoiceDetails=data[0].invoiceDetails;
		//    var count=invoiceDetails.length;
		//    var productName;
		//    var status=false;
		//
		//    //var address = $scope.GetAddress(invoice.person_name);
		//    var address = $filter('filter')($scope.users, { profilename: invoice.person_name })[0];
		//    //$scope.prefix=prefixLength!=0? parseInt(prefixLength.RecordFieldData):0;
		//    var prefixInvoice=invoicePrefix!=""?invoicePrefix.RecordFieldData:"";
		//
		//    var exchangeRate=parseFloat(data[0].rate);
		//    $scope.selectedInvoice={};
		//    $scope.selectedInvoice = invoice;
		//    $scope.selectedInvoice.prefix=prefixLength!=0? parseInt(prefixLength.RecordFieldData):0;
		//    $scope.selectedInvoice.bill_addr = address.bill_addr;
		//    $scope.selectedInvoice.subTotal=angular.copy(data[0].subTotal*exchangeRate);
		//    $scope.selectedInvoice.discAmt=data[0].discAmt*exchangeRate;
		//    $scope.selectedInvoice.invoiceNo=prefixInvoice;
		//    //$scope.selectedInvoice.code=parseFloat($scope.selectedInvoice.code);
		//    //debugger;
		//    $scope.selectedInvoice.additionalcharge=data[0].additionalcharge*exchangeRate;
		//    $scope.selectedInvoice.invoiceAmount=data[0].invoiceAmount*exchangeRate;
		//    $scope.selectedInvoice.tax=data[0].tax*exchangeRate;
		//    $scope.selectedInvoice.dueDate=moment(data[0].dueDate.toString()).format('LL');
		//    $scope.selectedInvoice.logo=$rootScope.companyLogo;
		//    $scope.selectedInvoice.currency=data[0].currency;
		//    $scope.selectedInvoice.rate=exchangeRate;
		//
		//    //debugger;
		//    invoiceDetails.forEach(function(inv){
		//      //debugger;
		//      //productName=$scope.getProductByID(inv.guItemID);
		//      var currentProduct = $filter('filter')($scope.invProductList, { productId: inv.guItemID })[0];
		//      $scope.invProducts.push({
		//        product_name: currentProduct.product_name,
		//        unitprice: inv.unitPrice*exchangeRate,
		//        qty: inv.gty,
		//        amount: inv.totalPrice*exchangeRate
		//      });
		//    });
		//    //debugger;
		//
		//
		//    $scope.viewCount=1;
		//    //console.log($scope.selectedInvoice);
		//    $scope.spinnerInvoice=false;
		//
		//  }).error(function(data)
		//  {
		//    console.log(data);
		//    $scope.spinnerInvoice=false;
		//
		//  });
		//}
		//
		//$scope.toggleEdit = function () {
		//  if($scope.editOff==true)
		//  {
		//    $scope.editOff = false;
		//  }
		//  else
		//  {
		//    $scope.editOff = true;
		//  }
		//
		//}
		//
		//$scope.loadAllProducts=function()
		//{
		//  //debugger;
		//  $scope.spinnerInvoice=true;
		//  var product=$productHandler.getClient().LoadProduct().onComplete(function(data)
		//  {
		//    $scope.invProductList=data;
		//    //$scope.spinnerInvoice=false;
		//  });
		//
		//}
		//
		//$scope.loadAllProducts();
		//
		//$scope.getUserByID=function(id)
		//{
		//  //debugger;
		//  var users=$scope.users;
		//  var profileID=id;
		//  var currentUser={};
		//  var mapUservar = $filter('filter')(users, { profileId: profileID })[0];
		//  return mapUservar;
		//}
		//
		//
		//$scope.getProductByID=function(id)
		//{
		//  //debugger;
		//  var count=0;
		//  var isAvailable=false;
		//  var products=$scope.invProductList;
		//  var productID=id;
		//  var productName;
		//  var currentUser={};
		//  //for (var i = 0; i < products.length; i++) {
		//  //    var obj = products[i];
		//  //    if(obj.productId==productID) {
		//  //        productName=obj.product_name;
		//  //    }
		//  //}
		//  //products.forEach(function(product){
		//  //    if(product.productId==productID) {
		//  //        productName=product.product_name;
		//  //    }
		//  //});
		//  var productName = products.map(function(product){
		//    if(product.productId==productID) {
		//      isAvailable=true;
		//      //debugger;
		//      return product;
		//    }
		//    if(!isAvailable)
		//      count++;
		//
		//  });
		//  //debugger;
		//  return productName[count].product_name;
		//}
		//
		//$scope.GetAddress=function(name)
		//{
		//  //debugger;
		//  var users=$scope.users;
		//  var addr;
		//  var selectedName=name;
		//  for (var i = 0; i < users.length; i++) {
		//    var obj = users[i];
		//    if(obj.profilename==selectedName) {
		//      addr=obj.bill_addr;
		//    }
		//  }
		//  return addr;
		//}
		//
		//$scope.getPromotionByID=function(id)
		//{
		//  for (i = 0; i < $scope.promotions.length; i++) {
		//    if ($scope.promotions[i].promotioncode == promocode) {
		//      isValid = true;
		//      $scope.content.gupromotionid = $scope.promotions[i].gupromotionid;
		//      break;
		//    }
		//  }
		//}
		$scope.selectedUser = {};
		$scope.showInpageReadpane = false;
		$scope.entitledApps = [];
		$scope.allApps = [];
		$scope.switchInfoPane = function (state, selectedUser) {
			if(state=='show'){
				$scope.showInpageReadpane = true;
				$scope.selectedUser = selectedUser;
				$scope.selectedUser.name = selectedUser.name;
				$scope.selectedUser.email = selectedUser.email;
				// $scope.selectedUser.address = selectedUser.officeLocation;

				$scope.entitledApps = [];
				var userId=selectedUser.objectId;
				//$http({
				//  method: 'GET',
				//  //url: 'http://'+window.location.hostname+':9000/invite/getUsersByTenant?tenant="lanap.dev.cloudcharge.com"',
				//  url: getBaseURL()+"/invite/getUserGroups?userId="+userId+"&securityEnabled=true",
				//  headers: {
				//    'Content-Type': 'application/json',
				//    'Authorization': 'Bearer '+$scope.jwtToken
				//  }
				//})
				//  .success(function(data)
				//  {
				//    if(data.status=="OK")
				//    {
				//      var appname="";
				//      for(var i=0; i<data.data.length; i++){
				//        appname=data.data[i].body.displayName.split('_')[1];
				//        if(appname!="" && appname!=undefined && appname!="User")
				//        {
				//          $scope.entitledApps.push(appname);
				//
				//        }
				//      }
				//    }
				//  });

				$charge.useradmin().getUserApps(userId).success(function (data) {

					if(data.status=="OK")
					{
						var appname="";
						for(var i=0; i<data.data.length; i++){
							appname=data.data[i].body.displayName.split('_')[1];
							if(appname!="" && appname!=undefined && appname!="User")
							{
								$scope.entitledApps.push(appname);

							}
						}
					}

				}).error(function (data) {
					//console.log(data);

				});

			}else if(state=='close'){
				if($scope.inpageReadPaneEdit){
					$scope.cancelEdit();
				}else{
					$scope.showInpageReadpane = false;
					$scope.inpageReadPaneEdit=false;
				}
			}
		}
		$scope.appsToShow = [
			'Invoice',
			'Quotation',
			'Inventory',
			'Adjustment',
			'Payment',
			'Promotion',
			'Threesixty',
			'Dashboard',
			'Product',
			'Profile'
		];

		//Kasun_Wijeratne_30_JAN_17===================================
		$scope.inpageReadPaneEdit=false;
		$scope.showMoreUserInfo=false;

		$scope.contentExpandHandler = function () {
			$scope.reverseMoreLess =! $scope.reverseMoreLess;
			if($scope.reverseMoreLess){
				$scope.showMoreUserInfo=true;
			}else{
				$scope.showMoreUserInfo=false;
			}
		};

		$scope.content={};
		$scope.editUser = function (user,ev) {
			$scope.inpageReadPaneEdit=true;
			$scope.content=user;

			if($scope.content.accountEnabled==undefined)
			{
				$scope.content.accountEnabled=true;
				$scope.blockSignIn = !$scope.content.accountEnabled;
				$scope.blockSignInStat = 'No';
			}
			else if($scope.content.accountEnabled)
			{
				$scope.blockSignIn = !$scope.content.accountEnabled;
				$scope.blockSignInStat = 'No';
			}
			else
			{
				$scope.blockSignIn = !$scope.content.accountEnabled;
				$scope.blockSignInStat = 'Yes';
			}

		};

		$scope.userProfileDetails = {};
		$scope.userAdminProfileSubmit = function () {
			if(vm.userAdminProfileForm.$valid){
				//$http({
				//    method: 'POST',
				//    url: 'http://' + window.location.hostname + '/apis/media/image',
				//    headers: {
				//        'Content-Type': 'application/json'
				//    },
				//    data: {
				//        "type": $scope.productImgFileType,
				//        "class": "CCProductImage",
				//        "name": $scope.productImgFileName,
				//        "data": $scope.cropper.croppedImage
				//    }
				//}).then(function (response) {
				//    var path = response.data.data;
				//
				//    //Save profile logic
				//
				//}).error(function (response) {
				//});

				$scope.content.accountEnabled=!$scope.blockSignIn;
				$scope.content.streetAddress=$scope.content.officeLocation;
				$scope.content.userID=$scope.content.id;

				$http({
					method: 'POST',
					//url: 'http://'+window.location.hostname+':9000/invite/inviteUser',
					url: getBaseURL()+'/invite/updateUser',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer '+$scope.jwtToken
					},
					data: $scope.content
				})
					.then(function(response) {
						console.log(response);
						if(response.data.Result){
							// $mdToast.show(
							// 	$mdToast.simple()
							// 	.textContent('Shared Users Suceesfully!')
							// 	.position($scope.getToastPosition())
							// 	.hideDelay(3000)
							// 	);
							notifications.toast("Updated Successfully!", "success",3000);
							loaduser();
							$scope.inpageReadPaneEdit=false;
						}
						else{
							notifications.toast("Update details Failed!", "error",3000);
						}
						//$scope.updateSharedApps=false;
						//$mdDialog.hide();
					}, function(response) {
						console.log(response);
						//$scope.updateSharedApps=false;
					});

			}else{
				angular.element(document.querySelector('#userAdminProfileForm')).find('.ng-invalid:visible:first').focus();
			}
		};

		$scope.sortBy = function(propertyName,status,property) {

			$scope.users=$filter('orderBy')($scope.users, propertyName, $scope.reverse)
			$scope.reverse =!$scope.reverse;
			if(status!=null) {
				if(property=='NAME')
				{
					$scope.showName = status;
					$scope.showEmail = false;
				}
				if(property=='EMAIL')
				{
					$scope.showEmail = status;
					$scope.showName = false;
				}
			}
		};

		$scope.clearForm = function () {
			$scope.userProfileDetails = {};
			vm.userAdminProfileForm.$setPristine();
			vm.userAdminProfileForm.$setDirty();
		}

		$scope.cancelEdit = function () {
			if(vm.userAdminProfileForm.$dirty ){
				var confirm = $mdDialog.confirm()
					.title('Are you sure?')
					.textContent('Fields have changed and you might have unsaved data. Are you sure you want to leave this page?')
					.ariaLabel('Are you sure?')
					.targetEvent()
					.ok('Yes')
					.cancel('Stay');

				$mdDialog.show(confirm).then(function() {
					vm.userAdminProfileForm.$pristine = false;
					vm.userAdminProfileForm.$dirty = false;
					$scope.inpageReadPaneEdit=false;
					$scope.clearform();
				}, function() {
				});
			}else{
				$scope.inpageReadPaneEdit=false;
			}
		}

		//Image Uploader

		$scope.cropper = {};
		$scope.cropper.sourceImage = null;
		$scope.cropper.croppedImage = null;
		$scope.bounds = {};
		$scope.bounds.left = 0;
		$scope.bounds.right = 0;
		$scope.bounds.top = 0;
		$scope.bounds.bottom = 0;
		$scope.productImgFileName = "";
		$scope.productImgSrc = "";
		var files = [];

		$scope.triggerImgInput = function () {
			angular.element(document.querySelector('#profileImageInput')).trigger('click');
			angular.element(document.querySelector('#profileImageInput')).on('change', function () {
				files = this.files;

				if(files.length > 0) {
					$scope.productImgFileName = files[0].name;
					$scope.productImgFileType = files[0].type.split("/")[1];
					if($scope.productImgFileType == 'jpeg'){$scope.productImgFileType = "jpg";}
				}
			});
		}

		//$scope.$watch(function () {
		//    $scope.blockSignInStat = 'No';
		//});

		$scope.checkBlockSignStat = function () {
			if($scope.blockSignIn){
				$scope.blockSignIn=false;
				$scope.blockSignInStat = 'No';
				//$scope.content.accountEnabled=true;
			}else{
				$scope.blockSignIn=true;
				$scope.blockSignInStat = 'Yes';
				//$scope.content.accountEnabled=false;
			}
		};


		//Image Uploader
		//Kasun_Wijeratne_30_JAN_17===================================

		// Kasun_Wijeratne_4_OCT_2017
		function switchAdminPanel(section, title) {
			vm.activeInvoicePaneIndex = 1;
			$scope.activeSection = section;
			if(section == 'invite'){
				$scope.activeSectionIcon = 'group_add';
				$scope.activeSectionTitle = 'Invite user'
				vm.updateShareStep(0);
			}
			if(section == 'share'){
				$scope.activeSectionIcon = 'share';
				$scope.activeSectionTitle = 'Share apps';
				vm.updateShareStep(0);
			}
			if(section == 'invitations'){
				loadInvitationLogs();
				$scope.activeSectionIcon = 'recent_actors';
				$scope.activeSectionTitle = 'My invitations';
			}
		}

		function updateShareStep(section) {
			if(section == 1){
				if($scope.shareStepOneDone){
					$scope.activeShareStep = section;
				}
			}else{
				$scope.activeShareStep = section;
			}
		}


		// Kasun_Wijeratne_4_OCT_2017 - END
	}
})();
