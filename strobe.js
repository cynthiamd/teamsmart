//MAN = function 1 - dbl - nightmode
//MAN = function 2 - wakt up, press 1 time enter daymode. (shuts off all light) - buttndown.
//MAN = function 3 - set all light standard colors -
//MAN = function 4 - panick mode. - hold button
//Require johnny-five, arduino board and the buttons
var five = require("johnny-five"),
    board, button1, button2;
//Create a new board
board = new five.Board();
//require request libary
var request = require('request');
var dns = require("dns");
var ping = require('net-ping');
var session = ping.createSession();
var foundBridge = false;
var ipAdress = "192.168.10.247";
//If not holding button down.
var isHoldingDown = false;
//Our timer for double click
var timer = 1000;
//Count our clicks
var count = 0;
//API for Phillips Hue
var HueApi =
    "http://192.168.10.247/api/28dd08062078de67270d8b6ab5b3f9b/lights/";
//Bedroom
var lamp1 = "1/state";
//Livingroom
var lamp2 = "2/state";
//Hallway
var lamp3 = "3/state";
var lamps = [];
var interval;
board.on("ready", function() {
    // Create a new `button` hardware instance.
    // This example allows the button module to
    // create a completely default instance
    button1 = new five.Button({
        pin: 2,
        holdtime: 350
    });
    button2 = new five.Button({
        pin: 3,
        holdtime: 350
    });
    //creates a pizo obj and defines the pin to be used for the signal
    var piezo = new five.Piezo(5);
    board.repl.inject({
        piezo: piezo
    });
    //Controlling the net connection every 10 seconds
    setInterval(controllConnection, 1000);

    function controllConnection() {
        session.pingHost(ipAdress, function(err, t) {
            if (err) {
                piezo.play({
                    song: "C C C C",
                    beats: 1 / 4,
                    tempo: 100
                });
                console.log('cant find bridge');
            } else {
                console.log('found bridge');
                foundBridge = true;
                fetchLights();
            }
        });
    }

    function fetchLights() {
            request({
                method: 'POST',
                url: HueApi
            }, function(err, res, body) {
                if (err) {
                    piezo.play({
                        song: "C C C C",
                        beats: 1 / 4,
                        tempo: 100
                    });
                    console.log('error', err);
                    return;
                }
                //      console.log('search for lights', body);
                request(HueApi, function(err, res, body) {
                    if (err) {
                        piezo.play({
                            song: "C C C C",
                            beats: 1 / 4,
                            tempo: 100
                        });
                        console.log('error', err);
                        return;
                    }
                    //    console.log('get new lights', body);
                    var json = JSON.parse(body);
                    for (lamp in json) {
                        lamps.push(json[lamp]);
                    }
                    //    console.log(lamps);
                });
            });
        }
        //Function for changing light on Hue!

    function changeColor(lamp, sat, bri, hue, xy, alert) {
        request({
            method: "PUT",
            url: HueApi + lamp,
            json: {
                on: true,
                sat: sat,
                bri: bri,
                hue: hue,
                transitiontime: 0,
                alert: alert,
                effect: "none",
                xy: xy
            }
        });
    }

    function turnOff(lamp) {
            request({
                method: "PUT",
                url: HueApi + lamp,
                json: {
                    on: false,
                    transitiontime: 0,
                    alert: "none",
                    effect: "none"
                }
            }, function(err, res, body) {
                //console error
                console.log("err?", err);
            });
        }
        //Set Daymode with 60sek interval
    setInterval(dayMode, 60000);

    function dayMode() {
            //Get current date in milliseconds
            var now = new Date();
            //Get current time 10:28
            var timefor = now.getHours() + ":" + now.getMinutes();
            //Get current weekday number 0-6
            var day = now.getDay();
            //Check if its a weekday else its weekend
            if (day !== 0 && day !== 6) {
                if (now.getHours() == 14 && now.getMinutes() == 10) {
                    if (!foundBridge) {
                        console.log('bridge doesnt exist');
                        return;
                    }
                    //Turn off lamps
                    turnOff(lamp1);
                    turnOff(lamp2);
                    turnOff(lamp3);
                    console.log("Daymode");
                }
            } else {
                if (now.getHours() == 10 && now.getMinutes() == 15) {
                    if (!foundBridge) {
                        console.log('bridge doesnt exist');
                        return;
                    }
                    //Turn off lamps
                    turnOff(lamp1);
                    turnOff(lamp2);
                    turnOff(lamp3);
                    console.log("Daymode");
                }
            }
        }
        //When presses down, one click
    button1.on("hold", buttonPanic);
    button1.on("down", buttonDownDblClick);
    button1.on("up", buttonUp);
    button2.on("down", buttonTwoDown);
    button2.on("hold", buttonPanic);
    button2.on("up", buttonUp);
    //When you press buttonDown,  change color to all three lamps





    function buttonPanic() {
        if (!foundBridge) {
            console.log('bridge doesnt exist');
            return;
        }
        //Count
        if (isHoldingDown == false) {
            isHoldingDown = true;
            var alert = "lselect";
            changeColor(lamp1, 255, 250, 50000, "", alert);
            changeColor(lamp2, 255, 250, 50000, "", alert);
            changeColor(lamp3, 255, 250, 50000, "", alert);
            interval = setInterval(function() {
                piezo.play({
                    song: "C C C C",
                    beats: 1 / 4,
                    tempo: 100
                });
            }, 3000);
            setTimeout(function() {
                clearInterval(interval);
            }, 20000);
        }
    }

    function buttonDownDblClick() {
            if (!foundBridge) {
                console.log('bridge doesnt exist');
                return;
            }
            //Count our clicks
            count++;
            //If one click
            if (count === 1) {
                //Set timer
                singelTimer = setTimeout(function() {
                    //Count 0
                    count = 0;
                    //Change color on lamps
                    changeColor(lamp1, 100, 100, 20000);
                    changeColor(lamp2, 100, 100, 20000);
                    changeColor(lamp3, 100, 100, 20000);
                    console.log("ett klick");
                }, timer);
                clearInterval(interval);
                //Else if clicks = 2
            } else if (count === 2) {
                //Change color on lamps
                count = 0;
                changeColor(lamp1, 240, 140, 65280, [0.6621, 0.3023]);
                changeColor(lamp2, 100, 60, 65280, [0.5136, 0.4444]); //Goldenrod XY Color
                changeColor(lamp3, 100, 60, 65280, [0.5136, 0.4444]); //Goldenrod XY Color
                console.log("två klick");
                clearTimeout(singelTimer);
            }
        }
        // When you hold down the button for a certain time, change the color.

        //When button is up, change the button state to false.

    function buttonUp() {
            isHoldingDown = false;
        }
        // buttonTwoDown, change all three lamps to same color when pressed down

    function buttonTwoDown() {
            //Change color!
            changeColor(lamp1, 240, 10, 65280);
            changeColor(lamp2, 240, 10, 65280);
            changeColor(lamp3, 240, 10, 65280);
            clearInterval(interval);
        }
        //Panick button, when hold down, turn all three lights same color and blinking 30 times, speaker gives
        //of a sound every 3 seconds for 20 seconds or until standard button is pressed.


});
