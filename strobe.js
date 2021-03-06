//Require johnny-five, arduino board and the button an saves it into a variable
var five = require("johnny-five"),
    board, button1, button2;
//Create an object of the arduino board
board = new five.Board();
//These global variable are used when making a request to philips hue api. it sets the stats on the lamp and the color we
//intend to use.
var on;
var sat;
var hue;
var bri;
//require request libary
var request = require('request');
//require the dns
var dns = require("dns");
//require the ping
var ping = require('net-ping');
//create a ping session an save it to a varibale
var session = ping.createSession();
//sets foundBridge to fales
var foundBridge = false;
//this is the ip adress we use to ping and check if there is an established connection with the host.
var ipAdress = "192.168.251.185";
//setting the varibale isHoldingDown to false.
var isHoldingDown = false;
//Our timer for on click event and its set at 1.25 seconds.
var timerOneclick = 1250;
//Our timer for a double click event and its set on 1.5 seconds
var timerDblClick = 1500;
//a global variblae for signletimer
var singelTimer;
//Count our clicks
var count = 0;
//API for Phillips Hue
var HueApi = "http://192.168.251.185/api/28dd08062078de67270d8b6ab5b3f9b";
//lamp for the Bedroom-
var lamp1 = "1/state";
//lamp for the Livingroom
var lamp2 = "2/state";
//lamp for the Hallway
var lamp3 = "3/state";
//Create and empty array and saves it to variable lamps
var lamps = [];
//global variable interval use to set and remember the latest interval used
var interval;
//global varibale settings used to store the latest settings from the settings file required from the php server.
var settings;

