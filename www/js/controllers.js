angular.module('starter.controllers', [])

.controller('FolderCtrl', function($scope, $stateParams, $rootScope, $ionicPlatform, $sce, Folders, ArticleService) {

  console.log('folderCurrentPage='+ $rootScope.folderCurrentPage);


  //var defaultFatherId = $stateParams.folderId;
  $scope.islastFolder = false;
  //$scope.titleName = '';
  $scope.noMoreAvailable = false;
  $rootScope.folderCurrentPage = 1;
  console.log('folderCurrentPage set='+ $rootScope.folderCurrentPage);
  var supModule = $stateParams.supModuleName;

  var module = $stateParams.moduleName;
  var subModule = $stateParams.subModuleName;
  console.log('supModule='+ supModule + '. module='+ module + '. subModule='+ subModule);

  //var db1；
  /*$ionicPlatform.ready(function(){
    dbService.setup();
  });*/
  //document.addEventListener("deviceready", onDeviceReady, false);

    // device APIs are available
    //
    //function onDeviceReady() {
        //var db = window.openDatabase("test.db", "1.0", "Cordova Demo", 200000);
        //db.transaction(populateDB, errorCB, successCB);
        //db1 = window.sqlitePlugin.openDatabase({name: "test.db"})
    //};
  //console.log("db=====" + db);
  $scope.getModule =function(){
    //console.log("db=" + db);
    //dbService.setup();
    //dbService.getModule(supModule, module, subModule);
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
    });
  };
  $scope.getModule();

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

  $scope.search = function($event,query){
    console.log('search val=' + query);
    if(query == undefined || query == ''){
      $scope.islastFolder = false;
      if (subModule !== '') {//最后一级目录，直接加载文章
        $scope.islastFolder = true;
        $rootScope.folderCurrentPage = 1;
        ArticleService.getArticleList(supModule,module,subModule, $rootScope.folderCurrentPage).then(function(data){
            $scope.articles = data;
            if (data.length == 0) {
              $scope.noMoreAvailable = true;
            };
        },function(){
            $scope.noMoreAvailable = true;
        });
        return;
      }
      if (module !== '') {//二级目录
        $rootScope.folderCurrentPage = 1;
        $scope.getModule();
        return;
      }
      return;
    }
    if ($event.keyCode !== 13) {//非搜索按钮，则返回
      return;
    };
    ArticleService.search(query).then(function(data){

      $scope.articles = data;
      $scope.searchFlag = true;

      $scope.islastFolder = true;
      console.log(data);
    });
  };

  $scope.$on('$stateChangeSuccess', function() {
    //console.log("change");
    //$scope.getModule();
  });
})

/**
  * 转成标准的html格式
  **/
.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}])

.controller('ArticleCtrl', function($scope, $ionicLoading, $ionicPopup, ArticleService) {

  $scope.lastPosition = "";
  $scope.noMoreAvailable = false;
  $scope.showAlert = function() {
       var alertPopup = $ionicPopup.alert({
         title: '网络异常',
         template: '请检查你的网络！'
       });
       alertPopup.then(function(res) {
         console.log(res);
       });
  };

  $scope.showServiceAlert = function() {
       var alertPopup = $ionicPopup.alert({
         title: '服务异常',
         template: '服务异常！'
       });
       alertPopup.then(function(res) {
         console.log(res);
       });
  };

  //$scope.article = {};
  $ionicLoading.show({
      template: "正在加载..."
  });
  ArticleService.getArticle($scope.lastPosition).then(function(data){
    //$scope.article = data;
    console.log(data.lastPosition);
    $scope.lastPosition = data.lastPosition;
    $ionicLoading.hide();
    if ($scope.lastPosition !== '-1') {
        $scope.loadMore($scope.lastPosition);
    };
  },function(err){
      if (err == "FAIL") {
        $scope.showServiceAlert();
      }else{
        $scope.showAlert();
      }
      $ionicLoading.hide();
  });

  $scope.loadMore = function(){
    console.log("--loadMore--" + $scope.lastPosition);
    //alert($scope.lastPosition);
    ArticleService.getArticle($scope.lastPosition).then(function(data){
      //console.log($scope.article.tBt);
      console.log(data.tZw.length);
      $scope.article.tZw.concat(data.tZw);
      //$scope.article = $scope.article.concat(data);
      console.log(data.lastPosition);
      $scope.lastPosition = data.lastPosition;
      //$ionicLoading.hide();
      //$scope.$broadcast('scroll.infiniteScrollComplete');
      if ($scope.lastPosition !== '-1') {
        $scope.loadMore($scope.lastPosition);
      };
    },function(err){
        if (err == "FAIL") {
          $scope.showServiceAlert();
        }else{
          $scope.showAlert();
        }
        $ionicLoading.hide();
    });

  };
})


