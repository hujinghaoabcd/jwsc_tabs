// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($rootScope,$ionicPlatform) {
  $ionicPlatform.ready(function() {
    $rootScope.baseUrl = "http://192.168.1.103:8080";
    $rootScope.baseUrlImg = "http://192.168.1.103:8080";
    $rootScope.folderCurrentPage = 1;
    $rootScope.lawsCurrentPage = 1;
    $rootScope.useCache = false;//是否使用缓存
    
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.folder', {
    url: '/folder/:folderId',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-folder.html',
        controller: 'FolderCtrl'
      }
    }
  })

  .state('tab.article', {
    url: '/articles/:articleId',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-article.html',
        controller: 'ArticleCtrl'
      }
    }
  })

  .state('tab.laws', {
      url: '/laws/:folderId',
      views: {
        'tab-laws': {
          templateUrl: 'templates/tab-laws.html',
          controller: 'LawsCtrl'
        }
      }
    })
  .state('tab.lawsArticle', {
      url: '/lawsArticle/:articleId',
      views: {
        'tab-laws': {
          templateUrl: 'templates/laws-article.html',
          controller: 'ArticleCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/folder/6');

});
