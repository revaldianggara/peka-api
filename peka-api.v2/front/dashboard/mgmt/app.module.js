(function () {
  "use strict";

  angular.module("app", [
      // Angular modules
      "ngRoute",
      "ngAnimate",
      "ngAria",
      "ngMaterial",
      "ng-scroll-end",
      'ng-slide-down',

      // 3rd Party Modules
      "ui.bootstrap",
      'duScroll',

      // Custom modules
      "app.nav",
      "chart.js",
      "layerControl",
      'mapService_webgis',
      'mapService_datainput',
      'angularFileUpload'
    ])
    .config(function ($mdThemingProvider) {
      // $mdThemingProvider.theme('default')
      //   .primaryPalette('grey', {
      //     'default': '300',
      //     'hue-1': '500',
      //     'hue-2': '200',
      //   });
      $mdThemingProvider.theme('predHS')
        .primaryPalette('yellow', {
          'default': '700'
        });
      $mdThemingProvider.theme('HS')
        .primaryPalette('red', {
          'default': '800'
        });
      $mdThemingProvider.theme('Veg')
        .primaryPalette('green', {
          'default': '600'
        });
      $mdThemingProvider.alwaysWatchTheme(true);
    });
})();