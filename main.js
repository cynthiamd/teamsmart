/*
 * API URL for Philips Hue
 */
var hueURL = "http://192.168.251.185/api/28dd08062078de67270d8b6ab5b3f9b";
/*
 * Partial API for Philips lights
 */
var lightsURL = "/lights/";
/*
 * API URL for retreiving light mode settings
 */
var jsonURL = "http://xn--paulinehgh-lcb.se/smarthome/json.php";

/*
 * Lamp nbr 1 = Bedroom
 */
var lamp1 = "/lights/1/state";
/*
 * Lamp nbr 2 = Livingroom
 */
var lamp2 = "/lights/2/state";
/*
 * Lamp nbr 3 = Hallway
 */
var lamp3 = "/lights/3/state";

var lamps = [];
/*
 * Initial settings value. Valiable holds settings for all modes and lams.
 */
var settings = false;
/*
 * Inital value for the arduino button, "hold".
 */
var isHoldingDown = false;
/*
 * Variable for the arduino to set a specific time interval for daymode.
 */
var interval;
/*
 * Returns the current color settings for the lamps.
 */
function getColorInputs(lights, mode)  {
    return lights.map(function(light) {
        return '<span>' + light.id + '</span><input id="' + mode + '-' + light.id + '" name="' + light.id + '" class="colorPicker jscolor">';
    }).join("");
}
/*
 * Retrive light mode settings from file and assign values to the settings variable.
 */
function getSettings() {
    $.ajax({
        url: jsonURL,
        type: "GET",
        sucesss: function(response) {
            var json = JSON.parse(response.responseText);
            console.log(json);
            settings = json;
        }
    });
}
/*
 * Get Json from jasonURL and add color settings from settings.json
 */

$.getJSON(jsonURL, function(json) {
    settings = json;
    setupColorInputFields(settings);

});

/*
  Save our settings color settings!
 */

function saveSettings(settings) {
    $.ajax({
        url: jsonURL,
        type: 'POST',
        data: JSON.stringify(settings),
        success: function(res) {
            console.log('stored new settings?');
        }
    });
}

/*
 * function to set up color settings from fields i settings.html
 */

function setupColorInputFields(settings) {
    // Night Mode
    var inputsForNightMode = getColorInputs(settings.nightMode.lights, 'nightMode');
    $("#nightMode").prepend(inputsForNightMode);

    jscolor.installByClassName("jscolor");
    // activate color inputs


    // set default color of input fields
    settings.nightMode.lights.forEach(function(light) {
        var hsv = lightHueToHSV(light);
        document.getElementById("nightMode-" + light.id).jscolor.fromHSV(hsv[0], hsv[1], hsv[2]);
    });

    var inputsForStandardMode = getColorInputs(settings.standard.lights, 'standardMode');
    $("#standardMode").prepend(inputsForStandardMode);

    jscolor.installByClassName("jscolor");

    // set default color of input fields
    settings.standard.lights.forEach(function(light) {
        var hsv = lightHueToHSV(light);
        document.getElementById("standardMode-" + light.id).jscolor.fromHSV(hsv[0], hsv[1], hsv[2]);
    });

}

/*
 * function to convert HSV to Hue
 */

function HSVtoHue(hsv) {
    return {
        sat: Math.round((hsv[2] * 256) / 100),
        bri: Math.round((hsv[1] * 256) / 100),
        hue: Math.round((hsv[0] * 65536) / 360)
    };
}

/*
 * Function to convert HSV to Hue
 */

function lightHueToHSV(light) {
    return [
        Math.round((light.hue / 65536) * 360),
        Math.round((light.bri / 256) * 100),
        Math.round((light.sat / 256) * 100)
    ];
}
/*
 * Connect to Philips Hue bridge.
 */
