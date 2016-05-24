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
    var isHoldingDown = false;
    var jsonURL = "http://ddwap.mah.se/ae4200/teamsmart/json.php";

    function getColorInputs(lights) {
    return lights.map(function(light) {
      return '<span>' + light.id + '</span><input name="' + light.id + '" class="colorPicker jscolor {mode:\'HSV\',position:\'right\'}">';
    }).join("");
  }

    function getSettings (svar) {
      $.ajax({
          url: jsonURL,
          type: "GET",
          contentType: "application/json",
          complete: function(response) {
            console.log(JSON.parse(response.responseText));
          }
      })
    }
getSettings();


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

function alert(lamp){
	var statement = {"on": true, "alert": "lselect"};
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
            if (now.getHours() == 13 && now.getMinutes() == 36) {
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
    function standard() {

                //Change color on lamps
                changeColor(lamp1, {"on": true, "sat":100, "bri": 100, "hue": 20000});
                changeColor(lamp2, {"on": true, "sat": 100, "bri": 100, "hue": 20000});
                changeColor(lamp3, {"on": true, "sat": 100, "bri": 100, "hue": 20000});
                console.log("ett klick");
            }
            //Else if clicks = 2



    function nightMode() {
            //Change color on lamps
            changeColor(lamp1, {"on": true, "sat": 240, "bri": 140, "hue": 65280});
            changeColor(lamp2, {"on": true, "sat": 100, "bri": 60, "xy": [0.5136, 0.4444]}); //Goldenrod XY Color
            changeColor(lamp3, {"on": true, "sat": 100, "bri": 60, "xy": [0.5136, 0.4444]}); //Goldenrod XY Color
            console.log("två klick");
            //Clear timer!
        }

        function awayMode() {

          changeColor(lamp1, {"on": true, "sat": 100, "bri": 100, "hue": 50000}); // cykla i schema
          changeColor(lamp2, {"on": true, "sat": 100, "bri": 100, "hue": 50000}); // cykla i schema
          changeColor(lamp3, {"on": true, "sat": 240, "bri": 140, "hue": 65280});
					  console.log("awayMode");

        }

				//Set wakeUp with 60sek interval
				setInterval(wakeUp, 60000);
				function wakeUp () {
					//Get current date in milliseconds
					var now = new Date();
					//Get current time 10:28
					var timefor = now.getHours() + ":" + now.getMinutes();
					//Get current weekday number 0-6
					var day = now.getDay();
					//Check if its a weekday else its weekend
					if (day !== 0 && day !== 6) {
							if (now.getHours() == 13 && now.getMinutes() == 39) {
																		//Alert lamps
									alert(lamp2);
									console.log("Wake Up weekday");

}
					} else {
							if (now.getHours() == 10 && now.getMinutes() == 15) {

									//Alert lamps
									alert(lamp2);
									console.log("Wake Up weekends");
							}


				}

}

function panicMode(){
      changeColor(lamp1, {"on": true, "sat": 255, "bri": 250, "hue": 50000});
      changeColor(lamp2, {"on": true, "sat": 255, "bri": 250, "hue": 50000});
      changeColor(lamp3, {"on": true, "sat": 255, "bri": 250, "hue": 50000});
      alert(lamp1);
      alert(lamp2);
      alert(lamp3);
}

$("#daymode").click(function() {
  dayMode();
});

$("#nightmode").click(function () {
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

$("#panic").click(function(){
  panicMode();
});

$( ".show" ).click(function() {
  $(this).next(".slidetoggle").slideToggle( "slow", function() {
    // Animation complete.
  });
});

//$( ".show" ).click(function() {
//    $(this).children(i).removeClass(fa-angle-right).addClass(fa-angle-down);
//});

$( ".show" ).click(function() {
  $( this ).children("h3").children("i").toggleClass( "fa-angle-right" );
  $( this ).children("h3").children("i").toggleClass( "fa-angle-down" );
});

$.getJSON("json.json", function(json) {
  console.log(json);
})

  // var inputsForDayMode = getColorInputs(settings.daymode.lights);
  // console.log(inputsForDayMode);
  //
  // $("#myform").append(inputsForDayMode);
  $("#myform").submit(function(e) {
    console.log(e.target.elements);
    e.preventDefault();
    console.log("skickade formuläret");
  })

});	//end document ready
