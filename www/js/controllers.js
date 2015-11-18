angular.module('starter.controllers', [])

.controller('TabCtrl',function($scope,$ionicTabsDelegate){

  $scope.onFolderSelect = function(index){
    /*console.log(this);
    console.log(this.title);
    console.log(this.href);
    console.log(this.$$childHead);
    console.log(this.child);*/
    /*alert($rootScope.query);
    if ($rootScope.query == undefined) {
      return;
    };*/
    //$ionicHistory.goBack(-1);
    //$scope.islastFolder = false;
    //$urlRouterProvider.otherwise('/tab/folder/执法工作手册//');
    //$ionicTabsDelegate.select(index);
    //window.location.reload(true);
  }

  $scope.onTabDeselected = function(){
    //console.log(this);
    //window.location.reload(true);
  }

  $scope.onLawsSelect = function(index){
    //$ionicTabsDelegate.select(index);
  }

})

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
  $rootScope.supModule = supModule;//用于选择tab的时候返回目录
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
    //console.log("$scope.query=" + $scope.query);
    //$scope.query = "111";
    //console.log(supModule + "---" +module + "---" +subModule);
    Folders.getFolderList(supModule, module, subModule).then(function(data){
      $scope.modules = data;
      console.log("modulesData=" + data);
      if (data.length == 0) {
        $scope.islastFolder = true;
        ArticleService.getArticleList(supModule,module,subModule, $rootScope.folderCurrentPage).then(function(data){
            $scope.articles = data;
            //console.log("articlesData=" + data);
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

  $scope.doRefresh = function(){
    //console.log("刷新");
    //$scope.show();
    //console.log("searchFlag=" + $scope.searchFlag)
    if ($scope.searchFlag) {
      //$scope.noMoreAvailable = true;
      $scope.$broadcast('scroll.refreshComplete');
      return;
    };
    //console.log("1");
    $rootScope.folderCurrentPage = 1;
    $scope.noMoreAvailable = false;
    $scope.getModule();
    /*ArticleService.getArticleList(supModule,module,subModule, $rootScope.folderCurrentPage).then(function(data) {
      if (data.length == 0) {
        $scope.noMoreAvailable = true;
      };
      console.log(data.length);
      console.log("1");
    },function(){
      console.log("2");
      $scope.noMoreAvailable = true;
    });*/
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.loadMore = function(){
    //console.log("下一页");
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

  $scope.searchData = {'query':''};
  $scope.search = function($event){
    //console.log('search val=' + $scope.searchData.query);
    if($scope.searchData.query == undefined || $scope.searchData.query == ''){
      $scope.searchFlag = false;
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
    ArticleService.search($scope.searchData.query).then(function(data){

      $scope.articles = data;
      $scope.searchFlag = true;

      $scope.islastFolder = true;
      //console.log(data);
    });
    //$rootScope.query= query;
  };

  
  $scope.isCleanButton = false;
  $scope.focus = function(){
    $scope.isCleanButton = true;
    $scope.islastFolder = false;
    $scope.searchFlag = false;
  };

  $scope.onblur = function(){
    //$scope.isCleanButton = false;
    //$scope.searchData.query = "";
  };

  $scope.clearSearch = function(){
    $scope.isCleanButton = false;
    $scope.islastFolder = false;
    $scope.searchFlag = false;
    $scope.searchData.query = "";
    //$scope.getModule();
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
    //console.log("query="+$scope.searchData.query);
  };

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    //console.log("foler change");
    //console.log(toState);
    //console.log(toParams);
    //console.log(fromState);
    //console.log(fromParams);
    //$scope.query = "222";
    console.log("foler stateChangeSuccess");
    //$scope.islastFolder = false;
    //$scope.searchFlag = false;
    //supModule = "执法工作手册";
    //module = ""; 
    //subModule = "";
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
         //console.log(res);
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
    $scope.article = data;
    //console.log(data.lastPosition);
    $scope.lastPosition = data.lastPosition;
    $ionicLoading.hide();
    if ($scope.lastPosition !== -1) {
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
    //console.log("--loadMore--" + $scope.lastPosition);
    //alert($scope.lastPosition);
    ArticleService.getArticle($scope.lastPosition).then(function(data){
      //console.log($scope.article.tBt);
      //console.log(data.tZw.length);
      $scope.article.tZw += data.tZw;
      //console.log(data.lastPosition);
      $scope.lastPosition = data.lastPosition;
      if ($scope.lastPosition !== -1) {
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
  //console.log('lawsCurrentPage='+ $rootScope.lawsCurrentPage);

  var supModule = $stateParams.supModuleName;

  var module = $stateParams.moduleName;
  var subModule = $stateParams.subModuleName;

  $scope.islastFolder = false;
  $scope.noMoreAvailable = false;
  $rootScope.lawsCurrentPage = 1;

  $scope.getModule =function(){
    //console.log("111111111--"+ supModule + "---" +module + "---" +subModule);
    Folders.getFolderList(supModule, module, subModule).then(function(data){
      $scope.modules = data;
      //console.log(data);
      //console.log(data.length);
      if (data.length == 0) {
        $scope.islastFolder = true;
        //console.log('lawsCurrentPage='+ $rootScope.lawsCurrentPage);
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
    //console.log("刷新");
    //$scope.show();
    //console.log($scope.searchFlag);
    if ($scope.searchFlag) {
      //$scope.noMoreAvailable = true;
      $scope.$broadcast('scroll.refreshComplete');
      return;
    };
    $rootScope.lawsCurrentPage = 1;
    $scope.noMoreAvailable = false;
    $scope.getModule();
    /*ArticleService.getArticleList(supModule,module,subModule, $rootScope.lawsCurrentPage).then(function(data) {
      $scope.articles = data;
      if (data.length == 0) {
        $scope.noMoreAvailable = true;
      };
      
    },function(){
      //$scope.hide();
      //$scope.showAlert();
      $scope.noMoreAvailable = true;
    });*/
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.loadMore = function(){
    //console.log("下一页");
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

  $scope.searchData = {'query':''};
  $scope.search = function($event){
    //console.log('laws search val=', $scope.searchData.query);
    if($scope.searchData.query == undefined || $scope.searchData.query == ''){
      $scope.searchFlag = false;
      $scope.islastFolder = false;
      if (subModule !== '') {//最后一级目录，直接加载文章
        $scope.islastFolder = true;
        $rootScope.lawsCurrentPage = 1;
        ArticleService.getArticleList(supModule,module,subModule, $rootScope.lawsCurrentPage).then(function(data){
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
        $rootScope.lawsCurrentPage = 1;
        $scope.getModule();
        return;
      }
      return;
    }
    if ($event.keyCode !== 13) {//非搜索按钮，则返回
      return;
    };
    ArticleService.search($scope.searchData.query).then(function(data){

      $scope.articles = data;
      $scope.searchFlag = true;

      $scope.islastFolder = true;
      //console.log(data);
    });
  };

  $scope.isCleanButton = false;
  $scope.focus = function(){
    $scope.isCleanButton = true;
    $scope.islastFolder = false;
    $scope.searchFlag = false;
  };

  $scope.onblur = function(){

  };

  $scope.clearSearch = function(){
    $scope.isCleanButton = false;
    
    $scope.searchFlag = false;
    $scope.searchData.query = "";
    if (subModule !== '') {//最后一级目录，直接加载文章
        $scope.islastFolder = true;
        $rootScope.lawsCurrentPage = 1;
        ArticleService.getArticleList(supModule,module,subModule, $rootScope.lawsCurrentPage).then(function(data){
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
      $rootScope.lawsCurrentPage = 1;
      $scope.getModule();
      return;
    }
    $scope.islastFolder = false;
  };

  $scope.$on('$stateChangeSuccess', function() {
    console.log("laws stateChangeSuccess");
    //$scope.islastFolder = false;
    //$scope.searchFlag = false;
    //supModule = "常用法律法规";
    //module = ""; 
    //subModule = "";
    //$scope.getModule();
  });
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
      window.localStorage.clear();
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

  function confirmPopup(){
    var confirmPopup = $ionicPopup.confirm({  
        title: '<strong>退出应用</strong>',  
        template: '你确定要退出应用吗？',  
        okText: '退出',  
        cancelText: '取消'  
    });  

    confirmPopup.then(function (res) {  
        if (res) {  
            ionic.Platform.exitApp();  
        } else {  
            // Don't close  
        }  
    });
  }
  $scope.logout = function() {
    //ionic.Platform.exitApp();
    confirmPopup();
  };

  $scope.downloadData = function() {
    //TODO
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
    //TODO
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
})

.controller('InterfaceCtrl',function($scope,$http,$ionicLoading,$rootScope,Folders,ArticleService,LogsService,UpdateService,appConfig){

  $scope.getModule = function(){
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/module";
    $scope.requestParams = "supModule=执法工作手册"
    Folders.getFolderList("执法工作手册", "", "").then(function(data){
      $scope.result = data;
      $scope.status = data.status;
      $scope.errorMsg = data.message;
      console.log("modulesData=" + data);
      //$scope.hide();
    },function(err){
      $scope.result = err;
    });
  };

  $scope.getArticleList = function(){
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/doclist";
    $scope.requestParams = "supLm=执法工作手册，lm=社区民警执法手册，subLm=''，pageNo=1";
    $http({
          method: "post",
          url: appConfig.url + "/doclist",
          params: {'pageNo':1,'supLm':"执法工作手册", 'lm':"社区民警执法手册", 'subLm':""},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'appId': appConfig.appId
          },
          cache: $rootScope.useCache
        }).success(function(data){
          $scope.result = data;
            $scope.status = data.status;
            $scope.errorMsg = data.message;
          //console.log(data.result);
          //defer.resolve(data.result);
        }).error(function(err){
          $scope.result = err;
          console.log("fail to http POST doclist");
          //defer.reject(err);
        });
    /*ArticleService.getArticleList("执法工作手册","社区民警执法手册","", 1).then(function(data){
            $scope.result = data;
            $scope.status = data.status;
            $scope.errorMsg = data.message;
            console.log("articlesData=" + data);
            
            //$scope.hide();
        },function(err){
            $scope.result = err;
    });*/
  };

  $scope.getDoc = function(){
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/doc";
    $scope.requestParams = "id=4164，deviceId='test',lastPosition=''"
    $http({
        method: "post",
        url: appConfig.url + "/doc",
        params: {'id':4164,'deviceId':'test','lastPosition':""},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'appId': appConfig.appId
        }
       }).success(function (data) {
        if (data.status == "FAIL") {
          console.log("doc service return error code: "+ data.status);
          //defer.reject(data.status);
        }else{
          $scope.result = data;
          $scope.status = data.status;
          $scope.errorMsg = data.message;
          //defer.resolve(data.result);
        }
       }).error(function (err) {
        $scope.result = err;
        console.log("fail to http POST doc");
        //defer.reject(err);
       });
  };

  $scope.savelog = function(){
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/log";
    $scope.requestParams = "deviceId=testInterface"
    LogsService.addLogin("testInterface").then(function(data){
        $scope.result = data;
        $scope.status = data.status;
        $scope.errorMsg = data.message;
        console.log("logs=" + data);
            
            //$scope.hide();
        },function(err){
            $scope.result = err;
    });
  };

  $scope.testSearch = function(){
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/search";
    $scope.requestParams = "val=执法"
    ArticleService.search("执法").then(function(data){

      $scope.result = data;
      $scope.status = data.status;
      $scope.errorMsg = data.message;
      console.log(data);
    },function(err){
      $scope.result = err;
    });
  };

  $scope.testUpdate = function(){
    $ionicLoading.show({
        template: "正在连接..."
      });
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/update";
    $scope.requestParams = "version=" + $rootScope.versionName;
    UpdateService.updateApp().then(function(data){

      $scope.result = data;
      $scope.status = data.status;
      $scope.errorMsg = data.message;
      console.log("update=" + data);
      $ionicLoading.hide();
    },function(err){
      $scope.result = err;
      $ionicLoading.hide();
    });
  };

});
