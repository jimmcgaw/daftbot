// entry point for daftbot npm module

(function(){
	var daftbot = {};
	// this controls the state of a single servo motor
	//
	// @param Object 'pins'
	//   pins.motor_1
	//   pins.motor_2
	var Motor = function(pins){
	  this.pins = pins;

	  return this;
	};

	Motor.prototype.enable = function(){
	  console.log("enabling motor pins " + this.pins.motor_1 + " and " + this.pins.motor_2);
	  gpio.open(this.pins.motor_1, "output", function(){})
	  gpio.open(this.pins.motor_2, "output", function(){})
	  
	};

	// bring to complete stop
	Motor.prototype.halt = function(){
	  gpio.write(this.pins.motor_1, LOW, function(){});
	  gpio.write(this.pins.motor_2, LOW, function(){});
	};

	// start motor forward
	Motor.prototype.forward = function(){
	  console.log("Motor on pin " + this.pins.motor_1 + " set to forward");
	  // TODO : abstract this away
	  gpio.write(this.pins.motor_2, LOW, function(){});
	  gpio.write(this.pins.motor_1, HIGH, function(){});
	};

	// start motor backwards
	Motor.prototype.reverse = function(){
	  console.log("Motor on pin " + this.pins.motor_1 + " set to forward");
	  // TODO : abstract this away
	  gpio.write(this.pins.motor_1, LOW, function(){});
	  gpio.write(this.pins.motor_2, HIGH, function(){});
	};

	daftbot.Motor = Motor;

	// manages and senses the state of a single whisker
	//
	// @param Object 'pins'
	//   pins.pinIn
	//   pins.out
	var Whisker = function(pins){
	  this.pinIn = pins.pinIn;
	  this.out = pins.out; 
	};

	Whisker.prototype.enable = function(){
	  console.log("enabling whisker pins " + this.pinIn + " and " + this.out);
	  gpio.open(this.pinIn, "input", function(){});
	  
	  var whisker_out = this.out;
	  gpio.open(whisker_out, "output", function(){
	    gpio.write(whisker_out, HIGH, function(){});
	  });

	};

	daftbot.Whisker = Whisker;



	module.exports = daftbot;
}());




