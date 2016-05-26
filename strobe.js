//MAN = function 1 - dbl - nightmode
//MAN = function 2 - wakt up, press 1 time enter daymode. (shuts off all light) - buttndown.
//MAN = function 3 - set all light standard colors -
//MAN = function 4 - panick mode. - hold button
//Require johnny-five, arduino board and the buttons
var five = require("johnny-five"),
    board, button1, button2;
//Create a new board
board = new five.Board();
var on;
var sat;
var hue;
var bri;
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
var timerOneclick = 1250;
var timerDblClick = 1500;
var singelTimer;
//Count our clicks
var count = 0;
//API for Phillips Hue
var HueApi = "http://192.168.10.247/api/28dd08062078de67270d8b6ab5b3f9b";
//Bedroom
var lamp1 = "1/state";
//Livingroom
var lamp2 = "2/state";
//Hallway
var lamp3 = "3/state";
var lamps = [];
var interval;
var settings;
board.on("ready", function() {
    // Create a new `button` hardware instance.
    // This example allows the button module to
    // create a completely default instance
    button1 = new five.Button({
        pin: 2,
        holdtime: 1000
    });
    button2 = new five.Button({
        pin: 3,
        holdtime: 1000
    });
    //creates a pizo obj and defines the pin to be used for the signal
    var piezo = new five.Piezo(5);
    board.repl.inject({
        piezo: piezo
    });

    function getJSONfile() {
            request('http://xn--paulinehgh-lcb.se/smarthome/json.php',
                function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var data = JSON.parse(body)
                        settings = data;
                    }
                });
        }
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
                //  console.log('found bridge');
                foundBridge = true;
                fetchLights();
                getJSONfile();
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

    function changeColor(lamp, statement) {
        request({
            method: "PUT",
            url: HueApi + lamp,
            json: statement
        });
    }

    function turnOff(lamp) {
            settings.dayMode.lights.forEach(function(
                light) {
                changeColor("/lights/" + light.id
                    .substr(-1) + "/state", {
                        on: light.on,
                        sat: light.sat,
                        bri: light.bri,
                        hue: light.hue
                    });
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
                if (now.getHours() == 15 && now.getMinutes() == 42) {
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
    button1.on("down", buttonDownMultiClick);
    button1.on("up", buttonUp);
    button2.on("down", buttonTwoDown);
    button2.on("hold", buttonPanic);
    button2.on("up", buttonUp);
    //When you press buttonDown,  change color to all three lamps
    function buttonPanic() {
        if (!foundBridge) {
            console.log('bridge doesnt exist');
            return;
        } else if (!settings) {
            console.log('settings har inte hämtats');
            return false;
        } else if (isHoldingDown == false) {
            isHoldingDown = true;
            clearTimeout(singelTimer);
            count = 0;
            var alert = "lselect";
            settings.panicMode.lights.forEach(function(light) {
                changeColor("/lights/" + light.id.substr(-1) +
                    "/state", {
                        on: light.on,
                        sat: light.sat,
                        bri: light.bri,
                        hue: light.hue,
                        alert: light.alert
                    });
            });
            console.log("Hold Mode");
            /*    interval = setInterval(function() {
              piezo.play({
                  song: "C C C C",
                  beats: 1 / 4,
                  tempo: 100
              });
          }, 3000);
          setTimeout(function() {
              clearInterval(interval);
          }, 20000);*/
        }
    }

    function buttonDownMultiClick() {
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
                    dayMode();
                    console.log("one click");
                }, timerOneclick);
                //Else if clicks = 2
            } else if (count === 2) {
                //Change color on lamps
                if (!settings) {
                    console.log('settings har inte hämtats');
                    return false;
                }
                clearTimeout(singelTimer);
                doubleTimer = setTimeout(function() {
                    count = 0;
                    settings.nightMode.lights.forEach(function(
                        light) {
                        changeColor("/lights/" + light.id
                            .substr(-1) + "/state", {
                                on: light.on,
                                sat: light.sat,
                                bri: light.bri,
                                hue: light.hue
                            });
                    });
                    console.log("två klick");
                }, timerDblClick);
            } else if (count === 3) {
                if (!settings) {
                    console.log('settings har inte hämtats');
                    return false;
                }
                count = 0;
                settings.standard.lights.forEach(function(light) {
                    changeColor("/lights/" + light.id.substr(-1) +
                        "/state", {
                            on: light.on,
                            sat: light.sat,
                            bri: light.bri,
                            hue: light.hue
                        });
                });
                clearTimeout(doubleTimer);
                clearInterval(interval);
                console.log("tre klick");
            }
        }
        // When you hold down the button for a certain time, change the color.
        //When button is up, change the button state to false.

    function buttonUp() {
            isHoldingDown = false;
        }
        // buttonTwoDown, change all three lamps to same color when pressed down

    function buttonTwoDown() {
        if (!foundBridge) {
            console.log('bridge doesnt exist');
            return;
        }
        //Count our clicks
        count++;
        //If one click
        if (count === 1) {
            singelTimer = setTimeout(function() {
                count = 0;
                console.log("One Click Button two");
            }, timerOneclick);
        } else if (count === 2) {
            clearTimeout(singelTimer);
            doubleTimer = setTimeout(function() {
                count = 0;
                awayMode();
                setInterval(awayMode, 60*10*1000);
            }, timerDblClick);
        } else if (count === 3) {
            count = 0;
            settings.standard.lights.forEach(function(light) {
                changeColor("/lights/" + light.id.substr(-1) +
                    "/state", {
                        on: light.on,
                        sat: light.sat,
                        bri: light.bri,
                        hue: light.hue
                    });
            });
            clearTimeout(doubleTimer);
            clearInterval(interval);
            console.log("tre klick btn 3");
        }
    }

    function awayMode() {
        //Get current date in milliseconds
        var nu = new Date();
        //Get current time 10:28
        var tid = nu.getHours();
        if (!settings) {
            console.log('settings har inte hämtats');
            return false;
        }
        var obj = settings.awayMode.cycle;
        var arr = [];
        var ljus = "lights" + nu.getHours();
        for (var prop in obj) {
            arr.push(prop);
        }
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == ljus) {
                var lol = arr[i];
                console.log(lol);
            }
        }
        settings.awayMode.cycle[lol].forEach(function(light) {
            changeColor("/lights/" + light.id.substr(-1) +
                "/state", {
                    on: light.on,
                    sat: light.sat,
                    bri: light.bri,
                    hue: light.hue
                });
        });
        console.log("awayMode");
    }
});