.controller('LawsCtrl', function($scope, $stateParams, $rootScope, Folders, ArticleService) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  //console.log($stateParams);
  console.log('lawsCurrentPage='+ $rootScope.lawsCurrentPage);

  var supModule = $stateParams.supModuleName;

  var module = $stateParams.moduleName;
  var subModule = $stateParams.subModuleName;

  //var defaultFatherId = '';
  $scope.islastFolder = false;
  //$scope.titleName = '';
  $scope.noMoreAvailable = false;
  $rootScope.lawsCurrentPage = 1;

  $scope.getModule =function(){
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
  };
  $scope.getModule();

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

  $scope.search = function($event,query){
    //console.log('val=', query);
    console.log('laws search val=', query);
    if(query == undefined || query == ''){
      $scope.islastFolder = false;
      if (subModule !== '') {//最后一级目录，直接加载文章
        $scope.islastFolder = true;
        $rootScope.folderCurrentPage = 1;
        ArticleService.getArticleList(supModule,module,subModule, $rootScope.folderCurrentPage).then(function(data){
            $scope.articles = data;
            if (data.length == 0) {
              $scope.noMoreAvailable = true;
            };
        },function(){
            $scope.noMoreAvailable = true;
        });
        return;
      }
      if (module !== '') {//二级目录
        $rootScope.folderCurrentPage = 1;
        $scope.getModule();
        return;
      }
      return;
    }
    if ($event.keyCode !== 13) {//非搜索按钮，则返回
      return;
    };
    ArticleService.search(query).then(function(data){

      $scope.articles = data;
      $scope.searchFlag = true;

      $scope.islastFolder = true;
      console.log(data);
    });
  };
})

.controller('AccountCtrl', function($scope,$rootScope, $ionicPopup, $ionicLoading, $ionicPopover, $timeout,appConfig) {
  $scope.settings = {
    enableFriends: true
  };

  $scope.useCache = $rootScope.useCache;
  $scope.versionName = $rootScope.versionName;
  console.log("$rootScope.versionName:" + $rootScope.versionName);

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
  var template = '<ion-popover-view style="height: 50px"><ion-content><ion-list><ion-item>邮箱：vip@bxsoft.cn</ion-item></ion-list></ion-content></ion-popover-view>';

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

  $scope.logout = function() {
    ionic.Platform.exitApp();
  };

  $scope.downloadData = function() {
    var downloadPopup = $ionicPopup.show({
      template: '正在研发...',
      title: '同步云端数据'
    });
    downloadPopup.then(function(res) {
      console.log('downloadData!'+ res);
    });
    $timeout(function() {
      downloadPopup.close(); //close the popup after 3 seconds for some reason
    }, 2000);
  };

  $scope.update = function() {
    var updatePopup = $ionicPopup.show({
      template: '正在检查...',
      title: '检查版本'
    });
    updatePopup.then(function(res) {
      $ionicLoading.show({
        template: "已是最新版本"
      });
      console.log('update!'+ res);
      $timeout(function() {
        $ionicLoading.hide();
      }, 1000);
    });
    $timeout(function() {
      updatePopup.close(); //close the popup after 3 seconds for some reason
    }, 2000);
  };
});
