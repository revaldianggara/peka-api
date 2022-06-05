'use strict';

angular
    .module('layerControl')
    .component('layerControl', {
        templateUrl: 'layer-control/layer-control.template.html',
        controller: 
            function layercontrolController($scope, $http, $mdSidenav, $timeout, mapService, $mdDialog, $mdToast) {
                $timeout(function () {
                    $mdSidenav('left').open();
                });
                const ctime = new Date();
                const webdomain = 'http://karhutla.ai-innovation.id/dashboard/user/webgis/';
                $scope.toggle = {};
                var falarm1 = false;
                var falarm2 = false;
                var falarm3 = false;
                var falarm4 = false;
                var falarm5 = false;
                const pgad = 10;
                var pagn1 = 0;
                var pagn2 = 0;
                var pagn3 = 0;
                var pagn4 = 0;
                var pagn5 = 0;
                var modsel = 0;
                $scope.penanganan = {};
                $scope.toggle.list1 = true;
                $scope.predDateGroup = [];
                $scope.hsDateGroup = [];
                $scope.vegDateGroup = [];
                $scope.modisDateGroup = [];
                $scope.landsatDateGroup = [];
                $scope.miscDateGroup = [];
                $scope.hs = mapService.info_detail;
                $scope.bottomPred = function() {
                    if (!falarm1) {
                        //run the event that was passed through
                        falarm1 = true;
                        $timeout(function () {
                            if (falarm1==true) {
                                pagn1 += pgad;
                                $scope.refreshListPred(pagn1);
                                console.log("Hit the end");
                                falarm1 = false;
                            }
                        }, 500);
                    }
                }
                $scope.refreshListPred = function(ofs) {
                    $http({
                        method : "GET",
                        url : "/user/webgis/getDatePred",
                        params : {offnum: ofs, modid: modsel}
                    }).then(function querySuccess(response) {
                        if (response.data.length > 0) {
                            var temp = $scope.predDateGroup;
                            temp = temp.concat(response.data);
                            angular.copy(temp, $scope.predDateGroup);
                        }
                    }, function queryError(response) {
                        console.log('connection failed');
                    });
                }
                $scope.bottomHS = function() {
                    if (!falarm2) {
                        //run the event that was passed through
                        falarm2 = true;
                        $timeout(function () {
                            if (falarm2==true) {
                                pagn2 += pgad;
                                $scope.refreshListHS(pagn2);
                                console.log("Hit the end");
                                falarm2 = false;
                            }
                        }, 500);
                    }
                }
                $scope.refreshListHS = function(ofs) {
                    $http({
                        method : "GET",
                        url : "/user/webgis/getDateHS",
                        params : {offnum: ofs}
                    }).then(function querySuccess(response) {
                        if (response.data.length > 0) {
                            var temp = $scope.hsDateGroup;
                            temp = temp.concat(response.data);
                            angular.copy(temp, $scope.hsDateGroup);
                        }
                    }, function queryError(response) {
                        console.log('connection failed');
                    });
                }
                $scope.bottomVeg = function() {
                    if (!falarm3) {
                        //run the event that was passed through
                        falarm3 = true;
                        $timeout(function () {
                            if (falarm3==true) {
                                pagn3 += pgad;
                                $scope.refreshListVeg(pagn3);
                                console.log("Hit the end");
                                falarm3 = false;
                            }
                        }, 500);
                    }
                }
                $scope.refreshListVeg = function(ofs) {
                    $http({
                        method : "GET",
                        url : "/user/webgis/getDateVeg",
                        params : {offnum: ofs}
                    }).then(function querySuccess(response) {
                        if (response.data.length > 0) {
                            var temp = $scope.vegDateGroup;
                            temp = temp.concat(response.data);
                            angular.copy(temp, $scope.vegDateGroup);
                        }
                    }, function queryError(response) {
                        console.log('connection failed');
                    });
                }
                $scope.dateCompare = function(targ) {
                    const tgtime = new Date(targ);
                    if (tgtime >= ctime) {
                        return true
                    } else {
                        return false
                    }
                }
                $scope.chooseModel = function(ev) {
                    $mdDialog.show({
                        controller: 'changemodeldialog',
                        parent: angular.element(document.body),
                        templateUrl: 'dialog/changemodel/changemodel.template.html',
                        targetEvent: ev
                    }).then(function(response){
                        mapService.clearMap();
                        console.log(response);
                        modsel = response;
                        $scope.predDateGroup = [];
			            $scope.refreshListPred(0);
                    })
                    .catch(function(responseIfRejected){
                        console.log('cancel');
                    });
                }
                $scope.predItemCheck = function(tid_chk) {
                    $scope.predDateGroup.filter(function(hsit) {
                        if (hsit.tid == tid_chk) {
                            if (hsit.check) {
                                console.log(tid_chk);
                                $http({
                                    method : "GET",
                                    url : "/user/webgis/getPredHS",
                                    params : {timid: tid_chk, modid: modsel}
                                }).then(function querySuccess(response) {
                                    if (response.data.features.length > 0) {
                                        mapService.drawHS('predHS_'+tid_chk, response.data);
                                    }
                                }, function queryError(response) {
                                    console.log('connection failed');
                                });
                            } else {
                                console.log("close "+tid_chk);
                                mapService.removeHS('predHS_'+tid_chk);
                            }
                        }
                    });
                }
                $scope.hsItemCheck = function(tid_chk) {
                    console.log(tid_chk);
                    $scope.hsDateGroup.filter(function(hsit) {
                        if (hsit.tid == tid_chk) {
                            if (hsit.check) {
                                console.log(tid_chk);
                                $http({
                                    method : "GET",
                                    url : "/user/webgis/getHS",
                                    params : {timid: tid_chk}
                                }).then(function querySuccess(response) {
                                    if (response.data.features.length > 0) {
                                        mapService.drawHS('HS_'+tid_chk, response.data);
                                    }
                                }, function queryError(response) {
                                    console.log('connection failed');
                                });
                            } else {
                                console.log("close "+tid_chk);
                                mapService.removeHS('HS_'+tid_chk);
                            }
                        }
                    });
                }
                $scope.vegItemCheck = function(tid_chk) {
                    console.log(tid_chk);
                    $scope.vegDateGroup.filter(function(hsit) {
                        if (hsit.tid == tid_chk) {
                            if (hsit.check) {
                                console.log(tid_chk);
                                $http({
                                    method : "GET",
                                    url : "/user/webgis/getVeg",
                                    params : {timid: tid_chk}
                                }).then(function querySuccess(response) {
                                    if (response.data.features.length > 0) {
                                        console.log(response.data.features.length);
                                        mapService.drawHS('Veg_'+tid_chk, response.data);
                                    }
                                }, function queryError(response) {
                                    console.log('connection failed');
                                });
                            } else {
                                console.log("close "+tid_chk);
                                mapService.removeHS('Veg_'+tid_chk);
                            }
                        }
                    });
                }
                $scope.bottomModis = function() {
                    if (!falarm4) {
                        //run the event that was passed through
                        falarm4 = true;
                        $timeout(function () {
                            if (falarm4==true) {
                                pagn4 += pgad;
                                $scope.refreshListModis(pagn4);
                                console.log("Hit the end");
                                falarm4 = false;
                            }
                        }, 500);
                    }
                }
                $scope.refreshListModis = function(ofs) {
                    $http({
                        method : "GET",
                        url : "/user/webgis/getDateModis",
                        params : {offnum: ofs}
                    }).then(function querySuccess(response) {
                        if (response.data.length > 0) {
                            var temp = $scope.modisDateGroup;
                            temp = temp.concat(response.data);
                            angular.copy(temp, $scope.modisDateGroup);
                        }
                    }, function queryError(response) {
                        console.log('connection failed');
                    });
                }
                $scope.bottomLandsat = function() {
                    if (!falarm5) {
                        //run the event that was passed through
                        falarm5 = true;
                        $timeout(function () {
                            if (falarm5==true) {
                                pagn5 += pgad;
                                $scope.refreshListModis(pagn5);
                                console.log("Hit the end");
                                falarm5 = false;
                            }
                        }, 500);
                    }
                }
                $scope.refreshListLandsat = function(ofs) {
                    $http({
                        method : "GET",
                        url : "/user/webgis/getDateLandsat",
                        params : {offnum: ofs}
                    }).then(function querySuccess(response) {
                        if (response.data.length > 0) {
                            var temp = $scope.landsatDateGroup;
                            temp = temp.concat(response.data);
                            angular.copy(temp, $scope.landsatDateGroup);
                        }
                    }, function queryError(response) {
                        console.log('connection failed');
                    });
                }
                $scope.modisItemCheck = function(dur, inm) {
                    $scope.modisDateGroup.filter(function(hsit) {
                        if (hsit.ur == dur) {
                            if (hsit.check) {
                                const xurl = webdomain + dur + '/{z}/{x}/{-y}.png';
                                console.log(xurl);
                                mapService.addRasterLayer(xurl, inm, 10);
                            }
                            else {
                                console.log('id to remove '+inm);
                                mapService.removeRasterLayer(inm);
                            }
                        }
                    })
                }
                $scope.landsatItemCheck = function(dur, inm) {
                    $scope.landsatDateGroup.filter(function(hsit) {
                        if (hsit.ur == dur) {
                            if (hsit.check) {
                                const xurl = webdomain + dur + '/{z}/{x}/{-y}.png';
                                console.log(xurl);
                                mapService.addRasterLayer(xurl, inm, 10);
                            }
                            else {
                                console.log('id to remove '+inm);
                                mapService.removeRasterLayer(inm);
                            }
                        }
                    })
                }
                $scope.refreshListPred(0);
                $scope.refreshListHS(0);
                $scope.refreshListVeg(0);
                $scope.refreshListModis(0);
                $scope.refreshListLandsat(0);
                
            }
});
