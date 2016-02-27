// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

//possible emergency and offensive schemas to add detail to those fields

var SensorSchema = new Schema({
	sensorName: String,
	sensorType: String,
	sensorID: 	String,
	sensorValue: Number
});

var RobotSchema   = new Schema({
	home: String,
    name: String,
    updated: {type: Date, default: Date.now},
    sensors: [SensorSchema],
    movement: String,
    offensive: Boolean,
    emergency: Boolean,
    floor: Number,
    x_pos: Number,
    y_pos: Number
});

module.exports = mongoose.model('Robot', RobotSchema);
// module.exports = mongoose.model('Sensor', SensorSchema);