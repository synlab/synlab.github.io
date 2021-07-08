var thirdEye_view = false;
var resetPole = false;
var newEvent = false; //when true, data is logged
//var valHeight = 0;
var forwardSpeed = 0;
var backwardSpeed = 0;
var leftSpeed = 0;
var rightSpeed = 0;
var trackedPoleVal = 0;
var logPoleVal = 0;

function updateUserInterface() {
	if (delayingUserInterface) {
		return;
	}

	// park
	switch (kickstandState) {
		case kDRKickstand_stateDeployed:
        	removeBlink("#parkButton");
			$("#parkButton").addClass("on");
			break;

        case kDRKickstand_stateDeployWaiting: // It's retracted, but waiting to be deployed
		case kDRKickstand_stateDeployBeginning:
		case kDRKickstand_stateDeployMiddle:
		case kDRKickstand_stateDeployEnd:
		case kDRKickstand_stateRetractBeginning:
		case kDRKickstand_stateRetractMiddle:
		case kDRKickstand_stateRetractEnd:
        case kDRKickstand_stateDeployAbortMiddle:
        case kDRKickstand_stateDeployAbortEnd:
        	// blink
        	addBlink("#parkButton");
			break;

		case kDRKickstand_stateRetracted:
		case kDRKickstand_stateNone:
		default:
        	removeBlink("#parkButton");
			$("#parkButton").removeClass("on");
			break;
			break;
	}

	// flip
	if (robotiPadOrientation == 1
/*		|| (remoteRobotSupports("cameraKitIsConnected") && !("cameraKitEnabled" in statusValues))
		|| (remoteRobotSupports("cameraKitIsConnected") && "cameraKitEnabled" in statusValues && statusValues.cameraKitEnabled) */)
	{
		$("#flipButton").addClass("disabled");
		$("#flipButton").removeClass("on");
	} else if (robotiPadOrientation == 2) {
		$("#flipButton").removeClass("disabled");
		if (isFlipped) {
			$("#flipButton").addClass("on");
		} else {
			$("#flipButton").removeClass("on");
		}
	} else {
		$("#flipButton").addClass("disabled");
		$("#flipButton").removeClass("on");
	}
	if (remoteRobotSupports("cameraKitIsConnected") && "cameraKitEnabled" in statusValues) {
		$("#ckButton").removeClass("disabled");
		if (statusValues.cameraKitEnabled) {
			$("#ckButton").addClass("on");
		} else {
			$("#ckButton").removeClass("on");
		}
	} else {
		$("#ckButton").addClass("disabled");
	}

	if (remoteRobotSupports("robot")) {
		// robot connected
		$("#batteryButton").show();
		$("#parkButton").show();
		if (thirdEye_view==true){
    $("#poleButton").hide();
		}
		else{
		$("#poleButton").show();}
		$("#missingRobotButton").hide();
	} else {
		// missing robot
		$("#batteryButton").hide();
		$("#parkButton").hide();
    	$("#poleButton").hide();
		$("#missingRobotButton").show();
	}

	// Microphone mute
	if (isMuted) {
		$("#muteButton").addClass("on");
	} else {
		$("#muteButton").removeClass("on");
	}

	// Microphone volume slider
	if (allowRobotSpeakerUpdate && statusValues.volume != undefined) {
		$("#nativeVolumeSlider").val(statusValues.volume * 100);
		$("#localVideo .audioLevel").width(Math.round(statusValues.volume * 100) +"%");
	}

	// Speaker mute
	if (speakerIsMuted) {
		$("#speakerMuteButton").addClass("on");
	} else {
		$("#speakerMuteButton").removeClass("on");
	}

	// console.log("@@@ UI updating: [" + statusValues.pole + "]");
	// pole
	if (allowPoleUpdate && statusValues.pole !== undefined) {
		$("#nativePoleSlider").val(Math.round(statusValues.pole * 100));
		//valHeight = $("#nativePoleSlider").val()/100; //capturing height for datalogging
		//console.log("valHeight: " + valHeight);
		// if(!resetPole) {
		// 	userSavedPolePos = valHeight;
		// 	console.log("*****[" + userSavedPolePos + "]*****");
		// }
		// if(resetPole && valHeight == 0) {
		// 	console.log("Pole is zero");
		// 	resetPole = false;
		// }
		newEvent=true; //corresponds to TamperMonkey script
	}

	// update battery level
	if (!sessionBatteryButton) {
		sessionBatteryButton = BatteryButtonWithParentId("sessionBatteryButton");
	}
	sessionBatteryButton.robotBatteryLevel = statusValues.robot_battery;
	sessionBatteryButton.iPadBatteryLevel = statusValues.ipad_battery;
	sessionBatteryButton.supportsiPadMeter = true;
	sessionBatteryButton.showChargingIcon = statusValues.is_robot_charging;
	sessionBatteryButton.barContentSize = { "width": 38.0, "height": 16.0 };
	sessionBatteryButton.strokeThickness = 2.0;
	sessionBatteryButton.fillColor = "rgba(40, 40, 40, 1.0)";
	if (statusValues.is_robot_charging) {
		if (statusValues.robot_battery == 1.0) {
			sessionBatteryButton.fillColor = kDRGreenColor;
		} else {
			sessionBatteryButton.fillColor = kDROrangeColor;
		}
	}
	sessionBatteryButton.redraw();
	$("#robotBatteryLevel").html(Math.round(statusValues.robot_battery * 100));
	$("#iPadBatteryLevel").html(Math.round(statusValues.ipad_battery * 100));

	// update warning message about driving while too tall
	checkDrivingTall();

	// enable multiparty button
	if (remoteRobotSupports("multiparty")) {
		$("#multipartyButton").removeClass("disabled");
		if (sessionIsMultipartyHost) {
			$("#multipartyButton").addClass("on");
		} else {
			$("#multipartyButton").removeClass("on");
		}
	} else {
		$("#multipartyButton").addClass("disabled");
	}

	// enable screensharing button
	if (remoteRobotSupports("screensharing") && (!getURLParameter("domain") || getURLParameter("domain").indexOf(".doublerobotics.com") > -1)) {
		$("#screenSharingButton").removeClass("disabled");
		if (screenSharingIsActive()) {
			$("#screenSharingButton").addClass("on");
		} else {
			$("#screenSharingButton").removeClass("on");
		}
	} else {
		$("#screenSharingButton").addClass("disabled");
	}
	if (isChromeAndroid()) {
		$("#screenSharingButton").remove();
	}

	// display web page
	if (remoteRobotSupports("screensharing")) { // note: we don't have an entry for displaying a web page
		$("#displayWebPageButton").removeClass("disabled");
	} else {
		$("#displayWebPageButton").addClass("disabled");
	}

	// enable photo button
	if (remoteRobotSupports("photo")) {
		$("#photoButton").removeClass("disabled");
	} else {
		$("#photoButton").addClass("disabled");
	}

	// quality
	if (remoteRobotSupports("qualityPreference")) {
		if (!isUsingCameraKit()) {
			// don't allow AHD when not using a Camera Kit
			statusValues.qualityPreference = Math.min(2, statusValues.qualityPreference);
		}

		// supports quality preference
		$("#qualityPreference").removeClass("disabled");
		$("#qualityPreference0").removeClass("selected");
		$("#qualityPreference1").removeClass("selected");
		$("#qualityPreference2").removeClass("selected");
		$("#qualityPreference3").removeClass("selected");
		$("#qualityPreference"+ Math.min(statusValues.qualityPreference, 3)).addClass("selected");

		// Disable options based on remote iPad capabilites
		if ("qualityPreference" in statusValues && statusValues.maxQualityPreference <= 1) {
			// iPad Air or lower
			$("#qualityPreference3").addClass("disabled");
			if (statusValues.maxQualityPreference <= 0 && isUsingCameraKit()) {
				// iPad 4 or lower
				$("#qualityPreference2").addClass("disabled");
				$("#qualityPreference1").addClass("disabled");
			} else {
				$("#qualityPreference2").removeClass("disabled");
				$("#qualityPreference1").removeClass("disabled");
			}
		} else {
			// iPad Air 2 or newer
			if (isUsingCameraKit()) {
				// allow AHD only when using a Camera Kit
				$("#qualityPreference3").removeClass("disabled");
			} else {
				$("#qualityPreference3").addClass("disabled");
			}
			$("#qualityPreference2").removeClass("disabled");
			$("#qualityPreference1").removeClass("disabled");
		}

		if ("qualityPreference" in statusValues) {
			if (isUsingCameraKit() && lastQualitySettingCameraKit < 0) {
				lastQualitySettingCameraKit = (statusValues.maxQualityPreference == 2) ? 3 : statusValues.maxQualityPreference;
			}
			if (!isUsingCameraKit() && lastQualitySettingiPad < 0) {
				lastQualitySettingiPad = statusValues.maxQualityPreference;
			}
		}

	} else {
		// no quality preference
		$("#qualityPreference").addClass("disabled");
	}

	// audioBoost
	if (remoteRobotSupports("audioBoost") && "audioBoostLevel" in statusValues) {
		audioBoostLevel = statusValues.audioBoostLevel;
		switch (audioBoostLevel) {
			case 0: {
				$("#audioBoostNormal").addClass("selected");
				$("#audioBoostBoost").removeClass("selected");
				$("#audioBoostMax").removeClass("selected");
				break;
			}
			case 0.5: {
				$("#audioBoostNormal").removeClass("selected");
				$("#audioBoostBoost").addClass("selected");
				$("#audioBoostMax").removeClass("selected");
				break;
			}
			case 1.0: {
				$("#audioBoostNormal").removeClass("selected");
				$("#audioBoostBoost").removeClass("selected");
				$("#audioBoostMax").addClass("selected");
				break;
			}
			default: {
				$("#audioBoostNormal").removeClass("selected");
				$("#audioBoostBoost").removeClass("selected");
				$("#audioBoostMax").removeClass("selected");
				break;
			}
		}
		$("#audioBoost").removeClass("disabled");
	} else {
		$("#audioBoostNormal").addClass("selected");
		$("#audioBoostBoost").removeClass("selected");
		$("#audioBoostMax").removeClass("selected");
		$("#audioBoost").addClass("disabled");
	}

	// brightness
	if (remoteRobotSupports("brightness")) {
		$("#brightnessSlider").prop('disabled', false);
		$("#brightnessSlider").val(statusValues.brightness * 100);
		lastBrightnessSent = statusValues.brightness;
	} else {
		$("#brightnessSlider").prop('disabled', true);
	}

	if (remoteRobotSupports("cameraKitIsConnected")) {
		if ("floorViewEnabled" in statusValues) {
			if (statusValues.floorViewEnabled) {
				showAlwaysOnFloorView();
			} else {
				hideAlwaysOnFloorView();
			}
		}
		if ("cameraKitEnabled" in statusValues) {
			if (statusValues.cameraKitEnabled) {
				enterCameraKitMode();
			} else {
				exitCameraKitMode();
			}
		} else {
			enterCameraKitMode();
			cameraKitEnabled = true;
		}
	} else {
		exitCameraKitMode();
	}

	if ("sharpenFilterEnabled" in statusValues) {
		sharpenFilterEnabled = statusValues.sharpenFilterEnabled;
	}

	if (remoteRobotSupports("webcamSwitching")) {
		$("#webcamSetupButton").show();
	} else {
		$("#webcamSetupButton").hide();
	}

	// Speaker volume slider - keep this as the last one in the function
	try {
		if (opentokSubscriber != undefined && opentokSubscriber.getAudioVolume != undefined) {
			// $("#speakerVolumeSlider").simpleSlider("setValue", opentokSubscriber.getAudioVolume() / 100);
			// $("#nativeSpeakerVolumeSlider").val(opentokSubscriber.getAudioVolume());
		}
	} catch (err) {

	}
}