$(document).ready(function() {

    /* FUNCTIONS TO CONNECT TO BRIDGE AND LIGHTS IN BRIDGE */

    $.ajax({
        url: hueURL,
        type: "GET",
        contentType: "application/json",
        success: function(response) {
            console.log(response.lights);

        }
    });

    /*
     * Connect to Philips Hue lighs in the bridge to search for a lamp.
     */
    function searchLamps(id) {
        $.ajax({
            url: hueURL + lightsURL,
            type: "POST",
            data: JSON.stringify(id),
            contentType: "application/json",
            success: function(response) {
                console.log(response);
            }
        });
    }
    /*
     * Connect to Philips Hue lighs in the bridge to retreive a lamp.
     */
    function getLamps() {
        $.ajax({
            url: hueURL + lightsURL,
            type: "GET",
            contentType: "application/json",
            success: function(response) {
                console.log(response);
            }
        });
    }

    /*
     * Connect to Philips Hue lighs connected to the bridge, to retreive a lamp.
     * On succes, new state is returned in the response.
     * Pending jibberish to be removed? 9438c4b66bb9646f80f8dc3470356264ad444aa8
     */
    function changeColor(lamp, statement) {

        $.ajax({
            url: hueURL + lamp,
            type: "PUT",
            data: JSON.stringify(statement),
            contentType: "application/json",
            success: function(response) {
                //Take the first song in an array!
                console.log(response);
                //Api for voicerss
            }
        });
    }

    /*
     * Philips Hue call to update light state to turn off a lamp.
     * On succes, new state is returned in the response.
     * Current implementation does not use this function.
     */
    function turnOff(lamp) {

        var statement = {
            "on": false
        };
        $.ajax({
            url: hueURL + lamp,
            type: "PUT",
            data: JSON.stringify(statement),
            contentType: "application/json",
            success: function(response) {
                //Take the first song in an array!
                console.log(response);
                //Api for voicerss
            }
        });
    }

    /* FUNCTIONS FOR CREATING EFFECTS */

    /*
     * Philips Hue call to update light state for a lamp to toggle on off (blink).
     * On succes, new state is received.
     */
    function alert(lamp) {
        var statement = {
            "on": true,
            "alert": "lselect"
        };
        $.ajax({
            url: hueURL + lamp,
            type: "PUT",
            data: JSON.stringify(statement),
            contentType: "application/json",
            success: function(response) {
                //Take the first song in an array!
                console.log(response);
                //Api for voicerss
            }
        });
    }

    /* FUNCTIONS TO UPDATE SETTINGS FOR SELECTED MODE */

    /*
     * Day mode settings.
     * Update settings for lamp colors in daymode.
     */
    $("#dayMode").submit(function(e) {
        e.preventDefault();

        var hour = e.target.elements.hour.value;
        var minute = e.target.elements.minute.value;

        console.log('settings before change', settings.dayMode);
        settings.dayMode.hours = hour;
        settings.dayMode.minute = minute;
        console.log('settings after change', settings.dayMode);
        // dayMode(hour, minute);
        saveSettings(settings);
    });


    /*
     * Standard mode settings.
     * Update settings for lamp colors in daymode.
     */
    $("#standardMode").submit(function(e) {

        e.preventDefault();
        console.log("skickade formuläret");

        // create new array from old settings
        var newLampSettings = settings.standard.lights.map(function(light) {
            var newHue = HSVtoHue(e.target.elements[light.id].jscolor.hsv);

            light.sat = newHue.sat;
            light.bri = newHue.bri;
            light.hue = newHue.hue;

            return light;
        });
        console.log(newLampSettings);
        // update current settings with new lights
        settings.standard.lights = newLampSettings;
        // save settings to server
        saveSettings(settings);
    });

    /*
     * Night mode settings.
     * Update settings for time in wake up mode.
     */

    $("#nightMode").submit(function(e) {

        e.preventDefault();
        console.log("skickade formuläret");

        // create new array from old settings
        var newLampSettings = settings.nightMode.lights.map(function(light) {
            var newHue = HSVtoHue(e.target.elements[light.id].jscolor.hsv);

            light.sat = newHue.sat;
            light.bri = newHue.bri;
            light.hue = newHue.hue;

            return light;
        });

        console.log(newLampSettings);
        // update current settings with new lights
        settings.nightMode.lights = newLampSettings;
        // save settings to server
        saveSettings(settings);
    });

    /*
     * Wake up settings.
     * Update settings for time in wake up mode.
     */
    $("#wakeUp").submit(function(e) {
        e.preventDefault();

        var hour = e.target.elements.hour.value;
        var minute = e.target.elements.minute.value;

        console.log('settings before change', settings.wakeUp);
        settings.wakeUp.hours = hour;
        settings.wakeUp.minute = minute;
        console.log('settings after change', settings.wakeUp);
        // dayMode(hour, minute);
        saveSettings(settings);
    });

    /* FUNCTIONS TO SET SELECTED MODE */

    /*
     * Activate daymode according to interval.
     */
    setInterval(dayMode, 60000);

    /*
     * Day mode.
     * When daymode is active, corresponding settingse are
     * active at different hours depending on if it is a weekday or weekend.
     */
    function dayMode() {
        if (!settings) {
            console.log('settings har inte hämtats');
            return false;
        }
        //Get current date in milliseconds
        var now = new Date();
        //Get current time 10:28
        var timefor = now.getHours() + ":" + now.getMinutes();
        //Get current weekday number 0-6
        var day = now.getDay();
        //Check if its a weekday else its weekend
        if (day !== 0 && day !== 6) {
            if (now.getHours() == settings.dayMode.hours && now.getMinutes() == settings.dayMode.minute) {
                settings.dayMode.lights.forEach(function(light) {
                    changeColor("/lights/" + light.id.substr(-1) + "/state", {
                        on: light.on,
                        sat: light.sat,
                        bri: light.bri,
                        hue: light.hue
                    });
                });
                console.log("Daymode weekday");
            }
        } else {
            if (now.getHours() == settings.dayMode.hours && now.getMinutes() == settings.dayMode.minute) {
                settings.dayMode.lights.forEach(function(light) {
                    changeColor("/lights/" + light.id.substr(-1) + "/state", {
                        on: light.on,
                        sat: light.sat,
                        bri: light.bri,
                        hue: light.hue
                    });
                });
                console.log("Daymode weekend");
            }
        }
    }

    /*
     * Standard mode.
     * Currently not implemented for the webb application.
     */
    function standard() {
        if (!settings) {
            console.log('settings har inte hämtats');
            return false;
        }
        settings.standard.lights.forEach(function(light) {
            changeColor("/lights/" + light.id.substr(-1) + "/state", {
                on: light.on,
                sat: light.sat,
                bri: light.bri,
                hue: light.hue
            });
        });
        clearInterval(interval);
    }
    /*
     * Night mode.
     * Changes lights state according to settings.
     */
    function nightMode() {

        if (!settings) {
            console.log('settings har inte hämtats');
            return false;
        }

        settings.nightMode.lights.forEach(function(light) {
            changeColor("/lights/" + light.id.substr(-1) + "/state", {
                on: light.on,
                sat: light.sat,
                bri: light.bri,
                hue: light.hue
            });
        });
        console.log("NightMode");
    }

    /*
     * Away mode.
     * Changes lights state every hour according to settings shedule.
     */
    function awayMode() {
        var nu = new Date();
        var tid = nu.getHours();

        if (!settings) {
            console.log('settings har inte hämtats');
            return false;
        }

        var ljus = "lights" + nu.getHours();

        window["settings"]["awayMode"]["cycle"][ljus].forEach(function(light) {
            changeColor("/lights/" + light.id.substr(-1) + "/state", {
                on: light.on,
                sat: light.sat,
                bri: light.bri,
                hue: light.hue
            });
        });

        console.log("awayMode");
    }
    setInterval(awayMode, 600000);
    setInterval(wakeUp, 60000);

    /*
     * Wake up mode.
     * When wake up is active, corresponding settingse are
     * active at different hours depending on if it is a weekday or weekend.
     * Wake up light toggles on off every minute.
     */
    function wakeUp() {
        //Get current date in milliseconds
        var now = new Date();
        //Get current time 10:28
        var timefor = now.getHours() + ":" + now.getMinutes();
        //Get current weekday number 0-6
        var day = now.getDay();
        //Check if its a weekday else its weekend
        if (day !== 0 && day !== 6) {
            if (now.getHours() == settings.wakeUp.hours && now.getMinutes() == settings.wakeUp.minute) {
                //Alert lamps
                settings.wakeUp.lights.forEach(function(light) {
                    changeColor("/lights/" + light.id.substr(-1) + "/state", {
                        on: light.on,
                        sat: light.sat,
                        bri: light.bri,
                        hue: light.hue
                    });
                });
                console.log("weekday");
            }
        } else {
            if (now.getHours() == settings.wakeUp.hours && now.getMinutes() == settings.wakeUp.minute) {

                settings.wakeUp.lights.forEach(function(light) {
                    changeColor("/lights/" + light.id.substr(-1) + "/state", {
                        on: light.on,
                        sat: light.sat,
                        bri: light.bri,
                        hue: light.hue
                    });
                });
                console.log("Weekend");
            }


        }

    }
    /*
     * Panic mode.
     * Lamps light toggles on off every minute for a duration of 20000 ms.
     */
    function panicMode() {
        if (!settings) {
            console.log('settings har inte hämtats');
            return false;
        }

        settings.panicMode.lights.forEach(function(light) {
            changeColor("/lights/" + light.id.substr(-1) + "/state", {
                on: light.on,
                sat: light.sat,
                bri: light.bri,
                hue: light.hue
            });
        });
        console.log("panicMode");

        alert(lamp1);
        alert(lamp2);
        alert(lamp3);

        interval = setInterval(function() {
            var audiofile = document.getElementById('audio');
            audiofile.play();
        }, 2000);
        setTimeout(function() {
            clearInterval(interval);
        }, 20000);
    }

    /* ADDING LISTENERS */

    /*
     * Adding listeners for the light mode icons.
     */
    $("#daymode").click(function() {
        dayMode();
    });

    $("#nightmode").click(function() {
        nightMode();
    });

    $("#standard").click(function() {
        standard();
    });

    $("#fullsecurity").click(function() {
        awayMode();
    });

    $("#wakeup").click(function() {
        wakeUp();
    });

    $("#panic").click(function() {
        panicMode();
    });

    /*
     * Adding listeners for the show slidebar class.
     */
    $(".show").click(function() {
        $(this).next(".slidetoggle").slideToggle("slow", function() {
            // Animation complete.
        });
    });

    /*
     * Adding listeners for search.
     */
    $("#search").click(function() {
        var id = prompt("Enter the serial number of the lamp: \n(printed on lamp)");
        var newID = {
            "deviceid": [id]
        };
        console.log(newID);
        searchLamps(newID);

        var count = 20;
        var counter = setInterval(timer, 1000); //1000 will  run it every 1 second

        function timer() {
            count = count - 1;

            if (count <= 0) {
                clearInterval(counter);
                getLamps();
                return;
            }
        }
    });

    /*
     * Adding listeners for show
     */
    $(".show").click(function() {
        $(this).children("h3").children("i").toggleClass("fa-angle-right");
        $(this).children("h3").children("i").toggleClass("fa-angle-down");
    });


}); //end document ready