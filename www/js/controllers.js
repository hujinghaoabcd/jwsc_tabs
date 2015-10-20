angular.module('starter.controllers', [])

.controller('FolderCtrl', function($scope, $stateParams, $rootScope, Folders, ArticleService) {
  console.log($stateParams);
  console.log('folderCurrentPage='+ $rootScope.folderCurrentPage);
  
  //var defaultFatherId = $stateParams.folderId;
  $scope.islastFolder = false;
  //$scope.titleName = '';
  $scope.noMoreAvailable = false;
  $rootScope.folderCurrentPage = 1;
  var supModule = $stateParams.supModuleName;

  var module = $stateParams.moduleName;
  var subModule = $stateParams.subModuleName;

  Folders.getFolderList(supModule, module, subModule).then(function(data){
    $scope.modules = data;  
    console.log(data);
    if (data.length == 0) {
      $scope.islastFolder = true;
      ArticleService.getArticleList(supModule,module,subModule, $rootScope.folderCurrentPage).then(function(data){
          $scope.articles = data;  
          if (data.length == 0) {
            $scope.noMoreAvailable = true;
          };
          //$scope.hide();
      },function(){
          $scope.noMoreAvailable = true;
          //$scope.hide();
          //$scope.showAlert();
      });
    };
    //$scope.hide();
  },function(){
    //$scope.noMoreAvailable = true;
    //$scope.hide();
    //$scope.showAlert();
  });
  //console.log($scope.islastFolder);

  $scope.doRefresh = function(){
    console.log("刷新");
    //$scope.show();
    $rootScope.folderCurrentPage = 1;
    $scope.noMoreAvailable = false;
    ArticleService.getArticleList(supModule,module,subModule, $rootScope.folderCurrentPage).then(function(data) {
      $scope.articles = data;
      if (data.length == 0) {
        $scope.noMoreAvailable = true;
      }; 
      //$scope.hide();    
      $scope.$broadcast('scroll.refreshComplete');
    },function(){
      //$scope.hide();
      //$scope.showAlert();
      $scope.noMoreAvailable = true;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.loadMore = function(){
    console.log("下一页");
    //$scope.show();
    var currentPage = $rootScope.folderCurrentPage;
    $rootScope.folderCurrentPage =  currentPage + 1;
    ArticleService.getArticleList(supModule,module,subModule, $rootScope.folderCurrentPage).then(function(data){
      console.log('$scope.articles='+$scope.articles);
      $scope.articles = $scope.articles.concat(data);
      if (data.length == 0) {
        $scope.noMoreAvailable = true;
      };
      //$scope.hide(); 
      //console.log($scope.noMoreAvailable);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    },function(){
      $scope.noMoreAvailable = true;
      //$scope.hide();
      //$scope.showAlert();
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.search = function(query){   
    //console.log('val=', query);  
    var path = ''; 
    ArticleService.search(query, supModule,module,subModule).then(function(data){
      $scope.islastFolder = false;
      $scope.articles = data;
    });
  };
})

.controller('ArticleCtrl', function($scope, $ionicLoading, $ionicPopup, ArticleService) {

  $scope.showAlert = function() {
       var alertPopup = $ionicPopup.alert({
         title: '网络异常',
         template: '请检查你的网络！'
       });
       alertPopup.then(function(res) {
         console.log(res);
       });
  };

  $scope.article = {};  
  ArticleService.getArticle().then(function(data){
    $scope.article = data;
  },function(){
      $scope.showAlert();
    });
})


.controller('LawsCtrl', function($scope, $stateParams, $rootScope, Folders, ArticleService) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  console.log($stateParams);
  console.log('lawsCurrentPage='+ $rootScope.lawsCurrentPage);

  var supModule = $stateParams.supModuleName;

  var module = $stateParams.moduleName;
  var subModule = $stateParams.subModuleName;

  //var defaultFatherId = '';
  $scope.islastFolder = false;
  //$scope.titleName = '';
  $scope.noMoreAvailable = false;
  $rootScope.lawsCurrentPage = 1;

  Folders.getFolderList(supModule, module, subModule).then(function(data){
    $scope.modules = data;  
    console.log(data);
    if (data.length == 0) {
      $scope.islastFolder = true;
      ArticleService.getArticleList(supModule,module,subModule, $rootScope.lawsCurrentPage).then(function(data){
          $scope.articles = data;  
          if (data.length == 0) {
            $scope.noMoreAvailable = true;
          };
          //$scope.hide();
      },function(){
          $scope.noMoreAvailable = true;
          //$scope.hide();
          //$scope.showAlert();
      });
    };
    //$scope.hide();
  },function(){
    //$scope.noMoreAvailable = true;
    //$scope.hide();
    //$scope.showAlert();
  });
  //console.log($scope.islastFolder);

  $scope.doRefresh = function(){
    console.log("刷新");
    //$scope.show();
    $rootScope.lawsCurrentPage = 1;
    $scope.noMoreAvailable = false;
    ArticleService.getArticleList(supModule,module,subModule, $rootScope.lawsCurrentPage).then(function(data) {
      $scope.articles = data;
      if (data.length == 0) {
        $scope.noMoreAvailable = true;
      }; 
      //$scope.hide();    
      $scope.$broadcast('scroll.refreshComplete');
    },function(){
      //$scope.hide();
      //$scope.showAlert();
      $scope.noMoreAvailable = true;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.loadMore = function(){
    console.log("下一页");
    //$scope.show();
    var currentPage = $rootScope.lawsCurrentPage;
    $rootScope.lawsCurrentPage =  currentPage + 1;
    ArticleService.getArticleList(supModule,module,subModule, $rootScope.lawsCurrentPage).then(function(data){
      $scope.articles = $scope.articles.concat(data);
      if (data.length == 0) {
        $scope.noMoreAvailable = true;
      };
      //$scope.hide(); 
      //console.log($scope.noMoreAvailable);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    },function(){
      $scope.noMoreAvailable = true;
      //$scope.hide();
      //$scope.showAlert();
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.search = function(query){   
    //console.log('val=', query);   
     
    ArticleService.search(query, supModule,module,subModule).then(function(data){
      $scope.islastFolder = false;
      $scope.articles = data;
    });
  };
})

.controller('AccountCtrl', function($scope,$rootScope, $ionicPopup, $ionicPopover, $timeout) {
  $scope.settings = {
    enableFriends: true
  };

  $scope.useCache = $rootScope.useCache;

   $scope.clean = function(){   
     var myPopup = $ionicPopup.show({
      template: '正在清除缓存...',
      title: '清除缓存'
    });
    myPopup.then(function(res) {
      console.log('clean!', res);
    });
    $timeout(function() {
      myPopup.close(); //close the popup after 3 seconds for some reason
    }, 3000);
  };

  $scope.setCache = function(){
    console.log($scope.useCache);
    if (!$scope.useCache) {
      $rootScope.useCache = true;
    }else{
      $rootScope.useCache = false;
    };
  };

  $scope.now = new Date();

  // .fromTemplate() method
  var template = '<ion-popover-view style="height: 180px"><ion-content><ion-list><ion-item>客服：180-1868-3313</ion-item><ion-item>微信：Huang_Benz</ion-item><ion-item>QQ：419212048</ion-item></ion-list></ion-content></ion-popover-view>';

  $scope.popover = $ionicPopover.fromTemplate(template, {
    scope: $scope
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
});