function nativePoleSliderDidChange() {
	clearKeyboardCommands();
	poleToSend = $("#nativePoleSlider").val() / 100;
	newEvent=true;
	allowPoleUpdate = false;
}

function fireDriveCommands() {
	var drive = (forwardState == 1) ? forwardSpeed : ((backwardState) ? backwardSpeed : 0);
	var turn = (leftState == 1) ? leftSpeed : ((rightState) ? rightSpeed : 0);
	var pole = (poleUpState == 1) ? 200 : ((poleDownState) ? -200 : 0);

	if (forwardState == 0 && backwardState == 0 && throttleSpeed != 0) {
		drive = throttleSpeed * 100;
	}
	if (leftState == 0 && rightState == 0 && turnSpeed != 0) {
		turn = turnSpeed * 100 * -1;
	}

	// turn by scroll
	if (drive == 0) {
		scrollValue = 0;
	}
	if (scrollValue != 0) {
		if (scrollValue > 0) {
			// scroll left
			turn = -35;
			scrollValue = Math.max(scrollValue - 200, 0);
		} else {
			// scroll right
			turn = 35;
			scrollValue = Math.min(scrollValue + 200, 0);
		}
	}

	// Only send neutral drive/turn commands 10 times then stop
	if (drive == 0 && turn == 0) {
		neutralDriveCommandsSent++;
	} else {
		neutralDriveCommandsSent = 0;
	}

	if (neutralDriveCommandsSent < 10) {
		//console.log("drive: " + drive + ", turn: " + turn);
		sendCommandWithData(kDRCommandControlDrive, { "drive" : drive, "turn" : turn, "powerDrive": powerDriveOn });
	}

	if (robotSpeakerVolumeToSend != -1) {
		sendCommandWithData(kDRCommandVolumeChanged, { volume: robotSpeakerVolumeToSend });
		robotSpeakerVolumeToSend = -1;
	}

	if (poleToSend != -1) {
		if (remoteRobotSupports("poleTargets")) {
			//trackedPoleVal = poleToSend;
			//console.log("[Func_654] PoleVal [" + trackedPoleVal + "]");
			//Aneesh: Disable sending of any pole updates other than joystick until UI is modified
			//sendCommandWithData(kDRCommandControlPole, { "target" : poleToSend });
		}
		poleToSend = -1;
	} else {
		// Only send neutral pole commands 10 times then stop
		if (pole == 0) {
			neutralPoleCommandsSent++;
		} else {
			neutralPoleCommandsSent = 0;
		}

		if (neutralPoleCommandsSent < 10) {
			//console.log("pole: " + pole);
			//trackedPoleVal += pole;
			//console.log("[Func_669] PoleVal [" + trackedPoleVal + "]");
			//Aneesh: Disable sending of any pole updates other than joystick until UI is modified
			//sendCommandWithData(kDRCommandControlPole, { "pole" : pole });
		}
	}

	if (nextZoomCenter) {
		sendZoom();
	}

	// send brightness
	var value = $("#brightnessSlider").val()/100;
	if (lastBrightnessSent != -1 && lastBrightnessSent != value) {
		sendCommandWithData(kDRCommandSetRobotScreenBrightness, { "brightness" : value });
		lastBrightnessSent = value;
	}

	if (drive != 0) {
		statsDrive = 1;
	}
	if (powerDriveOn) {
		statsPowerDrive = 1;
	}
	if (turn != 0) {
		statsTurn = 1;
	}
	if (pole != 0) {
		statsPole = 1;
	}
}

console.log("modifiedDBL.js is loaded");
