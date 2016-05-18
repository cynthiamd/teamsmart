//API for Phillips Hue
var hueURL =
    "http://192.168.10.247/api/28dd08062078de67270d8b6ab5b3f9b";
		//Bedroom
    var lightsURL = "/lights/";
		var lamp1 = "/lights/1/state";
		//Livingroom
		var lamp2 = "/lights/2/state";
		//Hallway
		var lamp3 = "/lights/3/state";
		var lamps = [];

		$(document).ready(function() {
		    // Gör någonting när ert dokument har laddat klart
                     $.ajax({
                         url: hueURL,
                         type: "GET",
                         contentType: "application/json",
                         success: function (response) {
                              console.log(response.lights)

                         }
                     });

//Söka efter nya lampor!
function searchLamps () {
  $.ajax({
      url: hueURL + lightsURL,
      type: "POST",
      contentType: "application/json",
      success: function(response) {
        console.log(response);
      }
  })
}


/* FUNKTIONER */

//Function for changing light on Hue!
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



function turnOff (lamp) {

  var statement = {"on": false};
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
            if (now.getHours() == 13 && now.getMinutes() == 20) {
                //Turn off lamps
                turnOff(lamp1);
                turnOff(lamp2);
                turnOff(lamp3);
                console.log("Daymode weekday");
            }
        } else {
            if (now.getHours() == 10 && now.getMinutes() == 15) {

                //Turn off lamps
                turnOff(lamp1);
                turnOff(lamp2);
                turnOff(lamp3);
                console.log("Daymode weekend");
            }
        }
    }

    //When you press buttonDown,  change color to all three lamps
    function buttonDown() {

                //Change color on lamps
                changeColor(lamp1, {"on": true, "sat":100, "bri": 100, "hue": 20000});
                changeColor(lamp2, {"on": true, "sat": 100, "bri": 100, "hue": 20000});
                changeColor(lamp3, {"on": true, "sat": 100, "bri": 100, "hue": 20000});
                console.log("ett klick");
            };
            //Else if clicks = 2



    function nighhtMode() {
            //Change color on lamps
            changeColor(lamp1, {"on": true, "sat": 240, "bri": 140, "hue": 65280});
            changeColor(lamp2, {"on": true, "sat": 100, "bri": 60, "hue": 65280, "xy": [0.5136, 0.4444]}); //Goldenrod XY Color
            changeColor(lamp3, {"on": true, "sat": 100, "bri": 60, "hue": 65280, "xy": [0.5136, 0.4444]}); //Goldenrod XY Color
            console.log("två klick");
            //Clear timer!
        }

        function standard() {

          changeColor(lamp1, {"on": true, "sat": 100, "bri": 100, "hue": 50000});
          changeColor(lamp2, {"on": true, "sat": 100, "bri": 100, "hue": 50000}); //Goldenrod XY Color
          changeColor(lamp3, {"on": true, "sat": 100, "bri": 100, "hue": 50000});

        }



$("#daymode").click(function() {
  dayMode();
})

$("#nightmode").click(function () {
  nighhtMode();
 })

 $("#standard").click(function() {
standard();
 })

});	//end document ready
