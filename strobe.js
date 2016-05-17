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
var timer = 400;
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
    setInterval(controllConnection, 10000);
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
                console.log('search for lights', body);
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
                    console.log('get new lights', body);
                    var json = JSON.parse(body);
                    for (lamp in json) {
                        lamps.push(json[lamp]);
                    }
                    console.log(lamps);
                });
            });
        }
        //Function for changing light on Hue!
    function changeColor(lamp, sat, bri, hue, xy) {
        request({
            method: "PUT",
            url: HueApi + lamp,
            json: {
                on: true,
                sat: sat,
                bri: bri,
                hue: hue,
                transitiontime: 0,
                alert: "none",
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
    button1.on("down", buttonDown, false);
    button1.on("hold", buttonHold);
    button1.on("up", buttonUp);
    button2.on("down", buttonTwoDown);

    //When you press buttonDown,  change color to all three lamps
    function buttonDown() {
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
            //Else if clicks = 2
        } else if (count === 2) {
            //Change color on lamps
            changeColor(lamp1, 240, 140, 65280, [0.6621, 0.3023]);
            changeColor(lamp2, 100, 60, 65280, [0.5136, 0.4444]); //Goldenrod XY Color
            changeColor(lamp3, 100, 60, 65280, [0.5136, 0.4444]); //Goldenrod XY Color
            console.log("två klick");
            //Clear timer!
            clearTimeout(singelTimer);
            count = 0;
        }
    }

    // When you hold down the button for a certain time, change the color.
    function buttonHold() {
        if (!foundBridge) {
            console.log('bridge doesnt exist');
            return;
        }
        //Count
        count = 0;
        //Clear timer
        clearTimeout(singelTimer);
        //If isHoldingDown = false, make it true!
        if (isHoldingDown == false) {
            isHoldingDown = true;
            //Change color!
            changeColor(lamp1, 100, 100, 50000);
            changeColor(lamp2, 100, 100, 50000);
            changeColor(lamp3, 100, 100, 50000);
        }
    }

    //When button is up, change the button state to false.
    function buttonUp() {
        isHoldingDown = false;
    }

    // buttonTwoDown, change all three lamps to same color when pressed down
    function buttonTwoDown() {
        //Change color!
        changeColor(lamp1, 100, 100, 10000);
        changeColor(lamp2, 100, 100, 10000);
        changeColor(lamp3, 100, 100, 10000);
    }
});
