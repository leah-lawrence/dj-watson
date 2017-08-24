(function app() {
  'use strict';

  /* eslint-disable no-param-reassign */

  var angularApp = angular.module('myApp', []); // eslint-disable-line no-undef

  angularApp .controller(
    'myCtrl',
    [
      '$scope', '$http', '$location',
      function ($scope, $http, $location) {
        $scope.activeControl = null;
        $scope.filters = [
          {
            name: 'anger',
            selected: false,
          },
          {
            name: 'joy',
            selected: false,
          },
          {
            name: 'sad',
            selected: false,
          },
        ];

        $scope.cards = 'loading';
        $http.get($location.absUrl() + '/api/getWatsonData')
          .then(function gotResponse(response) {
            $scope.cards = response.data.results;
          })
          .catch(function errorOnGet(error) {
            $scope.cards = error;
          });

        $scope.handleCardClick = function handleCardClick() {
          this.card.selected = true;

          // $scope.cards.forEach(function(card) {
          //   if (card != this.card) {
          //     card.selected = false;
          //   }
          // }.bind(this));
        };

        $scope.handleControlClick = function handleControlClick() {
          this.filter.selected = true;

          // $scope.filters.forEach(function(filter) {
          //   if (filter != this.filter) {
          //     filter.selected = false;
          //   }
          // }.bind(this))
        };
      }
    ]
  );
}());
