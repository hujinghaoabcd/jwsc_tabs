angular.module('starter.controllers', [])

.controller('TabCtrl',function($scope,DBA){

  //var db = $cordovaSQLite.openDB({ name: "my.db" });

  // for opening a background db:
  //var db = $cordovaSQLite.openDB({ name: "my.db", bgType: 1 });
  //console.log("db=" + db);
  //var query = "select * from team";
  //DBA.executeSql(query);

  //var insertSql = "INSERT INTO doc (docid, lmId, suplm,lm,sublm,tBt,tZw,tDate) VALUES (?,?,?,?,?,?,?,?)";
  //var parameters = ['1','1','1','1','1','1','1','1'];
  //DBA.executeSql(insertSql,parameters);

  $scope.onFolderSelect = function(index){

  }

  $scope.onTabDeselected = function(){
    //console.log(this);
    //window.location.reload(true);
  }

  $scope.onLawsSelect = function(index){
    //$ionicTabsDelegate.select(index);
  }

})

.controller('FolderCtrl', function($scope, $stateParams, $rootScope, $ionicPlatform, $sce, FolderService, ArticleService) {

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

  $scope.getModule =function(){
    FolderService.getFolderList(supModule, module, subModule).then(function(data){
      $scope.modules = data;
      //console.log("modulesData=" + data);
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
    
    if ($scope.searchFlag) {
      $scope.$broadcast('scroll.refreshComplete');
      return;
    };

    $rootScope.folderCurrentPage = 1;
    $scope.noMoreAvailable = false;
    $scope.getModule();

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
    console.log("foler stateChangeSuccess");
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

.controller('ArticleCtrl', function($scope, $ionicLoading, $ionicPopup, $stateParams, ArticleService) {

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

  $ionicLoading.show({
      template: "正在加载..."
  });

  ArticleService.getArticle($stateParams.docid,$scope.lastPosition).then(function(data){
    $scope.article = data;
    $scope.lastPosition = data.lastPosition;
    $ionicLoading.hide();
    if ($scope.lastPosition !== -1) {
        $scope.loadMore($stateParams.docid);
    };
  },function(err){
      if (err == "FAIL") {
        $scope.showServiceAlert();
      }else{
        $scope.showAlert();
      }
      $ionicLoading.hide();
  });

  $scope.loadMore = function(docid){
 
    ArticleService.getArticle(docid,$scope.lastPosition).then(function(data){

      $scope.article.tZw += data.tZw;
      $scope.lastPosition = data.lastPosition;
      if ($scope.lastPosition !== -1) {
        $scope.loadMore(docid);
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


.controller('LawsCtrl', function($scope, $stateParams, $rootScope, FolderService, ArticleService) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
    //研究使用方式
  //});

  var supModule = $stateParams.supModuleName;

  var module = $stateParams.moduleName;
  var subModule = $stateParams.subModuleName;

  $scope.islastFolder = false;
  $scope.noMoreAvailable = false;
  $rootScope.lawsCurrentPage = 1;

  $scope.getModule =function(){
    FolderService.getFolderList(supModule, module, subModule).then(function(data){
      $scope.modules = data;
      //console.log(data);
      //console.log(data.length);
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
      $scope.noMoreAvailable = true;
      //$scope.hide();
      //$scope.showAlert();
    });
  };
  $scope.getModule();

  //所以页面都可下来刷新
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

.controller('AccountCtrl', function($scope,$rootScope, $ionicPopup, $ionicLoading, $ionicPopover, $timeout,DBA,FolderService,ArticleService,UpdateService,appConfig) {

  $scope.useCache = $rootScope.useCache;
  $scope.versionName = $rootScope.versionName;
  console.log("$rootScope.versionName:" + $rootScope.versionName);

  $scope.clean = function(){
     var myPopup = $ionicPopup.show({
      template: '正在清除缓存...',
      title: '清除缓存'
    });
    myPopup.then(function(res) {
      console.log('clean!'+res);
      window.localStorage.clear();
    });
    $timeout(function() {
      myPopup.close(); //close the popup after 3 seconds for some reason
    }, 3000);
  };

  //页面显示年份
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

  //退出提示
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

  /**退出按钮**/
  $scope.logout = function() {
    //ionic.Platform.exitApp();
    confirmPopup();
  };

  /**获取所有目录和文章**/
  function getAllModuleAndDocList(suplm,module,sublm){
    FolderService.getFolderList(suplm,module,sublm).then(function(data){        
        //moduleList = data;
        //console.log(moduleList);
        if (data.length > 0) {
          angular.forEach(data, function(moduleData){
            //console.log(moduleData);
            //moduleList.push(data1);
            //TODO插入SQLite
            var insertSql = "replace INTO moduleName (id, moduleid, supModuleName, moduleName, subModuleName) VALUES (?,?,?,?,?)";
            var parameters = [moduleData.id,moduleData.moduleid,moduleData.supModuleName,moduleData.moduleName,moduleData.subModuleName];
            DBA.executeSql(insertSql,parameters);
            //遍历下一个目录
            getAllModuleAndDocList(moduleData.supModuleName,moduleData.moduleName,moduleData.subModuleName);

          })
        }else{
            //获取文章列表
            var pageNo = 2001;//获取分类下所有文章列表，通过后台判断pageNo > 2000 来实现
            ArticleService.getArticleList(suplm,module,sublm, pageNo).then(function(data){
              //$scope.articles = data;
              //console.log(data);
              if (data.length > 0) {
                angular.forEach(data, function(docData){
                  //console.log(docData);
                  var lastPosition = -2;//获取文章详情，通过后台判断lastPosition=-2时不进行分段加载
                  ArticleService.getArticle(docData.docid,lastPosition).then(function(data1){
                    var insertSql = "replace INTO doc (docid, lmId, suplm,lm,sublm,tBt,tZw,zwText,tDate) VALUES (?,?,?,?,?,?,?,?,?)";
                    //TODO 去除html标签 存入字段
                    var zw_remove_html = data1.tZw.replace(/<[^>]+>/g,"");//去掉所有的html标记
                    zw_remove_html = zw_remove_html.replace(/(^\s*)|(\s*$)/g, ""); // 去除空格
                    zw_remove_html = zw_remove_html.replace(/&nbsp;/ig, "");//去除&nbsp
                    zw_remove_html = zw_remove_html.replace(/(\n)+|(\r\n)+/g, "");//去除换行
                    //console.log(zw_remove_html);
                    var parameters = [docData.docid,docData.lmId,docData.suplm,docData.lm,docData.sublm,docData.tBt,data1.tZw,zw_remove_html,docData.tDate];
                    
                    DBA.executeSql(insertSql,parameters);
                  },function(err){
                    console.log("doc更新失败");
                    $ionicLoading.show({
                      template: "同步失败"
                    });
                  });  
                });
                //console.log(docListData.length);                
              };
            },function(err){
                console.log("doclist更新失败");
                $ionicLoading.show({
                    template: "同步失败"
                  });
                });           
        };        
    },function(err){
      console.log("module更新失败");
      $ionicLoading.show({
        template: "同步失败"
      });
    });
  }

  /**同步云端数据**/
  $scope.downloadData = function() {
    //TODO
    var downloadPopup = $ionicPopup.show({
      template: '正在同步...',
      title: '同步云端数据'
    });

    //获取目录和文章
    getAllModuleAndDocList('执法工作手册','','');
    getAllModuleAndDocList('常用法律法规','','');

    downloadPopup.then(function(res) {
      console.log('downloadData!');
      $ionicLoading.show({
          template: "同步完成"
      });
      $timeout(function() {
          $ionicLoading.hide();
      }, 1000);
    });

    $timeout(function() {
      downloadPopup.close(); //close the popup after 3 seconds for some reason
    }, 5000);
  };

  $scope.update = function() {
    //TODO
    var serverVersion = "";
    var updateContext = "版本有更新";
    var apkFilePath = appConfig.url + "/resources/apk/jwsc.apk";

    var updatePopup = $ionicPopup.show({
      template: '正在检查...',
      title: '检查版本'
    });

    updatePopup.then(function(res) {
          
      UpdateService.updateApp().then(function(data){
        console.log("request update interface response data:");
        console.log(data);
        if (data.totalCount == 1) {
          serverVersion = data.content.packageVersion;//应用版本号
          apkFilePath = data.content.pkgFilePath;//更新地址
          updateContext = data.content.packageDesc;//应用描述
        };          
      },function(err){
        console.log("request update interface error:");
        console.log(err);
      });
      if (serverVersion == "" || $rootScope.versionName == serverVersion) {
        $ionicLoading.show({
          template: "已是最新版本"
        });
        console.log('update!'+ res);
        updatePopup.close();
        $timeout(function() {
          $ionicLoading.hide();
        }, 1000);
      }else{
        updatePopup.close();
        UpdateService.popupUpdateView(apkFilePath,updateContext);
      }
      
    });
    $timeout(function() {
      updatePopup.close(); //close the popup after 3 seconds for some reason
    }, 3000);
  };
})

.controller('InterfaceCtrl',function($scope,$http,$ionicLoading,$rootScope,FolderService,ArticleService,LogsService,UpdateService,appConfig){

  $scope.getModule = function(){
    //$ionicTabsDelegate.select(index);
    $scope.requestUrl = appConfig.url + "/module";
    $scope.requestParams = "supModule=执法工作手册"
    FolderService.getFolderList("执法工作手册", "", "").then(function(data){
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
