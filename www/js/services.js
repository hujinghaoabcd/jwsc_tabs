angular.module('starter.services', [])

.factory('FolderService',function($q, $http,$rootScope,$stateParams,appConfig){

  return {
    /**获取分类列表**/
    getFolderList : function(supModule, module, subModule) {

      var defer = $q.defer();
        $http({
          method: "post",
          url: appConfig.url + "/module",
          params: {'supModule':supModule,'module':module,'subModule':subModule},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'appId': appConfig.appId
          },
          cache: $rootScope.useCache
        }).success(function(data){
          //console.log(data.result);
          defer.resolve(data.result);
        }).error(function(err){
          console.log("fail to http POST module");
          defer.reject(err);
        });
      return defer.promise;
    }
  };
})

.factory('ArticleService',function($q, $http,$rootScope,$stateParams,appConfig){

  //var pageNo = 1;
  var service = {    // our factory definition

    /**获取列表**/
    getArticleList : function(supLm, lm, subLm, pageNo) {
      var defer = $q.defer();
        $http({
          method: "post",
          url: appConfig.url + "/doclist",
          params: {'pageNo':pageNo,'supLm':supLm, 'lm':lm, 'subLm':subLm},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'appId': appConfig.appId
          },
          cache: $rootScope.useCache
        }).success(function(data){
          //console.log(data.result);
          defer.resolve(data.result);
        }).error(function(err){
          console.log("fail to http POST doclist");
          defer.reject(err);
        });
      return defer.promise;
    },
    /** 获取详细内容 **/
    getArticle :function(lastPosition){
      console.log($stateParams.docid)
      var defer = $q.defer();
      $http({
        method: "post",
        url: appConfig.url + "/doc",
        params: {'id':$stateParams.docid,'deviceId':$rootScope.myIMEI,'lastPosition':lastPosition},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'appId': appConfig.appId
        },
        cache: $rootScope.useCache
       }).success(function (data) {
        if (data.status == "FAIL") {
          console.log("doc service return error code: "+ data.status);
          defer.reject(data.status);
        }else{
          defer.resolve(data.result);
        }
       }).error(function (err) {
        console.log("fail to http POST doc");
        defer.reject(err);
       });
     return defer.promise;
    },

    /** 搜索 **/
    search : function(val){
      var defer = $q.defer();
      $http({
        method: "post",
        url: appConfig.url + "/search",
        params: {'val':val},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'appId': appConfig.appId
        },
        cache: $rootScope.useCache
      }).success(function (data) {
        defer.resolve(data.result);
      }).error(function (err) {
        console.log("fail to http POST search");
        defer.reject(err);
      });
     return defer.promise;
    }
  };
  return service;
})

.factory('LogsService',function($q, $http,$rootScope,$stateParams,appConfig){

  return {
    /**添加登录日志**/
    addLogin : function(myIMEI) {
      var defer = $q.defer();
        $http({
          method: "post",
          url: appConfig.url + "/log",
          params: {'deviceId':myIMEI},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'appId': appConfig.appId
          },
          cache: $rootScope.useCache
        }).success(function (data){
            defer.resolve(data.status);
        }).error(function (err){
          console.log("fail to http POST /log");
          defer.reject(err);
        });
      return defer.promise;
    }
  };
})

.factory('UpdateService',function($q, $http,$rootScope,$stateParams,$ionicPopup,$ionicLoading,$timeout,
  $cordovaFileTransfer,$cordovaFileOpener2,appConfig){

  return {
    /**更新**/
    updateApp : function() {
      var defer = $q.defer();
        $http({
          method: "post",
          url: appConfig.url + "/update",
          params: {'version':$rootScope.versionName},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'appId': appConfig.appId
          },
          cache: $rootScope.useCache
        }).success(function (data){
            defer.resolve(data);
        }).error(function (err){
          console.log("fail to http POST /update");
          defer.reject(err);
        });
      return defer.promise;
    },

    /**更新窗口**/
    popupUpdateView : function(apkFilePath,updateContext){
      var confirmPopup = $ionicPopup.confirm({
                title: '版本升级',
                template: updateContext, //从服务端获取更新的内容
                cancelText: '取消',
                okText: '升级'
        });
      confirmPopup.then(function (res) {
          if (res) {
              $ionicLoading.show({
                  template: "已经下载：0%"
              });
              var url = apkFilePath; //可以从服务端获取更新APP的路径
              var targetPath = appConfig.targetPath; //APP下载存放的路径，可以使用cordova file插件进行相关配置
              var trustHosts = true
              var options = {};
              $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                  // 打开下载下来的APP
                  $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
                  ).then(function () {
                          // 成功
                          console.log("open apk success");
                      }, function (err) {
                          // 错误
                          console.log("open apk fail");
                      });
                  $ionicLoading.hide();
              }, function (err) {
                  //alert('下载失败');
                  $ionicLoading.show({
                    template: "下载失败"
                  });
                  console.log('update!'+ res);
                    $timeout(function() {
                    $ionicLoading.hide();
                  }, 1000);
              }, function (progress) {
                  //进度，这里使用文字显示下载百分比
                  $timeout(function () {
                      var downloadProgress = (progress.loaded / progress.total) * 100;
                      $ionicLoading.show({
                          template: "已经下载：" + Math.floor(downloadProgress) + "%"
                      });
                      if (downloadProgress > 99) {
                          $ionicLoading.hide();
                      }
                  })
              });
          } else {
              // 取消更新
          }
      });
    }
  };
});
