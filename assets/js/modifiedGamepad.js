var leftBumper = true; //centering robot/thirdeye
var rightBumper = true; //centering robot/thirdeye
var directPad = true; //downview
var leftTrigger = true;//thirdeye
var rightTrigger = true; //firstperson
var speed; //robot speed after mapping (no direction)
var topStick_left;
var topStick_right;
var topStick_forward;
var topStick_backward;
var bottomStick_left;
var bottomStick_right;
var bottomStick_forward;
var bottomStick_backward;
var angle; //thirdeye angle after mapping
var defaultCtrl = true;

function DBLGamepad(gamepad) {
	if (!gamepad) {
		return null;
	}
	this.index = gamepad.index;
	this.gamepad = gamepad;
	this.lastButtons = [];
	this.lastAxes = [];
	this.lastAxes[5] = 0;
	this.lastAxes[1] = 0;
	this.lastAxes[2] = 0;
	this.lastAxes[0] = 0;
	this.lastAxes[9] = 8;
	this.buttonMap = [];
	this.axisMap = [];

	this.buttonChanged = function (index, val) {
		val = parseFloat(val);
		if (this.lastButtons[index] != undefined) {
			if (this.lastButtons[index] != val) {
				if (val >= 1.0) {
					this.buttonDown(index);
				} else {
					this.buttonUp(index);
				}
			}
		}
		this.lastButtons[index] = val;
		// console.log("button "+ index +" = "+ val);
	}

	this.axisChanged = function (index, val) {
		index = this.mappedAxis(index);
		if (index == -1) { return; }

		this.lastAxes[index] = val;
		//console.log(this.index +" axis"+ index +" = "+ val +" "+ parseFloat(val));

		switch (index) {
			case 0:
				if(!defaultCtrl) {
					if(val<0){
						topStick_left = mapSpeedNeg(val)
						topStick_right=0;
					}
					if(val>0){
						topStick_right = mapSpeed(val)
						topStick_left=0;
					}
				} else {
					 if(val<0){
						 topStick_left = mapAngleNeg(val)
						 topStick_right=0;
					 }
					 if(val>0){
						 topStick_right = mapAngle(val)
						 topStick_left=0;
					 }
					 console.log("topStick: (" + topStick_left + ", " + topStick_right + ")");
			 	}
				break;
			case 1:
				if(val<0) {
					topStick_forward = mapSpeedNeg(val)
					topStick_backward=0;
				}
				if(val>0) {
					topStick_backward = mapSpeed(val)
					topStick_forward=0;
				}
				break;
			case 2:
				if(defaultCtrl){
							if(val<0) {
								bottomStick_left = mapSpeedNeg(val)
								bottomStick_right=0;
							}
							if(val>0) {
								bottomStick_right = mapSpeed(val)
								bottomStick_left=0;
							}
						}
				else{
					if(val<0) {
						bottomStick_left = mapAngleNeg(val)
						bottomStick_right=0;
					}
					if(val>0) {
						bottomStick_right = mapAngle(val)
						bottomStick_left=0;
					}
				}
				break;
		  case 5:
				if(val<0) {
					bottomStick_forward = mapSpeedNeg(val)
					bottomStick_backward=0;
				}
				if(val>0) {
					bottomStick_backward = mapSpeed(val)
					bottomStick_forward=0;
				}
				break;

		}

		if (!$("#session").is(":visible")) {
			return;
		}
		switch (index) {
			case 1: // left stick, forward (-1), back (+1)
			if(defaultCtrl){}
			else{
				if (val < 0 && kickstandState == kDRKickstand_stateDeployed) {
					parkAction();
				}
				throttleSpeed = Math.min(1, Math.max(-1, val));
			}
			break;
			case 5: // right stick, forward (-1), back (+1)
				if(defaultCtrl){
				if (val < 0 && kickstandState == kDRKickstand_stateDeployed) {
					parkAction();
				}
				throttleSpeed = Math.min(1, Math.max(-1, val));}
				else{}
				break;
			case 0: // left stick, left (-1), right (+1)
			if(defaultCtrl){}
			else{
				turnSpeed = Math.min(1, Math.max(-1, val));
			}
			break;
			case 2: // right stick, left (-1), right (+1)
				if(defaultCtrl){
				turnSpeed = Math.min(1, Math.max(-1, val));
			}
			else{
			}
				break;
			case 9:
				if (parseFloat(val) == 0) {
					throttleSpeed = 0;
					turnSpeed = 0;
				} else {
					var rounded = Math.round((parseFloat(val) + 1.0) * 3.5); // clockwise positions 0-7, 8=off
					//console.log("rounded = "+ rounded +", "+ val);
					switch (rounded) {
						case 0:
							if (defaultCtrl){
								throttleSpeed = -1;
								turnSpeed = 0;
							}
							else{
								throttleSpeed = 0;
								turnSpeed = 1;
							}
							break;
						case 1:
							if (defaultCtrl){
								throttleSpeed = -0.5;
								turnSpeed = 0.5;
							}
							else{
								throttleSpeed = 0.5;
								turnSpeed = -0.5;
							}
							break;
						case 2:
							if (defaultCtrl){
								throttleSpeed = 0;
								turnSpeed = 1;
							}
							else{
								throttleSpeed = -1;
								turnSpeed = 0;
							}
							break;
						case 3:
							throttleSpeed = 0.5;
							turnSpeed = 0.5;
							break;
						case 4:
							throttleSpeed = 1;
							turnSpeed = 0;
							break;
						case 5:
							if (defaultCtrl){
							throttleSpeed = 0.5;
							turnSpeed = -0.5;
						}
						else{
							throttleSpeed = -0.5;
							turnSpeed = 0.5;
						}
							break;
						case 6:
							throttleSpeed = 0;
							turnSpeed = -1;
							break;
						case 7:
							throttleSpeed = -0.5;
							turnSpeed = -0.5;
							break;
						case 8:
							throttleSpeed = 0;
							turnSpeed = 0;
							break;
					}
				}
				break;
		}
	}

	this.didDisconnect = function () {
		this.lastButtons = [];
		this.lastAxes = [];
	}

	this.buttonDown = function (index) {
		index = this.mappedButton(index);
		if (index == -1) { return; }

		// console.log(this.index +" "+ index +" down");
		if (!$("#session").is(":visible")) {
			return;
		}
		switch (index) {
			case 0:
	 			//flipAction();
				break;
			case 1:
	 			//poleDownState = 1;
	 			trackedPoleVal -= 0.15;
	 			if(trackedPoleVal < 0)
	 				trackedPoleVal = 0;
	 			sendCommandWithData(kDRCommandControlPole, { "target" : trackedPoleVal });
	 			logPoleVal = trackedPoleVal;
	 			console.log("LOW: " + logPoleVal);
				break;
			case 2:
				parkAction();
				break;
			case 3:
	 			//poleUpState = 1;
	 			trackedPoleVal += 0.15;
	 			if(trackedPoleVal > 0.60)
	 				trackedPoleVal = 0.60;
	 			sendCommandWithData(kDRCommandControlPole, { "target" : trackedPoleVal });
	 			logPoleVal = trackedPoleVal;
	 			console.log("HIGH: " + logPoleVal);
				break;
			case 4:
				leftBumper=true;
				break;
			case 5:
				powerDriveOn = true;
				rightBumper=true;
				break;
			case 6:
				leftTrigger=true;
				break;
			case 7:
				rightTrigger=true;
				break;
			case 12:
			 directPad = true; //downview
				break;
			case 13:
				directPad = true; //downview
				break;
			case 14:
				directPad = true; //downview
				break;
			case 15:
				directPad = true; //downview
				break;
		}
	}

	this.buttonUp = function (index) {
		index = this.mappedButton(index);
		if (index == -1) { return; }

		// console.log(this.index +" "+ index +" up");
		if (!$("#session").is(":visible")) {
			return;
		}
		switch (index) {
			case 0:
	 			// floor camera flip, none on up
				break;
			case 1:
	 			poleDownState = 0;
				break;
			case 2:
				// park action, none on up
				break;
			case 3:
	 			poleUpState = 0;
				break;
			case 5:
				if (rightBumper){
					rightBumper = false;
				}
				powerDriveOn = false;
				break;
			case 4:
				if (leftBumper){
				leftBumper = false;
				}
				break;
	  		case 6:
				if(leftTrigger){
					leftTrigger = false;}
				break;
			case 7:
				if(rightTrigger){
					rightTrigger = false;}
				break;
			case 12:
				if (directPad){
					directPad = false;
					flipAction()
				}
				break;
			case 13:
				if (directPad){
					directPad = false;
					flipAction()
				}
				break;
			case 14:
				if (directPad){
					directPad = false;
					flipAction()
				}
				break;
			case 15:
				if (directPad){
					directPad = false;
					flipAction()
				}
				break;
		}
	}

	this.determineMaps = function () {
		if (this.gamepad.mapping == "standard") {
			this.buttonMap = [];
			this.buttonMap[0] = 1;
			this.buttonMap[1] = 2;
			this.buttonMap[2] = 0;
			this.buttonMap[3] = 3;
			this.buttonMap[4] = 4;
			this.buttonMap[5] = 5;
			this.buttonMap[6] = 6;
			this.buttonMap[7] = 7;
			this.buttonMap[8] = 8;
			this.buttonMap[9] = 9;
			this.buttonMap[10] = 10;
			this.buttonMap[11] = 11;
			this.buttonMap[12] = 12;
			this.buttonMap[13] = 13;
			this.buttonMap[14] = 14;
			this.buttonMap[15] = 15;
			this.buttonMap[16] = 12;
			this.axisMap = [];
			this.axisMap[0] = 0;
			this.axisMap[1] = 1;
			this.axisMap[2] = 2;
			this.axisMap[3] = 5;
		} else {
			this.buttonMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
			this.axisMap = [0, 1, 2, 3, -1, 5, -1, -1, -1, 9];
		}
	}

	this.mappedButton = function (input) {
		if (input >= this.buttonMap.length) {
			return -1;
		}
		return this.buttonMap[input];
	}

	this.mappedAxis = function (input) {
		if (input >= this.axisMap.length) {
			return -1;
		}
		return this.axisMap[input];
	}

	this.determineMaps();
}

