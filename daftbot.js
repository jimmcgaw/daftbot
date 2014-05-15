var gpio = require('pi-gpio');

// entry point for daftbot npm module

(function(){
  var daftbot = {};

  var LOW = 0;
  var HIGH = 1;



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
    // TODO : abstract this away
    gpio.write(this.pins.motor_2, LOW, function(){});
    gpio.write(this.pins.motor_1, HIGH, function(){});
  };

  // start motor backwards
  Motor.prototype.reverse = function(){
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
    gpio.open(this.pinIn, "input", function(){});
    
    var whisker_out = this.out;
    gpio.open(whisker_out, "output", function(){
      gpio.write(whisker_out, HIGH, function(){});
    });

  };

  daftbot.Whisker = Whisker;


  // car brain - this commands and manages the motors in aggregate
  // @param Array 'motors' - array of Motor objects
  // @param Array 'whiskers' - array of Whisker objects
  //
  var Vehicle = function(motors, sensors){
    this.motors = [];
    this.sensors = [];

    this.leftMotor = motors.leftMotor;
    this.rightMotor = motors.rightMotor;

    this.addMotor(this.leftMotor);
    this.addMotor(this.rightMotor);

    this.state = "forward";
  };

  Vehicle.prototype.addMotor = function(motor){
    this.motors.push(motor);
  };

  Vehicle.prototype.addSensor = function(sensor){
    this.sensors.push(sensor);
  };

  Vehicle.prototype.forward = function(){
    for (var i = 0, len = this.motors.length; i < len; i++){
      this.motors[i].forward();
    }
  };

  Vehicle.prototype.reverse = function(){
    for (var i = 0, len = this.motors.length; i < len; i++){
      this.motors[i].reverse();
    }
  };

  Vehicle.prototype.halt = function(){
    for (var i = 0, len = this.motors.length; i < len; i++){ 
      this.motors[i].halt();
    } 
  };

  Vehicle.prototype.right = function(){
    this.halt();
    this.leftMotor.forward();
    this.rightMotor.reverse();
  };

  Vehicle.prototype.left = function(){
    this.halt();
    this.rightMotor.forward();
    this.leftMotor.reverse();
  };

  Vehicle.prototype.rotate = function(){
      this.left();
  };


  // enables all motors and sensors
  Vehicle.prototype.startEngine = function(){
    for (var i = 0, len = this.motors.length; i < len; i++){
      this.motors[i].enable();
    }
    for (var i = 0, len = this.sensors.length; i < len; i++){
      this.sensors[i].enable();
    }
  };

  Vehicle.prototype.getWhiskers = function(){
    return this.sensors.filter(function(sensor){
      return sensor instanceof Whisker;
    });
  };


  Vehicle.prototype.checkWhiskers = function(){
    // if this.state !== "forward"{
    //   return;
    // }

    var vehicle = this;
    var whiskers = this.getWhiskers();
    for (var i = 0, len = whiskers.length; i < len; i++){
      var whisker = whiskers[i];
      gpio.read(whisker.pinIn, function(err, value){
        console.log(value);
        if (value === HIGH){
          // we have a collision, reset
          vehicle.reset();
        }
      });
    }

  };

  // intiates a state sequence that resets the robot
  // to forward in a different direction.
  Vehicle.prototype.reset = function(){
    var vehicle = this;

    // stop robot immediately ( t = 0 seconds )
    vehicle.state = "halt";

    // t = 1 : go in reverse 
    setTimeout(function(){
      vehicle.state = "reverse";
    }, 1000);

    // t = 1.5 : stop again 
    setTimeout(function(){
      vehicle.state = "halt"
    }, 1500);

    // t = 2 : rotate
    setTimeout(function(){
      vehicle.state = "rotate"
    }, 2000);

    // t = 3.5 : stop again
    setTimeout(function(){
      vehicle.state = "halt"
    }, 3500);

    // t = 4: stop again
    setTimeout(function(){
      vehicle.state = "forward"
    }, 4000);
  };

  // runs in loop; checks whiskers and turns robot if
  // we detect a whisker collision
  Vehicle.prototype.update = function(){

    // check object state
    if (this.state === "forward"){
      this.forward();
      this.checkWhiskers();
    } else if (this.state === "halt"){
      this.halt();
    } else if (this.state === "reverse") {
      this.reverse();
    } else if (this.state === "rotate") {
      this.rotate();
    }

  };

  daftbot.Vehicle = Vehicle;



  module.exports = daftbot;
}());




