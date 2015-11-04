angular.module('starter.services', [])

.factory('Folders',function($q, $http,$rootScope,$stateParams,appConfig){

  return {
    /**获取分类列表**/
    getFolderList : function(supModule, module, subModule) {

      var defer = $q.defer();
        $http({
          method: "post",
          url: appConfig.url + "/module/getModule",
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
          console.log("fail to http POST module/getModule");
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
          url: appConfig.url + "/doc/getListByPage",
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
        url: appConfig.url + "/doc/getDocById",
        params: {'id':$stateParams.docid,'deviceId':$rootScope.myIMEI},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'appId': appConfig.appId
        },
        cache: $rootScope.useCache
       }).success(function (data) {
        if (data.status == "FAIL") {
          console.log("doc/getDocById service return error code: "+ data.status);
          defer.reject(data.status);
        }else{
          defer.resolve(data.result);
        }
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
        url: appConfig.url + "/doc/search",
        params: {'val':val,'supLm':supLm, 'lm':lm, 'subLm':subLm},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'appId': appConfig.appId
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
})

.factory('LogsService',function($q, $http,$rootScope,$stateParams,appConfig){

  return {
    /**添加登录日志**/
    addLogin : function(myIMEI) {
      var defer = $q.defer();
        $http({
          method: "post",
          url: appConfig.url + "/log/insertLog",
          params: {'deviceId':myIMEI},
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'appId': appConfig.appId
          },
          cache: $rootScope.useCache
        }).success(function (data){
            defer.resolve(data.status);
        }).error(function (err){
          console.log("fail to http POST /log/insertLog");
          defer.reject(err);
        });
      return defer.promise;
    }
  };
})

/** sqlite 操作**/
.factory('dbService',function($q, $http,$rootScope,$cordovaSQLite,appConfig){

  var db ;//= $cordovaSQLite.openDB({ name: appConfig.dbName, createFromLocation: 1});
  //var db = window.sqlitePlugin.openDatabase({name: "test.db"});
  return {
    /**准备数据库**/
    setup : function() {
      var defer = $q.defer();
      //db = $cordovaSQLite.openDB({ name: appConfig.dbName, createFromLocation: 1});
      var query =  'select count(*) as count from sqlite_master where type="table" and (name="doc" or name="moduleName")';
      $cordovaSQLite.execute(db, query).then(function(res) {
        console.log("table count:" + res.rows.item(0)['count']);
        defer.resolve(db);
      }).catch(
        defer.reject
      );
      return defer.promise;
    },
    /**初始化表**/
    initTable : function() {
      var defer = $q.defer();
      //db = $cordovaSQLite.openDB(DB_NAME, 1);
      var createDocTable = "CREATE TABLE IF NOT EXISTS doc (docid integer primary key, lmId integer,suplm varchar(200),lm varchar(512),sublm varchar(50),tBt varchar(512),tZw text, tDate varchar(20))";
      $cordovaSQLite.execute(db, createDocTable).then(function() {
        console.log("create doc table success");
        defer.resolve;
      }).catch(
        //console.log("create doc table fail");
        defer.reject
      );
      var createModuleTable = "CREATE TABLE IF NOT EXISTS moduleName (id integer primary key, moduleid varchar(50),supModuleName varchar(200),moduleName varchar(200),subModuleName varchar(200))";
      $cordovaSQLite.execute(db, createModuleTable).then(function() {
        console.log("create moduleName table success");
        defer.resolve;
      }).catch(
        //console.log("create moduleName table fail");
        defer.reject
      );
      return defer.promise;
    },
    /**插入doc数据**/
    insertDoc : function(docid, lmId, suplm, lm, sublm, tBt, tZw, tDate){
      var defer = $q.defer();
      var insertSql = "INSERT INTO doc (docid, lmId, suplm,lm,sublm,tBt,tZw,tDate) VALUES (?,?,?,?,?,?,?,?)";
      $cordovaSQLite.execute(db, insertSql, [docid, lmId, suplm, lm, sublm, tBt, tZw, tDate]).then(function(res) {
            console.log("INSERT doc ID -> " + res.insertId);
            defer.resolve(res);
        }, function (err) {
            console.error(err);
            defer.reject(err);
        });
      return defer.promise;
    },
    /**插入目录**/
    insertModuleName : function(id, moduleid, supModuleName, moduleName, subModuleName){
      var defer = $q.defer();
      var insertSql = "INSERT INTO moduleName (id, moduleid, supModuleName, moduleName, subModuleName) VALUES (?,?,?,?,?)";
      $cordovaSQLite.execute(db, insertSql, [id, moduleid, supModuleName, moduleName, subModuleName]).then(function(res) {
            console.log("INSERT moduleName ID -> " + res.insertId);
            defer.resolve(res);
        }, function (err) {
            console.error(err);
            defer.reject(err);
        });
      return defer.promise;
    },
    /**查询模块下的文章列表**/
    getDocListByModule : function(supModuleName, moduleName, subModuleName){
      var defer = $q.defer();
      var selectSql = "select docid, lmId, suplm, lm, sublm, tBt, tDate from doc where where suplm = ?"
      if (moduleName=='' || moduleName == undefined) {
        selectSql += " and lm = ?";
      };
      if (subModuleName =='' || subModuleName == undefined) {
        selectSql += " and sublm = ?";
      };
      selectSql += "order by docid desc limit 10 offset 0";
      $cordovaSQLite.execute(db, selectSql, [supModuleName, moduleName, subModuleName]).then(function(res) {
            if(res.rows.length > 0) {
                console.log("SELECTED DocList-> " + res.rows.item(0).firstname + " " + res.rows.item(0).lastname);
            } else {
                console.log("DocList No results found");
            }
            defer.resolve(res);
        }, function (err) {
            console.error(err);
            defer.reject(err);
        }
      );
      return defer.promise;
    },
    /**获取文章详情**/
    getDocById : function(docid){
      var defer = $q.defer();
      var selectSql = "select docid, lmId, suplm, lm, sublm, tBt, tZw, tDate from doc where where docid = ?";
      $cordovaSQLite.execute(db, selectSql, [docid]).then(function(res) {
            if(res.rows.length > 0) {
                console.log("SELECTED Doc-> " + res.rows.item(0).firstname + " " + res.rows.item(0).lastname);
            } else {
                console.log("No results found");
            }
            defer.resolve(res);
        }, function (err) {
            console.error(err);
            defer.reject(err);
        }
      );
      return defer.promise;
    },
    /**查询模块分类**/
    getModule : function(supModuleName, moduleName, subModuleName){
      var defer = $q.defer();
      console.log("----db=" + db);
      //db = $cordovaSQLite.openDB({ name: appConfig.dbName, createFromLocation: 1})
      var selectSql = "select id, moduleid, supModuleName, moduleName, subModuleName from moduleName where supModuleName = ? ";
      var params = "supModuleName";
      if (supModuleName != '' && (moduleName == '' || moduleName == undefined)) {
        selectSql += " and moduleName != '' and subModuleName =''";
      };
      if (moduleName != '' && (subModuleName == '' || subModuleName == undefined)) {
        selectSql += " and moduleName = ? and subModuleName =''";
        params += ", moduleName";
      };
      console.log("selectSql:"+ selectSql);
      console.log("params:" + params);
      $cordovaSQLite.execute(db, selectSql, [params]).then(function(res) {
            if(res.rows.length > 0) {
                console.log("SELECTED moduleName -> " + res.rows.item(0).firstname + " " + res.rows.item(0).lastname);
            } else {
                console.log("moduleName No results found");
            }
            defer.resolve(res);
        }, function (err) {
            console.error(err);
            defer.reject(err);
        }
      );
      return defer.promise;
    },
    /** 搜索**/
    searchDocLst : function(val,suplm,lm,sublm){
      var defer = $q.defer();
      var selectSql = "select docid, lmId, suplm, lm, sublm, tBt, tDate from doc where where suplm = ?"
      if (moduleName=='' || moduleName = undefined) {
        selectSql += " and lm = ?";
      };
      if (subModuleName =='' || subModuleName == undefined) {
        selectSql += " and sublm = ?";
      };
      selectSql += "and tBt like ? order by tDate desc"
      $cordovaSQLite.execute(db, selectSql, [supModuleName, moduleName, subModuleName,val]).then(function(res) {
            if(res.rows.length > 0) {
                console.log("SELECTED searchDocLst-> " + res.rows.item(0).firstname + " " + res.rows.item(0).lastname);
            } else {
                console.log("DocList No results found");
            }
            defer.resolve(res);
        }, function (err) {
            console.error(err);
            defer.reject(err);
        }
      );
      return defer.promise;
    }
  };
});
