'use strict';

angular.module('app').controller('MainController', ['$scope', 'ServerService', 'UiBasicService', '$timeout', '$mdDialog',
    function($scope, $server, $uiBasic, $timeout, $mdDialog) {
        // settings
        $scope.resultInterpretation = [
            {
                lowerBoundary: -1,
                upperBoundary: 2,
                heading: 'Wow!',
                message1: 'Your carbon footprint is below the sustainable footprint.',
                message2: 'Keep it up!'
            }, {
                lowerBoundary: 2,
                upperBoundary: 4,
                heading: 'Well done!',
                message1: 'Your carbon footprint is below the world average footprint.',
                message2: 'Keep it up and reduce your carbon footprint further to reach the sustainable level!'
            }, {
                lowerBoundary: 4,
                upperBoundary: 9,
                heading: 'Nice.',
                message1: 'Your carbon footprint is below the Singapore average footprint.',
                message2: 'Keep it up and reduce your carbon footprint further to reach the sustainable level!'
            }, {
                lowerBoundary: 9,
                upperBoundary: 100,
                heading: 'Oh no...',
                message1: 'Your carbon footprint is higher than the Singapore average footprint.',
                message2: 'Let\'s work harder to reduce your carbon footprint!'
            }
        ];
        $scope.baselines = [
            {
                desc: 'Singapore Average',
                footprint: 9,
                chartColor: '#e0e0e0',
                textColor: '#333333'
            },{
                desc: 'World Average',
                footprint: 4,
                chartColor: '#e0e0e0',
                textColor: '#333333'
            },{
                desc: 'Sustainable Footprint',
                footprint: 2,
                chartColor: '#388E3C',
                textColor: 'white'
            },
        ];
        $scope.unitHeight = 20; // 20 pixels for every unit
        
        $scope.activityGroups = [
            {
                type: 'flight',
                icon: 'flight',
                activities: [
                    {desc: 'I avoid flying and offset my carbon', footprint: 0, type: 'flight'},
                    {desc: 'I fly a few times in S.E. Asia', footprint: 1, type: 'flight'},
                    {desc: 'A few flights within S.E. Asia + one yearly long distance flight', footprint: 2.5, type: 'flight'},
                    {desc: 'A few flights within S.E. Asia and a couple long distance flights per year', footprint: 5, type: 'flight'},
                    {desc: 'I fly short distance monthly and/or have several long distance flights per year and/or fly first class or business class', footprint: 9.5, type: 'flight'}
                ],
                selected: true,
				source: 'http://www.carbonfootprint.com/'
            }, {
                type: 'meat',
                icon: 'local_dining',
                activities: [
                    {desc: 'I\'m vegan', footprint: 1, type: 'meat'},
                    {desc: 'I\'m vegetarian', footprint: 1.5, type: 'meat'},
                    {desc: 'I eat white meat', footprint: 2, type: 'meat'},
                    {desc: 'I eat all types of meat', footprint: 2.5, type: 'meat'}
                ],
				source: 'http://thinkprogress.org/climate/2014/06/27/3454129/eating-meat-carbon-emissions/'
            }, {
                type: 'transit',
                icon: 'directions_bus',
                activities: [
                    {desc: 'I walk and cycle (zero carbon)', footprint: 0, type: 'transit'},
                    {desc: 'I use public transport', footprint: 0.5, type: 'transit'},
                    {desc: 'I drive', footprint: 3.5, type: 'transit'}
                ],
				source: 'http://www.lta.gov.sg/content/ltaweb/en/green-transport.html'
            }, {
                type: 'shop',
                icon: 'shopping_cart',
                activities: [
                    {desc: 'Minimalist shopper & recycler', footprint: 0.5, type: 'shop'},
                    {desc: 'Average shopper; concerned about buying local; recycle a bit', footprint: 1.5, type: 'shop'},
                    {desc: 'Average shopper; NOT concerned about buying local; recycle a bit', footprint: 2.5, type: 'shop'},
                    {desc: 'Avid shopper & recycle everything I can', footprint: 3.5, type: 'shop'},
                    {desc: 'Avid shopper; like nice packaging; not very concerned where stuff comes from; don\'t really recycle', footprint: 9.5, type: 'shop'}
                ],
				source: 'http://www.carbonfootprint.com/'
            }, {
                type: 'investing',
                icon: 'attach_money',
                activities: [
                    {desc: ' I don\'t have a bank account (zero carbon)', footprint: 0, type: 'investing'},
                    {desc: ' I use standard banking services', footprint: 0.5, type: 'investing'}
                ],
				source: 'http://www.carbonfootprint.com/'
            }, {
                type: 'recreation',
                icon: 'local_bar',
                activities: [
                    {desc: 'I only engage in zero carbon activities like running, cycling', footprint: 0, type: 'recreation'},
                    {desc: 'I occasionally go out to bar, movies...', footprint: 1, type: 'recreation'},
                    {desc: 'I often go out to bar, movies...', footprint: 1.5, type: 'recreation'},
                    {desc: 'I like carbon intensive activities (like motorbiking, motorboating, ...)', footprint: 2.5, type: 'recreation'}
                ],
				source: 'http://www.carbonfootprint.com/'
            }
        ];
        for (var i = 0; i < $scope.activityGroups.length; i++) {
            $scope.activityGroups[i].arrayId = i;
        }
        
        // initial values
        $scope.screenState = 'initializing'; // initializing, starting, calculating, results
        $scope.totalFootprint = 0;
        $scope.resultColumn = {};
        $scope.completedGroupsCount = 0;
        
        var calculateColumnPositions = function() {
            switch ($scope.screenState) {
                case 'initializing':
                case 'starting':
                    $scope.resultColumn.left = window.innerWidth;
                    for (var i = 0; i < $scope.activityGroups.length - 1; i++) {
                        $scope.activityGroups[i].left = window.innerWidth;
                    }
                    break;
                case 'calculating':
                    var columnWidth = 280;
                    var columnCount = $scope.activityGroups.length;
                    $scope.resultColumn.width = columnWidth;
                    $scope.resultColumn.left = window.innerWidth - $scope.resultColumn.width;
                    var remainingWidth = $scope.resultColumn.left;
                    var collapsedColumnWidth = Math.round((remainingWidth - columnWidth) / (columnCount - 1));
                    $scope.activityGroups[0].left = 0;
                    for (var i = 0; i < $scope.activityGroups.length - 1; i++) {
                        if (!$scope.activityGroups[i].selected)
                            $scope.activityGroups[i + 1].left = $scope.activityGroups[i].left + collapsedColumnWidth;
                        else
                            $scope.activityGroups[i + 1].left = $scope.activityGroups[i].left + columnWidth;
                    }
                    break;
                case 'results':
                    $scope.resultColumn.left = 0;
                    $scope.resultColumn.width = window.innerWidth;
                    for (var i = 0; i < $scope.activityGroups.length; i++) {
                        $scope.activityGroups[i].left = 0;
                    }
                    break;
            }
            
            // calculate background image size
            
            var fullResultsEl = document.getElementById('fullResults');

            if (window.innerWidth / window.innerHeight > 4896 / 3264) {
                fullResultsEl.classList.remove('portrait');
                fullResultsEl.classList.add('landscape');
            } else {
                fullResultsEl.classList.remove('landscape');
                fullResultsEl.classList.add('portrait');
            }
        }
        
        if (window.innerWidth < 568) {
            $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('')
                .content('Your device screen is too small; please turn to landscape mode or try the app on a computer or tablet for a better user experience.')
                .ok('Got it!')
            );
        } else {
            var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
                // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
            var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
            var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
                // At least Safari 3+: "[object HTMLElementConstructor]"
            var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
            var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6
            
            if (!isSafari && !isChrome && !isFirefox) {
                $mdDialog.show(
                  $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('')
                    .content('We try to provide you the best experience.\n\nThis website currently works well in Chrome, Safari or Firefox. We recommend you viewing it in Chrome, Safari or Firefox.\n\nThey are great browsers! :)')
                    .ok('Got it!')
                );
            }
        }
        
        $(window).resize(function() {
            calculateColumnPositions();
            $scope.$digest();
        });
        
        calculateColumnPositions();
        $timeout(function() {
            $scope.screenState = 'starting';
        }, 500);

        $scope.selectedActivities = [];
        
        $scope.selectActivityGroup = function(activityGroup) {
            $scope.selectedActivityGroup = activityGroup;
            for (var i = 0; i < $scope.activityGroups.length; i++) {
                $scope.activityGroups[i].selected = false;
            }
            activityGroup.selected = true;
            calculateColumnPositions();
        };
        
        $scope.selectActivity = function(activity, activityGroup) {
            // do not allow selecting twice
            if (activity.selected)
                return;
            
            activity.selected = true;
            
            // if the same type of activity has been selected, remove it first
            for (var i = 0; i < $scope.selectedActivities.length; i++) {
                if ($scope.selectedActivities[i].type == activity.type) {
                    $scope.selectedActivities[i].selected = false;
                    $scope.totalFootprint -= $scope.selectedActivities[i].footprint;
                    $scope.selectedActivities.splice(i, 1);
                    
                    break;
                }
            }

            $scope.selectedActivities.push(activity);
            $scope.totalFootprint += activity.footprint;
            
            if (!activityGroup.completed) {
                activityGroup.completed = true;
                $scope.completedGroupsCount++;
                
                if ($scope.completedGroupsCount == $scope.activityGroups.length) {
                    $mdDialog.show(
                      $mdDialog.confirm()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Done!')
                        .content('Take me to see results now, and see how I compare to other people.')
                        .cancel('Cancel')
                        .ok('See Results')
                    ).then(function() {
                        $scope.seeFullResults();
                    });
                }
            }

            if (activityGroup.arrayId < ($scope.activityGroups.length - 1) && !$scope.activityGroups[activityGroup.arrayId + 1].completed)
                doNextStep();
        };
        
        var doNextStep = function() {
            var id = findSelectedActivityGroupId();
            if (id != null) {
                if (id < $scope.activityGroups.length) {
                    $scope.selectActivityGroup($scope.activityGroups[id + 1]);
                }
            }
        };
        
        var findSelectedActivityGroupId = function() {
            for (var i = 0; i < $scope.activityGroups.length; i++) {
                if ($scope.activityGroups[i].selected)
                    return i;
            }
            
            return null;
        };
        
        $scope.deselectActivity = function(activity) {
            for (var i = 0; i < $scope.selectedActivities.length; i++) {
                if ($scope.selectedActivities[i] === activity) {
                    $scope.selectedActivities.splice(i, 1);
                    break;
                }
            }
            
            activity.selected = false;
            
            $scope.totalFootprint -= activity.footprint;
        };
        
        $scope.start = function() {
            $scope.screenState = "calculating";
            
            calculateColumnPositions();
        };
        
        $scope.seeFullResults = function() {
            $scope.screenState = "results";
            calculateColumnPositions();
        }
        
        $scope.backToCalculation = function() {
            $scope.screenState = "calculating";
            calculateColumnPositions();
        }
        
        $scope.shareResults = function(ev) {
            var element = angular.element(document.getElementById("fullResults"));
            
            FB.login(function(response) {
                checkLoginState(function(response) {
                    // get name
                    FB.api('/me', function(response) {
                        if (response.name) {
                            $scope.userFullName = response.name;
                            $scope.takingScreenshot = true;
                            $scope.$digest();
                        } else
                            console.error(response.error.message);

                        /*$mdDialog.show({
                            controller: ProgressDialogController,
                            templateUrl: 'app/partials/progressDialog.tmpl.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            locals: { title: 'Share To Facebook', message: 'Preparing to share...' }
                        });*/
            
                        html2canvas(element, {
                            onrendered: function(canvas) {
                                $scope.takingScreenshot = false;
                                $scope.$digest();
                                
                                var imgData = canvas.toDataURL();
            
                                $mdDialog.show({
                                    controller: ShareDialogController,
                                    templateUrl: 'app/partials/shareDialog.tmpl.html',
                                    parent: angular.element(document.body),
                                    targetEvent: ev,
                                    clickOutsideToClose: true,
                                    locals: { fbImage: imgData }
                                })
                                .then(function(fbStatusMessage) {
                                    // login
            
                                    imgData = imgData.replace(/^data:image\/(png|jpe?g);base64,/, '');
                                    // convert the base64 string to string containing the binary data
                                    imgData = conversions.base64ToString(imgData);
                                    
                                    $mdDialog.show({
                                        controller: ProgressDialogController,
                                        templateUrl: 'app/partials/progressDialog.tmpl.html',
                                        parent: angular.element(document.body),
                                        /*targetEvent: ev,*/
                                        locals: { title: 'Sharing Image To Facebook...', message: 'Please do not close the window; it may takes a few seconds to a few minutes depending on your network connection.' }
                                    });
									
                                    postImage({
                                        fb: { // data to be sent to FB
                                            caption: fbStatusMessage,
                                            // place any other API params you wish to send. Ex: place / tags etc.
                                            accessToken: FB_ACCESS_TOKEN,
                                            file: {
                                              name: 'File Name.jpg',
                                              type: 'image/jpeg', // or png
                                              dataString: imgData
                                            }
                                        },
                                        call: { // options of the $.ajax call
                                            url: 'https://graph.facebook.com/me/photos', // or replace *me* with albumid
                                            success: function() {
                                                $mdDialog.show(
                                                  $mdDialog.alert()
                                                    .parent(angular.element(document.querySelector('#popupContainer')))
                                                    .clickOutsideToClose(true)
                                                    .title('Share successully.')
                                                    .content('The result has been shared to your facebook wall.')
                                                    .ok('Got it!')
                                                    .targetEvent(ev)
                                                );
                                            },
                                            error: function() {
                                                console.error('failed');
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    });
                }, function() {
                    // login failed
                });
            }, {scope: 'public_profile,email,user_friends,publish_actions'});
            
            function ShareDialogController($scope, $mdDialog, fbImage) {
                $scope.fbMessage = 'Check out my carbon footprint.\nCalculated via http://bit.ly/carbonsgsh';
                $scope.fbImage = fbImage;
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
                $scope.answer = function(answer) {
                    $mdDialog.hide(answer);
                };
            }
            
            function ProgressDialogController($scope, $mdDialog, title, message) {
                $scope.title = title;
                $scope.message = message;
            }
        }
        
        $scope.showCredits = function() {
            $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('Credits')
                .content('<div style="text-align:center;">Special thanks to <b>Michael Broadhead</b> (<a href="http:\\earthfestsingapore.com" target="_blank">earthfestsingapore.com</a>)<br/>for the creation of the model for Carbon Footprint Calculator.</div>'
						 // + ':<ul>' +
                         //'<li><b>Michael Broadhead</b> (<a href="http:\\earthfestsingapore.com" target="_blank">earthfestsingapore.com</a>) for the creation of the model for Carbon Footprint Calculator.</li>' +
                         //'<li><b>National Climate Change Secretariat</b> (<a href="http:\\www.nccs.gov.sg" target="_blank">www.nccs.gov.sg</a>) for data source.</li>' +
                         //'</ul>'
                        )
                .ok('Thanks!')
            );
        };
    }
]);