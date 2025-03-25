angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-salaries.entities.SalaryItemDirection';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-salaries/gen/codbex-salaries/api/entities/SalaryItemDirectionService.ts";
	}])
	.controller('PageController', ['$scope',  'Extensions', 'messageHub', 'entityApi', function ($scope,  Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "SalaryItemDirection Details",
			create: "Create SalaryItemDirection",
			update: "Update SalaryItemDirection"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-salaries-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "entities" && e.view === "SalaryItemDirection" && e.type === "entity");
		});

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Direction
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.action = 'update';
			});
		});


		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("SalaryItemDirection", `Unable to create SalaryItemDirection: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("SalaryItemDirection", "SalaryItemDirection successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Direction, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("SalaryItemDirection", `Unable to update SalaryItemDirection: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("SalaryItemDirection", "SalaryItemDirection successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};
		
		//-----------------Dialogs-------------------//
		

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//


		//----------------Dropdowns-----------------//	
		

	}]);