//Sets the entire arduino in ready state or activate it. Now the user can use the arduino board.
board.on("ready", function() {
    // Create a new `button` hardware instance.
    // This example allows the button module to
    // create a completely default instance
    //holdtime is the timer for how long you hold down the button.
    button1 = new five.Button({
    //button 1 is attachted to pin2 on the arduino board
        pin: 2,
        holdtime: 1000
    });
    button2 = new five.Button({
      //button 2 is attachted to pin3 on the arduino board
        pin: 3,
        holdtime: 1000
    });
    //creates a piezo obj and defines the pin to be used for the signal
    var piezo = new five.Piezo(5);
    board.repl.inject({
        piezo: piezo
    });
    // This function makes an request to get the settings file and save the data from the file into the variable settings.
    function getJSONfile() {
            request('http://xn--paulinehgh-lcb.se/smarthome/json.php',
                function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var data = JSON.parse(body)
                        settings = data;
                    }
                });
        }
    // This function will run the controllConnection function every 1 second.
    setInterval(controllConnection, 1000);
    //This function helps us control and check if we have an connection with the host, in this case philips hue.
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
    //This function makes an post request to philips hue api and if there is an problem, beep sound come off from the
    // piezo. otherwise make a new request to philips hue and get the lamps and save them into an array.
    function fetchLights() {
            //sends an request to philips hue api.
            request({
                method: 'POST',
                url: HueApi // the url we make the request to.
            }, function(err, res, body) {
                if (err) {
                  //plays a beep sound through piezo
                    piezo.play({
                        song: "C C C C",
                        beats: 1 / 4,
                        tempo: 100
                    });
                    console.log('error', err);
                    return;
                }
                request(HueApi, function(err, res, body) {
                    if (err) {
                      //plays a beep sound through piezo
                        piezo.play({
                            song: "C C C C",
                            beats: 1 / 4,
                            tempo: 100
                        });
                        console.log('error', err);
                        return;
                    }
                    var json = JSON.parse(body);
                    for (lamp in json) {
                        lamps.push(json[lamp]);
                    }
                });
            });
        }
    //This function changes the lamps color by making a request to philips hue api.
    function changeColor(lamp, statement) {
        request({
            method: "PUT",
            url: HueApi + lamp, // the url we send a request to.
            json: statement // takes an object containing properties: on,sat,bri and hue.
        });
    }
    //This function will turnoff the lamps by looking at the settings from the settings file and change the lamp according to it. It will go through all the lamps available and then shut it off.
    function turnOff(lamp) {
            settings.dayMode.lights.forEach(function(light) {
                changeColor("/lights/" + light.id.substr(-1) +
                    "/state", {
                        on: light.on, //on is the state of the lamp. its either true or fales.
                        sat: light.sat, // color saturation
                        bri: light.bri,// color brightness
                        hue: light.hue// hue?
                    });
            });
        }
    //Set Daymode and it will run every 60 seconds
    setInterval(dayMode, 60000);
    //This function activates day mode and shuts off the lights at a specified time.
    function dayMode() {
            //Creates and new date object.
            var now = new Date();
            //Get current time
            var timefor = now.getHours() + ":" + now.getMinutes();
            //Get current weekday number 0-6
            var day = now.getDay();
            //Check if its a weekday else its weekend
            if (day !== 0 && day !== 6) {
                if (now.getHours() == settings.dayMode.hours && now.getMinutes() ==
                    settings.dayMode.minute) {
                    if (!foundBridge) {
                        console.log('bridge doesnt exist');
                        return;
                    }
                    //Turn off lamp1,2 and 3
                    turnOff(lamp1);
                    turnOff(lamp2);
                    turnOff(lamp3);
                    console.log("Daymode");
                }
            } else {
                if (now.getHours() == settings.dayMode.hours && now.getMinutes() ==
                    settings.dayMode.minute) {
                    if (!foundBridge) {
                        console.log('bridge doesnt exist');
                        return;
                    }
                    //Turn off lamp1,2 and 3
                    turnOff(lamp1);
                    turnOff(lamp2);
                    turnOff(lamp3);
                    console.log("Daymode");
                }
            }
        }
    //button1 functions
    //when hold down button1 we activate buttonPanic function.
    button1.on("hold", buttonPanic);
    //when click button1 once we activate buttonDownMultiClick fucntion.
    button1.on("down", buttonDownMultiClick);
    //when button1 is released, call function buttonUp.
    button1.on("up", buttonUp);

    //button2 functions
    //when click button2 once we activate buttonTwoDown
    button2.on("down", buttonTwoDown);
    //when hold down button2 we activate buttonPanic function.
    button2.on("hold", buttonPanic);
    //when button2 is released, call function buttonUp.
    button2.on("up", buttonUp);

    //buttonpanic will make all the lamps turn into a red color and starts blinking for around 30 seconds.
    //at the same time a beep sound will be played throuhg the piezo speaker.
    function buttonPanic() {
      //checks if there is a conenctions to the bridge, if we got the settigns.No error execute the panicmode button.
        if (!foundBridge) {
            console.log('bridge doesnt exist');
            return;
        } else if (!settings) {
            console.log('settings har inte hämtats');
            return false;
        } else if (isHoldingDown == false) {
            isHoldingDown = true;
            clearTimeout(singelTimer);// clear the timer
            count = 0; // resets count to 0.
            var alert = "lselect"; // a property for philips hue api.
            settings.panicMode.lights.forEach(function(light) { // for each lamp change to this kind of settings
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
            // plays the beep sound in a iterval every 3 seconds for 20 seconds
            interval = setInterval(function() {
                piezo.play({
                  //play beep sound from piezo
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
    //This function have multiple clicks actions. Single click activates daymode, dbl click ngiht mode and triple standard mode.
    function buttonDownMultiClick() {
      //checks if there is a bridge connection
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
                    //call daymode function
                    dayMode();
                    console.log("one click = Day mode");
                }, timerOneclick);
                //Else if clicks = 2
            } else if (count === 2) {
              //checks if we got the settings
                if (!settings) {
                    console.log('settings har inte hämtats');
                    return false;
                }
                //clear the timeout for singletimer
                clearTimeout(singelTimer);
                //set a timout for doubletimer
                doubleTimer = setTimeout(function() {
                  // sets count to 0
                    count = 0;
                    // for each lamp change according to the settings
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
                    console.log("två klick = night mode");
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
                //clear timout for doubletimer
                clearTimeout(doubleTimer);
                // clear the interval for variable interval
                clearInterval(interval);
                console.log("tre klick - standard mode");
            }
        }
    //????
    function buttonUp() {
            isHoldingDown = false;
        }
    //This function will set the lamps to awaymode on double click and standard on triple click.
    function buttonTwoDown() {
        if (!foundBridge) {
            console.log('bridge doesnt exist');
            return;
        }
        //Count our clicks
        count++;
        //If one click
        if (count === 1) {
          //this function should activate after a certain time
            singelTimer = setTimeout(function() {
              //reset the count clicks to 0.
                count = 0;
                console.log("One Click Button two");
            }, timerOneclick);
        } else if (count === 2) {
            // cleartimeout for signletimer
            clearTimeout(singelTimer);
            doubleTimer = setTimeout(function() {
                // sets count to 0
                count = 0;
                //execute awaymode
                awayMode();
                //awaymode should run every 10 minutes when activated
                setInterval(awayMode, 60 * 10 * 1000);
            }, timerDblClick);
        } else if (count === 3) {
          //reset the click counts to 0.
            count = 0;
          //go through each lamps available and send the settings according to the file to philips hue api
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
        //obj variable gets the cycle array from the settings file
        var obj = settings.awayMode.cycle;
        //creates empty array
        var arr = [];
        // save the result of lights and gethours to variabe ljus
        var ljus = "lights" + nu.getHours();
        //loop through all the property in obj
        for (var prop in obj) {
          //push the properties into a array
            arr.push(prop);
        }
        //loop through the array
        for (var i = 0; i < arr.length; i++) {
          //if the array contains anythings thats the same as ljus
            if (arr[i] == ljus) {
              //save it to lightsForaway
                var lightsForaway = arr[i];
                console.log(lightsForaway);
            }
        }
        //go through each lamp and send the correct settings according to the file to philips hue api.
        settings.awayMode.cycle[lightsForaway].forEach(function(light) {
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