function mapSpeed(key){
      key = key*10;
      var roundedspeed = Math.round(key)
      switch (roundedspeed) {
        case 0:
        case 1: speed = 0;
                break;
        case 2: speed = 40;
                break;
        case 3:
        case 4:speed = 80;
                break;
        case 5:
        case 6:speed = 120;
                break;
        case 7:
        case 8:speed = 160;
                break;
        case 9:
        case 10: speed = 200;
                break;
        default: speed = 0;
                break;
      }
      return speed;
    }
		function mapAngle(input){
		      input = input*10;
		      var roundedangle = Math.round(input)
		      switch (roundedangle) {
		        case 0:
		        case 1: angle = 0;
		                break;
		        case 2: angle = 10;
		                break;
		        case 3: angle = 20;
						break;
		        case 4: angle = 30;
		                break;
		        case 5: angle = 40;
						break;
		        case 6: angle = 50;
		                break;
		        case 7: angle = 60;
						break;
		        case 8: angle =  70;
		                break;
		        case 9: angle = 80;
						break;
		        case 10:angle = 90;
		                break;
		        default: angle = 0;
		                break;
		      }
		      return angle;
		    }

    function mapSpeedNeg(key){
      key = key*10;
      var roundedspeed = Math.round(key)
      switch (roundedspeed) {
        case -0:
        case -1: speed = 0;
                break;
        case -2: speed = 40;
                break;
        case -3:
        case -4:speed = 80;
                break;
        case -5:
        case -6:speed = 120;
                break;
        case -7:
        case -8:speed = 160;
                break;
        case -9:
        case -10:speed = 200;
                break;
        default: speed = 0;
                break;
      }
      return speed;
    }

	function mapAngleNeg(input){
				input = input*10;
				var roundedangle = Math.round(input)
				switch (roundedangle) {
					case -0:
					case -1: angle = 0;
									break;
					case -2: angle = -10;
									break;
					case -3: angle = -20;
									break;
					case -4: angle = -30;
									break;
					case -5: angle = -40;
									break;
					case -6: angle = -50;
									break;
					case -7: angle = -60;
									break;
					case -8: angle =  -70;
									break;
					case -9: angle = -80;
									break;
					case -10: angle = -90;
									break;
					default: angle = 0;
									break;
				}
				return angle;
	}

console.log("modifiedGamepad.js is loaded");
