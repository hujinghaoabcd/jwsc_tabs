angular.module('starter.services', [])

.factory('Folders',function($q, $http,$rootScope,$stateParams,appConfig){

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
        params: {'id':$stateParams.docid,'deviceId':'$rootScope.myIMEI','lastPosition':lastPosition},
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
});
