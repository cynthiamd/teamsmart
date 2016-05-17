




	// 2) Get the lights connected to the Bridge in order to set the menu.
	$.get(hueURL, function(response){

	})
	.done(function(){
		// retreive the lights names from the response
		// save the names in a backup variable
		// call setMenu(lights) with the lights names to set the menu.
	})
	.fail(function(){
		// call the setMenu(ligths) with the names of the lights from the backup variable
		// inform user that lights/lights can not be retreived.
	});

	// 3) Update light settings
	// 3a) Perform step one.
	// 3b) Call changeColor(lamp, sat, bri, hue) to set lamp color.

    function setMenu(lights){
		$('#menu')
		.append($('<li>')
			.append($('<a>')
				.attr('href','https://www.google.se/')
				.text("Test")
			)
		);
	}

	// 4.1 Turn lights on or off
	// 4.2 Set light theme
	// 4.3 Set lights shedule


});	//end document ready
