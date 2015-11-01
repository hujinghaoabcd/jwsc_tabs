// Ionic Starter App
//var baseUrl = "test";
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','ngCordova'])
.constant("appConfig", {
        "url": "http://192.168.1.103:8080/appService",//后台服务地址
        "port": "8080",
        "appId": "cnfj.jwsc.6259",//appid名字
        "versionName":"1.0.0",//版本
        "dbName":".sh.gaj\\sh.gaj.cnfj.jwsc\\my.db",//数据库路径
        "targetPath":"file:///storage/sdcard0/Download/jwsc_update.apk"//下载文件地址
})
.run(function($rootScope,$ionicPlatform,$ionicPopup,$log,$ionicLoading,$timeout,$cordovaFileTransfer, $cordovaFile, $cordovaFileOpener2,$cordovaSQLite,LogsService,appConfig) {
  
  $ionicPlatform.ready(function() {
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
    var serverVersion = "2.0.0";

    /*var db = $cordovaSQLite.openDB({ name: ".sh.gaj\\sh.gaj.cnfj.jwsc\\my.db" });
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS people (id integer primary key, firstname text, lastname text)");

    var firstname="Benz";
    var lastname="Huang";
    var insertData = "INSERT INTO people (firstname, lastname) VALUES (?,?)";
        $cordovaSQLite.execute(db, insertData, [firstname, lastname]).then(function(res) {
            console.log("INSERT ID -> " + res.insertId);
        }, function (err) {
            console.error(err);
        });
    var query = "SELECT firstname, lastname FROM people WHERE lastname = ?";
    $cordovaSQLite.execute(db, query, [lastname]).then(function(res) {
            if(res.rows.length > 0) {
                console.log("SELECTED -> " + res.rows.item(0).firstname + " " + res.rows.item(0).lastname);
            } else {
                console.log("No results found");
            }
        }, function (err) {
            console.error(err);
        }
     );*/

    cordova.getAppVersion.getVersionNumber(function (version) {
      console.log("varsion:" + version);
      if(version != serverVersion){
        updadeVersion(version);
      }
    });
    //alert("1234");
    ionic.Platform.ready(function(){
    // will execute when device is ready, or immediately if the device is already ready.
    });
    var deviceInformation = ionic.Platform.device();
    //console.log(deviceInformation);
    //$log.log(deviceInformation);
    var myIMEI = deviceInformation.uuid;
    $rootScope.myIMEI = myIMEI;
    console.log($rootScope.myIMEI);

    var currentPlatformVersion = ionic.Platform.version();
    console.log("currentPlatformVersion:" + currentPlatformVersion);

    //记录登录日志
    LogsService.addLogin(myIMEI);

    //数据库初始化
    //dbService.setup();
    //dbService.initTable();
    //dbService.getModule("执法工作手册", "111", "");
    //更新版本
    function updadeVersion(ver){
      var confirmPopup = $ionicPopup.confirm({
                title: '版本升级',
                template: '1.xxxx;</br>2.xxxxxx;</br>3.xxxxxx;</br>4.xxxxxx', //从服务端获取更新的内容
                cancelText: '取消',
                okText: '升级'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    $ionicLoading.show({
                        template: "已经下载：0%"
                    });
                    var url = "http://192.168.1.103:8080/appService/resources/apk/jwsc.apk"; //可以从服务端获取更新APP的路径
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
                        alert('下载失败');
                        $ionicLoading.hide();
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
      /*$ionicPopup.show({
        template: ver,
        title: 'appVersion'
      });*/
    };
    
    /*$ionicPopup.show({
      template: "111",
      title: 'appVersion'
    });*/
    //$location.path('/tab/folder/执法工作手册//');
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
    url: '/folder/:supModuleName/:moduleName/:subModuleName',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-folder.html',
        controller: 'FolderCtrl'
      }
    }
  })

  .state('tab.article', {
    url: '/articles/:docid',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-article.html',
        controller: 'ArticleCtrl'
      }
    }
  })

  .state('tab.laws', {
      url: '/laws/:supModuleName/:moduleName/:subModuleName',
      views: {
        'tab-laws': {
          templateUrl: 'templates/tab-laws.html',
          controller: 'LawsCtrl'
        }
      }
    })
  .state('tab.lawsArticle', {
      url: '/lawsArticle/:docid',
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
  })

  .state('tab.us', {
    url: '/us',
    views: {
      'tab-account': {
        templateUrl: 'templates/us.html'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/folder/执法工作手册//');

});
