angular
  .module("mapService", [])
  .factory("mapService", function ($mdSidenav) {
    var mapObj;
    var viewObj;
    var draw;
    var pointsource;
    var hssource;
    var vector;
    var services = {};
    services.hs_clicked = undefined;
    services.type_clicked = undefined;
    services.info_detail = [];

    services.drawKabupaten = function (idn, gjson) {
      if (gjson.features == null) {
        console.log("Zona Potensi Not Found!");
      }
      var kabsource = new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(gjson),
      });
      kabsource.forEachFeature(function (feature) {
        const clvl = feature.getProperties()["val"];
        var rgb = [0, 0, 0, 0];
        if (clvl == 2) {
          rgb = [255, 153, 56, 0.4]
        } else if (clvl == 3) {
          rgb = [255, 113, 47, 0.4]
        } else if (clvl == 4) {
          rgb = [189, 28, 24, 0.4]
        } else {
          rgb = [251, 203, 36, 0.4]
        }
        const kabStyle = new ol.style.Style({
          fill: new ol.style.Fill({
            color: rgb,
          }),
          stroke: new ol.style.Stroke({
            width: 2,
            color: rgb,
          }),
        });
        feature.setStyle(kabStyle);
      });

      var kabvector = new ol.layer.Vector({
        source: kabsource,
      });
      kabvector.set("name", idn);
      mapObj.addLayer(kabvector);
      kabvector.setZIndex(30);
    }

    const pinpointStyle = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 250],
        anchorXUnits: "fraction",
        anchorYUnits: "pixels",
        scale: 0.1,
        src: "img/image/pin-yellow.png",
      }),
    });
    const hsRad = new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(0, 10, 180, 0.1)",
      }),
      stroke: new ol.style.Stroke({
        width: 1,
        color: "rgba(0, 10, 180, 0.6)",
      }),
    });
    services.mapInit = function (mapobj, viewobj) {
      mapObj = mapobj;
      viewObj = viewobj;
    };
    services.drawPoint = function (gjson) {
      if (!gjson) {
        pointsource = new ol.source.Vector();
      } else {
        pointsource = new ol.source.Vector({
          features: new ol.format.GeoJSON().readFeatures(gjson),
        });
      }
      vector = new ol.layer.Vector({
        source: pointsource,
      });
      vector.set("name", "tempolygon");
      vector.setStyle(pinpointStyle);
      mapObj.addLayer(vector);
      vector.setZIndex(9999);
      draw = new ol.interaction.Draw({
        source: pointsource,
        type: "Point",
        style: pinpointStyle,
      });
      mapObj.addInteraction(draw);
      vector.getSource().on("addfeature", function (event) {
        var vctrs = vector.getSource().getFeatures();
        if (vctrs.length > 1) {
          console.log("remove point");
          vector.getSource().removeFeature(vctrs[0]);
        }
      });
    };
    services.removeHS = function (idn) {
      var layersToRemove = [];
      mapObj.getLayers().forEach(function (layer) {
        if (layer.get("name") != undefined) {
          const rdnm = "rad_" + idn;
          if (layer.get("name") === idn || layer.get("name") === rdnm) {
            layersToRemove.push(layer);
          }
        }
      });

      var len = layersToRemove.length;
      for (var i = 0; i < len; i++) {
        mapObj.removeLayer(layersToRemove[i]);
      }
    };
    // template
    services.drawHS = function (idn, gjson) {
      if (gjson.features == null) {
        console.log("No Hotspot Found!");
      } else {
        const idt = idn.split("_")[0];
        var ity = "c";
        if (idt == "predHS") {
          ity = "r";
        } else if (idt == "HS") {
          ity = "c";
        } else if (idt == "predVeg") {
          ity = "t";
        } else if (idt == "rec") {
          ity = "pin";
        }
        var hssource = new ol.source.Vector({
          features: new ol.format.GeoJSON().readFeatures(gjson),
        });
        hssource.forEachFeature(function (feature) {
          const clvl = feature.getProperties()["c"];
          var cfrgb = "";
          var scal = 0.05;
          if (clvl !== undefined) {
            cfrgb = String(parseInt(Math.round(parseFloat(clvl) / 10) * 10));
          } else {
            scal = 0.05;
          }
          const rpointStyle = new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.5, 0.5],
              anchorXUnits: "fraction",
              anchorYUnits: "fraction",
              scale: scal,
              src: "img/image/" + cfrgb + ity + ".png",
            }),
          });
          feature.setStyle(rpointStyle);
        });
        var hsvector = new ol.layer.Vector({
          source: hssource,
        });
        hsvector.set("name", idn);
        mapObj.addLayer(hsvector);
        hsvector.setZIndex(30);
      }
    };
    services.refreshLineup = function (newlu) {
      var lyidx = 0;
      const mlx = newlu.length;
      newlu.forEach(function (layd) {
        // getLayers(cek 1-1)
        mapObj.getLayers().forEach(function (layer) {
          if (layer.get("id") == layd.id) {
            const nzdx = mlx - lyidx;
            layer.setZIndex(nzdx);
          }
        });
        lyidx = lyidx + 1;
      });
    };
    services.addRasterLayer = function (xyzurl, nuid, zin) {
      var uraster = new ol.layer.Tile({
        preload: true,
        source: new ol.source.XYZ({
          url: xyzurl,
        }),
      });
      uraster.set("name", "rastername");
      // set nama id
      uraster.set("id", nuid);
      //mapObj.getLayers().insertAt(mapObj.getLayers().getArray().length-2, uraster);
      // add mapObj
      mapObj.addLayer(uraster);
      uraster.setZIndex(zin);
    };
    services.removeRasterLayer = function (id2c) {
      var tgtlyr = undefined;
      mapObj.getLayers().forEach(function (layer) {
        if (layer.get("id") == id2c) {
          tgtlyr = layer;
        }
      });
      if (tgtlyr != undefined) {
        mapObj.removeLayer(tgtlyr);
      }
    };
    services.clearMap = function () {
      var layersToRemove = [];
      mapObj.getLayers().forEach(function (layer) {
        if (layer.get("name") != undefined) {
          var lynm = layer.get("name");
          lynm = lynm.split("_")[0];
          if (lynm === "predHS" || lynm === "predVeg" || lynm === "HS") {
            layersToRemove.push(layer);
          }
        }
      });

      var len = layersToRemove.length;
      for (var i = 0; i < len; i++) {
        mapObj.removeLayer(layersToRemove[i]);
      }
    };
    services.selectHS = function (feature, layername) {
      if (services.hs_clicked !== undefined || feature === undefined) {
        if (services.type_clicked === undefined) {
          console.log("do nothing");
        } else {
          //   mapObj.getLayers().forEach(function (layer) {
          //     const lyrnm = layer.get("name");
          //     if (lyrnm == services.type_clicked) {
          //       var hssource = layer.getSource();
          //       hssource.forEachFeature(function (feature) {
          //         if (feature.id_ == services.hs_clicked) {
          //           var ity = "c";
          //           const layertype = services.type_clicked.split("_")[0];
          //         }
          //       });
          //     }
          //   });
          // }
          mapObj.getLayers().forEach(function (layer) {
            const lyrnm = layer.get("name");
            if (lyrnm == services.type_clicked) {
              console.log(lyrnm);
              var hssource = layer.getSource();
              hssource.forEachFeature(function (feature) {
                if (feature.id_ == services.hs_clicked) {
                  var ity = "c";
                  const layertype = services.type_clicked.split("_")[0];
                  if (layertype == "predHS") {
                    ity = "r";
                  } else if (layertype == "HS") {
                    ity = "c";
                  } else if (layertype == "predVeg") {
                    ity = "t";
                  }
                  const clvl = feature.getProperties()["c"];
                  console.log(services.type_clicked);
                  console.log(ity);
                  var cfrgb = String(parseInt(Math.round(parseFloat(clvl) / 10) * 10));
                  var scal = 0.05;
                  if (layertype == "rec") {
                    cfrgb = "";
                    ity = "pin";
                    scal = 0.1;
                  }
                  const rpointStyle = new ol.style.Style({
                    image: new ol.style.Icon({
                      anchor: [0.5, 0.5],
                      anchorXUnits: "fraction",
                      anchorYUnits: "fraction",
                      scale: scal,
                      src: "assets/images/webgis/" + cfrgb + ity + ".png",
                    }),
                  });
                  feature.setStyle(rpointStyle);
                }
              });
            }
          });
        }
      }
      if (feature !== undefined) {
        console.log(services.info_detail);
        const curzm = viewObj.getZoom();
        var zoomto = 10;
        if (curzm > zoomto) {
          zoomto = curzm;
        }
        var ity = "c";
        console.log(layername);
        const layertype = layername.split("_")[0];
        if (layertype == "predHS") {
          ity = "arrowr";
        } else if (layertype == "HS") {
          ity = "arrowc";
        } else if (layertype == "predVeg") {
          ity = "arrowt";
        } else if (layertype == "rec") {
          ity = "pin-red";
        }
        services.hs_clicked = feature.id_;
        // const layertype = layername.split("_")[0];
        services.type_clicked = layername;
        var popup = new Popup({
          insertFirst: false,
        });
        mapObj.addOverlay(popup);
        const coord = feature.getGeometry().getCoordinates();
        var html = "";
        if (layertype == "predHS") {
          html =
            `<div style='font-size:14px;margin-bottom: 5px;'><strong>` +
            services.info_detail.type +
            `</strong></div> <span style='font-size:12px;'>Koordinat:&nbsp;<strong>` +
            services.info_detail.data.coord +
            `</strong></span><br><span style='font-size:12px;'>Waktu prediksi:&nbsp;<strong>` +
            services.info_detail.data.datestr +
            `&nbsp;-&nbsp;` +
            services.info_detail.data.datestp +
            `</strong></span><br> <span style='font-size:12px;'>Probabilitas:&nbsp;<strong>` +
            services.info_detail.data.conf +
            `%</strong></span>`;
        } else if (layertype == "HS") {
          html =
            `<div style='font-size:14px;margin-bottom: 5px;'><strong>` +
            services.info_detail.type +
            `</strong></div><span style='font-size:12px;'>Koordinat:&nbsp;<strong>` +
            services.info_detail.data.coord +
            `</strong></span><br><span style='font-size:12px;'>Tanggal Hotspot:&nbsp;<strong>` +
            services.info_detail.data.datestr +
            `&nbsp;-&nbsp;` +
            services.info_detail.data.datestp +
            `</strong></span><br> <span style='font-size:12px;'>Probabilitas:&nbsp;<strong>` +
            services.info_detail.data.conf +
            `%</strong></span>`;
        } else if (layertype == "predVeg") {
          html =
            `<div style='font-size:14px;margin-bottom: 5px;'><strong>` +
            services.info_detail.type +
            `</strong></div><span style='font-size:12px;'>Koordinat:&nbsp;<strong>` +
            services.info_detail.data.coord +
            `</strong></span><br><span style='font-size:12px;'>Waktu prediksi:&nbsp;<strong>` +
            services.info_detail.data.datestr +
            `&nbsp;-&nbsp;` +
            services.info_detail.data.datestp +
            `</strong></span>`;
        } else if (layertype == "rec") {
          html =
            `<div style='font-size:14px;margin-bottom: 5px;'><strong>` +
            services.info_detail.type +
            `</strong></div> <span style='font-size:12px;'>Koordinat:&nbsp;<strong>` +
            services.info_detail.data.coord +
            `</strong></span><br> <span style='font-size:12px;'>Tanggal Hotspot:&nbsp;<strong>` +
            services.info_detail.data.datestr +
            `</strong></span><br><span style='font-size:12px;'>Informasi:&nbsp;<strong>` +
            services.info_detail.data.info +
            `</strong></span><br> <span style='font-size:12px;'>Penanganan:&nbsp;<strong>` +
            services.info_detail.data.act +
            `</strong></span>`;
        }
        popup.show(coord, html);
        //feature.setStyle(redpinStyle);
        viewObj.animate({
          center: feature.getGeometry().getCoordinates(),
          zoom: zoomto,
          duration: 1000,
        });
      }
    };
    services.getGeoJson = function () {
      var geom = [];
      pointsource.forEachFeature(function (feature) {
        geom.push(new ol.Feature(feature.getGeometry().clone()));
      });
      var writer = new ol.format.GeoJSON();
      const geoJsonStr = writer.writeFeatures(geom);
      const coord = geom[0].values_.geometry.flatCoordinates;
      return [geoJsonStr, coord];
    };
    return services;
  })
  .directive("ngMap", [
    "mapService",
    "$http",
    function (mapService, $http) {
      return {
        restrict: "A",
        replace: true,
        link: function ($scope) {
          var view = new ol.View({
            projection: "EPSG:4326",
            center: [119, -1.0],
            zoom: 5.0,
          });
          var map = new ol.Map({
            target: "map",
            controls: ol.control.defaults({
              attribution: false,
            }),
            layers: [
              /*new ol.layer.Tile({
                        source: new ol.source.OSM()
                    }),*/
              new ol.layer.Tile({
                // zIndex: 1,
                source: new ol.source.XYZ({
                  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                  maxZoom: 23,
                }),
              }),
              new ol.layer.Tile({
                opacity: 1.0,
                zIndex: 15,
                visible: true,
                source: new ol.source.OSM({
                  url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}.jpg",
                }),
              }),
            ],
            view: view,
          });
          var source = new ol.source.Vector({});
          var vectorIDN = new ol.layer.Vector({
            source: source,
          });

          //   style polygon
          const fillStyle = new ol.style.Fill({
            color: [255, 0, 0, 0],
          });

          const strokeStyle = new ol.style.Stroke({
            color: [255, 80, 60, 1.0],
            width: 2,
          });
          //   add polygon
          const IndonesiaPolygon = new ol.layer.Vector({
            source: new ol.source.Vector({
              url: "/services/indonesia.geojson",
              format: new ol.format.GeoJSON(),
            }),
            visible: true,
            title: "Indonesia",
            style: new ol.style.Style({
              fill: fillStyle,
              stroke: strokeStyle,
            }),
          });
          map.addLayer(IndonesiaPolygon);
          map.addLayer(vectorIDN);
          vectorIDN.setZIndex(30);
          map.on("click", function (e) {
            var wclk = 0;
            map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
              const lyrnm = layer.get("name");
              const lyrty = lyrnm.split("_")[0];
              if (lyrty == "predHS" || lyrty == "HS" || lyrty == "predVeg" || lyrty == "rec") {
                $http({
                  method: "GET",
                  url: "/public/getInfoDetail",
                  params: {
                    fid: feature.id_,
                    type: lyrty,
                  },
                }).then(
                  function querySuccess(response) {
                    var temp = {};
                    response.data.typeid = lyrty;
                    if (lyrty == "predHS") {
                      temp.type = "Potensi Hotspot";
                      temp.data = response.data;
                    } else if (lyrty == "HS") {
                      temp.type = "HOTSPOT";
                      temp.data = response.data;
                    } else if (lyrty == "predVeg") {
                      temp.type = "Potensi Devegetasi";
                      temp.data = response.data;
                    } else if (lyrty == "rec") {
                      temp.type = "Rekomendasi Penanganan";
                      temp.data = response.data;
                    }
                    angular.copy(temp, mapService.info_detail);
                    mapService.selectHS(feature, lyrnm);
                  },
                  function queryError(response) {
                    console.log("connection failed");
                  }
                );
                wclk = 1;
              }
            });

            if (wclk == 0) {
              mapService.selectHS(undefined, undefined);
              mapService.hs_clicked = undefined;
              mapService.type_clicked = undefined;
            }
          });
          $("#map").data("map", map);
          mapService.mapInit(map, view);
        },
      };
    },
  ]);