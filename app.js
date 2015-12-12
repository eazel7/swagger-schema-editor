angular.module('APP', [])

.directive('schema', function () {
	return {
		restrict: "E",
		replace: true,
		scope: {
			schema: '=',
      schemas: '=',
      target: '='
		},
    templateUrl: 'schema.html'
	}
})

.directive('field', function ($compile, $templateCache) {
	return {
		restrict: "E",
		replace: true,
		scope: {
      target: '=',
			property: '=',
      propertyName: '=',
      schemas: '='
		},
		templateUrl: 'field.html',
    controllerAs: 'ctrl',
    controller: function ($scope) {
      this.isUndefined = function () {
        if (!$scope.target || !$scope.propertyName) return true;

        return ($scope.target[$scope.propertyName] === undefined);
      };
			this.hasError = function () {
				if ($scope.property &&
						$scope.propertyName &&
					  $scope.property.enum &&
						$scope.target &&
					  ($scope.target[$scope.propertyName] !== null && $scope.target[$scope.propertyName] !== undefined)) {
					return $scope.property.enum.indexOf($scope.target[$scope.propertyName]) === -1;
				}
			};
      this.defaultValue = function () {
        if (!$scope.property.type) return;

        return {
          'object': {},
          'number': 0,
          'string': ''
        }[$scope.property.type];
      }
    },
		link: function (scope, element, attrs) {
      scope.$watch(function () {
        if (scope.property &&
            scope.schemas &&
            scope.property.type === 'object' &&
            scope.property.$ref) {
          return scope.schemas[scope.property.$ref.slice(14)];
        }
      },
      function (fieldSchema) {
        if (fieldSchema) {
          var html = $templateCache.get('schema.html');
          var se;


          scope.$watch(
            'target[propertyName]',
            function (subtarget) {
              if (subtarget !== null &&
                  subtarget !== undefined) {
                se = $(html);
                element.append(se);
                var childScope = scope.$new(true);
                angular.extend(childScope, {
                  schema: fieldSchema,
                  target: subtarget
                });

                $compile(element.contents())(childScope);
              } else if (se) {
                se.remove();
              }
            });
        }
      });
		}
	}
})

.controller('IndexCtrl', function ($scope) {
	$scope.schemas = {
    'MainForm': {
      'type': 'object',
      'properties': {
        'text1': {
          'type': 'string',
          'summary': 'Text 1'
        },
        'number1': {
          'type': 'number',
          'summary': 'Number 1'
        },
        'object1': {
          'type': 'object',
          'summary': 'Object 1',
          '$ref': '#/definitions/SubForm'
        }
      }
    },
    'SubForm': {
      'type': 'object',
      'properties': {
        'option1': {
          'type': 'string',
          'summary': 'Options 1',
					'enum': [
						'green',
						'red',
						'blue'
					]
        },
        'number2': {
          'type': 'number',
          'summary': 'Number 2'
        }
      }
    }
  };
  $scope.target = {
    'text1': 'sample',
    'number1': 4,
    'object1': {
      'option1': 'orange',
      'number2': 420
    }
  };
});
