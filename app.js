

$( document ).ready(function() {

    $.getScript(["strobe.js", "lamp.js"], function(){

    //place your code here, the scripts are all loaded
        console.log("Loaded");
    });




    $("#daymode").on("click", function(){
        dayMode();
    });



});
