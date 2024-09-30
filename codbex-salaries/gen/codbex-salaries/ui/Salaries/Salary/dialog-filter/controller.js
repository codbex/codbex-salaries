angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-salaries.Salaries.Salary';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.StartDateFrom) {
				params.entity.StartDateFrom = new Date(params.entity.StartDateFrom);
			}
			if (params?.entity?.StartDateTo) {
				params.entity.StartDateTo = new Date(params.entity.StartDateTo);
			}
			if (params?.entity?.EndDateFrom) {
				params.entity.EndDateFrom = new Date(params.entity.EndDateFrom);
			}
			if (params?.entity?.EndDateTo) {
				params.entity.EndDateTo = new Date(params.entity.EndDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsEmployee = params.optionsEmployee;
			$scope.optionsCurrency = params.optionsCurrency;
			$scope.optionsSalaryStatus = params.optionsSalaryStatus;
			$scope.optionsJobRole = params.optionsJobRole;
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id !== undefined) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Employee !== undefined) {
				filter.$filter.equals.Employee = entity.Employee;
			}
			if (entity.Currency !== undefined) {
				filter.$filter.equals.Currency = entity.Currency;
			}
			if (entity.SalaryStatus !== undefined) {
				filter.$filter.equals.SalaryStatus = entity.SalaryStatus;
			}
			if (entity.StartDateFrom) {
				filter.$filter.greaterThanOrEqual.StartDate = entity.StartDateFrom;
			}
			if (entity.StartDateTo) {
				filter.$filter.lessThanOrEqual.StartDate = entity.StartDateTo;
			}
			if (entity.EndDateFrom) {
				filter.$filter.greaterThanOrEqual.EndDate = entity.EndDateFrom;
			}
			if (entity.EndDateTo) {
				filter.$filter.lessThanOrEqual.EndDate = entity.EndDateTo;
			}
			if (entity.JobRole !== undefined) {
				filter.$filter.equals.JobRole = entity.JobRole;
			}
			if (entity.Gross !== undefined) {
				filter.$filter.equals.Gross = entity.Gross;
			}
			if (entity.Net !== undefined) {
				filter.$filter.equals.Net = entity.Net;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			messageHub.postMessage("clearDetails");
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("Salary-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);