(function app() {
  'use strict';

  /* eslint-disable no-param-reassign */

  var angularApp = angular.module('myApp', []); // eslint-disable-line no-undef

  angularApp .controller(
    'myCtrl',
    [
      '$scope', '$http', '$location',
      function ctrller($scope, $http, $location) {
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
            name: 'sadness',
            selected: false,
          },
        ];

        $scope.currentCardIndexPlaying = {
          state: 'none',
        };

        $scope.cards = 'loading';
        $scope.selectedFilter = localStorage.getItem('selectedFilter');
        $scope.dateSortOrder = localStorage.getItem('dateSortOrder');
        $location.path('/' + $scope.selectedFilter.slice(42));

        $scope.$on('$locationChangeSuccess', function () {
          const sentiment = $location.path().slice(1);
          var urlUpdateFlag = false;
          $location.hash('');
          $scope.filters.forEach(function loopEach(filter) {
            if (sentiment === filter.name) {
              $scope.selectedFilter = '-' + 'enriched_lyrics.emotion.document.emotion.' + sentiment;
              localStorage.setItem('selectedFilter', $scope.selectedFilter);
              urlUpdateFlag = true;
            }
          });

          if (!urlUpdateFlag) {
            $scope.selectedFilter = localStorage.getItem('selectedFilter');
            $location.path('/' + $scope.selectedFilter.slice(42));
          }
        });

        $http.get('http://' + $location.host() + ':' + $location.port() + '/api/getWatsonData')
          .then(function gotResponse(response) {
            $scope.cards = response.data.results;
          })
          .catch(function errorOnGet(error) {
            $scope.cards = error;
          });

        $scope.handleCardClick = function handleCardClick() {
          if (this.card.selected) {
            this.card.selected = false;
          }
          else {
            this.card.selected = true;

            $scope.cards.forEach(function loopEach(card) {
              if (card !== this.card) {
                card.selected = false;
              }
            }.bind(this));
          }
        };

        $scope.clickBlank = function clickBlank($event) {
          if ($event.target.id === 'cards-background' || $event.target.id === 'cards-list' || $event.target.id === 'cards-nav') {
            $scope.cards.forEach(function loopEach(card) {
              card.selected = false;
            });
          }
        };


        $scope.handleControlClick = function handleControlClick(order) {
          var landing = document.querySelector('.landing--experience');
          $location.path('/' + this.filter.name);
          $scope.selectedFilter = order+'enriched_lyrics.emotion.document.emotion.'+this.filter.name; // eslint-disable-line space-infix-ops
          landing.style.opacity = 0;
          localStorage.setItem('selectedFilter', $scope.selectedFilter);
          window.setTimeout(function timeOut() {
            landing.style.display = 'none';
          }, 500);
        };

        $scope.isControlFilterSelected = function isControlFilterSelected(filter) {
          return $scope.selectedFilter.includes(filter.name);
        };

        $scope.isSortFilterIsSelected = function isSortFilterSelected(order) {
          if (order === '') {
            return order === $scope.dateSortOrder;
          }

          return $scope.dateSortOrder.includes(order);
        };

        $scope.characterFilter = function characterFilter(filterString) {
          if (filterString) {
            return filterString.replace('&amp;', ' ').replace('lrm;&ndash;', ' ').replace('auml;th', ' ').replace('fuck', 'f***').replace('Fuck', 'F***');
          }

          return undefined;
        };

        $scope.sortByDate = function sortByDate(order) {
          $scope.dateSortOrder = order + 'year';
          localStorage.setItem('dateSortOrder', $scope.dateSortOrder);
        };

        $scope.getImageName = function getImageName(name) {
          return 'images/' + name + '.svg';
        };

        $scope.spinCardVinyl = function spinCardVinyl(card) {
          if (card.playing === undefined || card.playing === false) {
            card.playing = true;
          }
          else {
            card.playing = false;
          }

          if (JSON.stringify($scope.currentCardIndexPlaying) === JSON.stringify(card)) {
            $scope.currentCardIndexPlaying = {
              state: 'none',
            };
          }
          else {
            $scope.currentCardIndexPlaying.playing = false;
            $scope.currentCardIndexPlaying = card;
          }
        };
      },
    ]
  );
}());
