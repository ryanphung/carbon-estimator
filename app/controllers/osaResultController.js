'use strict';

angular.module('app').controller('OsaResultController', ['$scope', '$filter', 'ServerService', 'UiBasicService', '$interval', '$timeout',
    function($scope, $filter, $server, $uiBasic, $interval, $timeout) {
        var timers = [];
        var baselines = [];
        var markers = [];
        
        $scope.$on("$destroy", function() {
            clearAllTimers();
        });
        
        function clearAllTimers() {
            for (var i = 0; i < timers.length; i++) {
                if (timers[i]) {
                    $interval.cancel(timers[i]);
                    console.log('Timer #' + i + ' cleared.');
                }
            }
            
            timers = [];
        }
        
        $scope.lastDataPoint = {};
        
        /* creating chart data */
        function fakeData(length, seconds) {
            var data = [];

            for (var i = 0; i < length; i++) {
                newData(data, seconds);
            }
            return data;
        }

        function newData(data, seconds) {
            var v, d, p;

            if (data.length == 0) {
                v = 100;
                d = new Date();
            } else {
                p = data[data.length - 1];
                v = p['value'] + (Math.random() - 0.5) * 5;        
                if (v < 0) v = 0;
                if (v > 100) v = 100;
                d = new Date(p['date'].getTime() + seconds * 1000);
            }

            data.push({date: MG.clone(d), value: v});
        }
        
        function fetchData(returnedData, resultSessionId, from, success) {
            if (!$scope.selectedCustomer.mocked) {
                $server.getOsaSessionData(resultSessionId, from, function(data, status, headers, config) {
                    // update session data
                    var session = data.response;
                    
                    if (session.status != $scope.selectedResultSession.status) {
                        if (session.status == 'done') {
                            clearAllTimers();

                            $uiBasic.message('Oxymetry session completed!');
                        }
                    }
                    
                    $scope.selectedResultSession.status = session.status;
                    $scope.selectedResultSession.start = session.start;
                    $scope.selectedResultSession.end = session.end;
                    $scope.selectedResultSession.odi = session.odi;
                    $scope.selectedResultSession.baseline_ts = session.baseline_ts;
                    $scope.selectedResultSession.baseline_spo2 = session.baseline_spo2;
                    
                    // update chart data
                    var res = session.data;
                    if (!from) { // fetch everything
                        returnedData[0] = [];
                        returnedData[1] = [];
                    } else { // only fetch future data
                        // splice the result array to keep latest 200 points
                        if (returnedData[0].length + res.length > 200) {
                            returnedData[0].splice(0, returnedData[0].length + res.length - 200);
                        }

                        if (returnedData[1].length + res.length > 200) {
                            returnedData[1].splice(0, returnedData[1].length + res.length - 200);
                        }
                    }

                    for (var i = 0; i < res.length; i++) {
                        returnedData[0].push({'date': res[i].ts, 'value': res[i].spo2});
                        returnedData[1].push({'date': res[i].ts, 'value': res[i].pr});
                    }
                    
                    baselines.length = 0;
                    markers.length = 0;

                    // baselines
                    if ($scope.selectedResultSession.baseline_spo2) {
                        baselines.push({'value': $scope.selectedResultSession.baseline_spo2,
                                        'label': 'Baseline: ' + $scope.selectedResultSession.baseline_spo2 + '%'});
                        baselines.push({'value': $scope.selectedResultSession.baseline_spo2 - 4, 'label': '4% line'});
                    }

                    // markers
                    if ($scope.selectedResultSession.baseline_ts) {
                        markers.push({'date': $scope.selectedResultSession.baseline_ts, 'label': 'End baseline measuring'});
                    }
                    
                    if (angular.isFunction(success)) {
                        success(returnedData);
                    }
                });
            } else { // mock data
                if (!from) {// fetch everything
                    if ($scope.selectedResultSession.status != 'done') {
                        returnedData[0] = fakeData(200, 1);
                        returnedData[1] = fakeData(200, 1);
                    } else {
                        returnedData[0] = fakeData(720, 60);
                        returnedData[1] = fakeData(720, 60);
                    }
                } else {
                    newData(returnedData[0], 1);
                    newData(returnedData[1], 1);
                    returnedData[0].splice(0, 1);
                    returnedData[1].splice(0, 1);
                }
                
                baselines.length = 0;
                baselines.push({'value': 80, 'label': 'Baseline: 80%'});
                baselines.push({'value': 76, 'label': '4% line'});
                
                markers.length = 0;
                
                if (angular.isFunction(success)) {
                    $timeout(function() { success(returnedData); }, 500);
                }
            }
        }
        
        function updateChart(data) {
            chart_params.data = [data[0], data[1]];

            if (data[0].length > 0)
                $scope.lastDataPoint.spo2 = data[0][data[0].length - 1].value;
            if (data[1].length > 0)
                $scope.lastDataPoint.pr = data[1][data[1].length - 1].value;
            
            if (data[0].length > 0)
                MG.data_graphic(chart_params);
        }
        
        if (angular.isDefined($scope.selectedResultSession) && $scope.selectedResultSession != null) {
            var data = [];
            
            var chart_params = {
                title: "",
                markers: markers,
                baselines: baselines,
                data: null,
                full_width: true,
                full_height: true,
                right: 40,
                missing_is_hidden: true,
                target: '#chart',
                legend: ['SpO2', 'PR'],
                brushing_interval: d3.time.minute,
                animate_on_load: true,
                transition_on_update: false,
                min_y_from_data: true,
                xax_count: 5,
                yax_count: 5,
                xax_start_at_min: true,
                yax_start_at_min: true,
                xax_format: d3.time.format('%H:%M:%S'),
                brushing: false,
                show_secondary_x_label: false,
                mouseover: function(d, i) {
                    var format = d3.time.format('%H:%M:%S')
                    $('div#chart svg .mg-active-datapoint')
                        .html(format(data[0][i]['date'])
                            + '   SpO2: ' + d3.round(data[0][i]['value']) + '%'
                            + '   Pulse Rate: ' + d3.round(data[1][i]['value']))
                    ;
                },
                missing_text: 'Waiting for data...' 
            };
            
            if ($scope.selectedResultSession.status != 'done') {
                var timer = $interval(function() {
                    var lastDate;
                    
                    if (data[0].length > 0)
                        lastDate = $filter('date')(data[0][data[0].length - 1]['date'], "yyyy-MM-dd HH:mm:ss");
                    else
                        lastDate = null;
                    
                    //chart_params.brushing = false;
                    
                    fetchData(data, $scope.selectedResultSession.id, lastDate, updateChart);
                }, 1000);
                
                timers.push(timer);
            } else {
                //chart_params.brushing = true;
            }
            
            fetchData(data, $scope.selectedResultSession.id, null, updateChart);
        }
    }
]);