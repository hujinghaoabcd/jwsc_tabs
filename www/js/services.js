angular.module('starter.services', [])

.factory('Folders',function($q, $http,$rootScope,$stateParams){

  return {
    /**获取分类列表**/
    getFolderList : function(supModule, module, subModule) {
      var defer = $q.defer();
        $http({
          method: "post",
          url: $rootScope.baseUrl + "/module/getModule",
          params: {'supModule':supModule,'module':module,'subModule':subModule},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: $rootScope.useCache
        }).success(function(data){
          //console.log(data.result);
          defer.resolve(data.result);
        }).error(function(err){
          console.log("fail to http POST module/getModule");
          defer.reject(err);
        });     
      return defer.promise;
    }
  };
})

.factory('ArticleService',function($q, $http,$rootScope,$stateParams){

  //var pageNo = 1;
  var service = {    // our factory definition
    
    /**获取列表**/
    getArticleList : function(supLm, lm, subLm, pageNo) {
      var defer = $q.defer();
        $http({
          method: "post",
          url: $rootScope.baseUrl + "/doc/getListByPage",
          params: {'pageNo':pageNo,'supLm':supLm, 'lm':lm, 'subLm':subLm},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: $rootScope.useCache
        }).success(function(data){
          //console.log(data.result);
          defer.resolve(data.result);
        }).error(function(err){
          console.log("fail to http POST doc/getListByPage");
          defer.reject(err);
        });     
      return defer.promise;
    },
    /** 获取详细内容 **/
    getArticle :function(){
      console.log($stateParams.docid)
      var defer = $q.defer();
      $http({
        method: "post",
        url: $rootScope.baseUrl + "/doc/getDocById",
        params: {'id':$stateParams.docid},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        cache: $rootScope.useCache
       }).success(function (data) {
        defer.resolve(data.result);
       }).error(function (err) {
        console.log("fail to http POST doc/getDocById");
        defer.reject(err);
       });
     return defer.promise;
    },

    /** 搜索 **/
    search : function(val, supLm, lm, subLm){
      var defer = $q.defer();
      $http({
        method: "post",
        url: $rootScope.baseUrl + "/doc/search",
        params: {'val':val,'supLm':supLm, 'lm':lm, 'subLm':subLm},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        cache: $rootScope.useCache
      }).success(function (data) {
        defer.resolve(data.result);
      }).error(function (err) {
        console.log("fail to http POST doc/search");
        defer.reject(err);
      });
     return defer.promise;
    }
  };  
  return service;
});
