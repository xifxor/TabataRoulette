

const divActivity = "#div_activity";
const divCountdown = "#div_countdown";
const divTotalTime = "#div_total_time";
const divRemainingTime = "#div_remaining_time";
const divSetCount = "#div_set_count";
const divRepCount = "#div_rep_count";
const divActivityCount = "#div_activity_count";

let config = {
    warm_up_time : 10,  //starting warm up
    cool_down_time : 10, //final cool down
    set_count : 1, //number of sets
    set_rest_duration : 5, //rest between sets
    reps_count : 8, //number of reps per activity in a set
    rep_duration : 20,  //work time per rep
    rep_rest_duration : 10,  //reset between reps
    activity_rest_duration : 0,  //rest between activities  
    playsound : true
}



function getActivityQueue(){
    console.log("Running activityqueue()");

    let queue = new Array();

    //run warm up interval
    if (config.warm_up_time > 0){
        queue.push( {
            "count" : config.warm_up_time,
            "name" :  "Warm up",
            "set" : "0",
            "rep" : "0",
            "activitycount" : "0",
            "background-color" : "var(--color-warmup)",
            func : function(){ }  //testing
        });
    }

    //loop sets
    [...Array(config.set_count)].forEach((_, set) => {
    setDisplayNumber = set + 1;
    activityCount = 0;


    //loop activities
    config.activities.forEach((activity) => {
        activityCount++;

        //reps loop
        [...Array(config.reps_count)].forEach((_, rep) => {
            repDisplayNumber = rep +1;

            //queue work interval
            queue.push( 
                {"count" : config.rep_duration,
                "name" : activity.name,
                "set" : setDisplayNumber,
                "rep" : repDisplayNumber,
                "activitycount" : activityCount,
                "background-color" : "var(--color-work)"
            });

            //queue rest interval
            queue.push( 
                {"count" : config.rep_rest_duration,
                "name" : "Rest",
                "set" : setDisplayNumber,
                "rep" : repDisplayNumber,
                "activitycount" : activityCount,
                "background-color" : "var(--color-rest)"
            });

        }); //end of reps loop for this activity

        //add reset between activities
        if (config.activity_rest_duration > 0){

            queue.push( 
                {"count" : config.activity_rest_duration,
                "name" : "Rest before next activity",
                "set" : setDisplayNumber,
                "rep" : repDisplayNumber,
                "activitycount" : activityCount,
                "background-color" : "var(--color-activityrest)"
            });

        }

    }); //end of activities loop

    //add reset between sets
    if (config.set_rest_duration > 0 && config.set_count > 1){
        queue.push( 
            {"count" : config.set_rest_duration,
            "name" : "Rest before next set",
            "set" : setDisplayNumber,
            "rep" : repDisplayNumber,
            "activitycount" : activityCount,
            "background-color" : "var(--color-setrest)"
        });

    }

    }); //end of sets loop

    //run cool down interval
    if (config.cool_down_time > 0){
        queue.push( 
            {"count" : config.cool_down_time,
            "name" : "Cool down",
            "set" : setDisplayNumber,
            "rep" : repDisplayNumber,
            "activitycount" : activityCount,
            "background-color" : "var(--color-cooldown)"
        });
    }

    console.log("Collected " + queue.length + " events");

    //return
    return queue;


}


// Restricts input for the set of matched elements to the given inputFilter function.
    (function($) {
        $.fn.inputFilter = function(inputFilter) {
            return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function() {
                if (inputFilter(this.value)) {
                    this.oldValue = this.value;
                    this.oldSelectionStart = this.selectionStart;
                    this.oldSelectionEnd = this.selectionEnd;
                } else if (this.hasOwnProperty("oldValue")) {
                    this.value = this.oldValue;
                    this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                } else {
                    this.value = "";
                }
            });
        };
    }(jQuery));


$(document).ready(function(){

    //set button and div state
        $('#startbutton').attr("disabled", true);
    

    //set config filters
        $("#screen_config input[type=text] ").inputFilter(function(value) {
            return /^\d*$/.test(value);    // Allow digits only, using a RegExp
        });

    //config change handler
        $("#screen_config input").change(function(){
            console.log("Input was changed"); 

            config.warm_up_time = parseInt( $('#input_warm_up_time').val() );
            config.cool_down_time = parseInt( $('#input_cool_down_time').val() );
            config.set_count  = parseInt( $('#input_set_count').val() );
            config.set_rest_duration = parseInt( $('#input_set_rest_duration').val() );
            config.reps_count = parseInt( $('#input_reps_count').val() );
            config.rep_duration = parseInt( $('#input_rep_duration').val() );
            config.rep_rest_duration = parseInt( $('#input_rep_rest_duration').val() );
            config.activity_rest_duration = parseInt( $('#input_activity_rest_duration').val() );
            config.playsound =  $('#input_playsound').is(":checked");

            //update the activities queue to the timer based on new config
            t1.actions = getActivityQueue();
            console.log("Setting sound to " + config.playsound )
            t1.playsound = config.playsound ;

            $(divTotalTime).html("total time: " + t1.totaltime());

        })

    
    //update config form values
        $('#input_warm_up_time').val( config.warm_up_time );
        $('#input_cool_down_time').val( config.cool_down_time );
        $('#input_set_count').val( config.set_count );
        $('#input_set_rest_duration').val( config.set_rest_duration );
        $('#input_reps_count').val( config.reps_count );
        $('#input_rep_duration').val( config.rep_duration );
        $('#input_rep_rest_duration').val( config.rep_rest_duration );
        $('#input_activity_rest_duration').val( config.activity_rest_duration );
        $('#input_playsound').prop('checked', config.playsound );



    //create fake video to keep screen alive
        var keepAliveVid = $('<video />')
            .attr("loop",  '')
            .attr("playsinline",  '')
            .css({position: 'fixed',  display: 'none', height : '0px', width : '0px'});

        $('<source>')
            .attr("src", 'data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=' ) 
            .attr("type",  'video/webm')
            .appendTo(keepAliveVid);

         $('<source>')
            .attr("src", 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw==' )
            .attr("type",  'video/mp4')
            .appendTo(keepAliveVid);

        keepAliveVid.appendTo("body");


    //create a new timer
    const t1 = Object.create(countdowntimer); 
    t1.endsoundpath = "sounds/beep1.mp3";

        
    //slots loaded callback
    let loadedCallback = function (){
        console.log("Slots load callback");

        //arr = s1.selectedActivities.map( (a) => { return a['name'] }); 
        arr = s1.selectedActivities.map( a => a.name ); 

        console.log("Selected activities: " +  arr.join(", "));
        $("#exercise_list").html( arr.join(" | ") );

        //update config with activities
        config.activities = s1.selectedActivities;
        t1.actions = getActivityQueue();

        //enable start 
        $('#startbutton').attr("disabled", false);

        //set total time
        $(divTotalTime).html("total time: " + t1.totaltime());

    
    }


    //create a new slot group
    const s1 = new SlotGroup("#slots1", 4, loadedCallback);


    //timer interval callback
    t1.oninterval = function(){

        currentActivity = t1.currentaction();

        if ('set' in currentActivity){           $(divSetCount).html("Set " + currentActivity['set'] + " of " + config.set_count ); } // + " of " + config.set_count
        if ('activitycount' in currentActivity){ $(divActivityCount).html("Activity " + currentActivity['activitycount'] + " of " + config.activities.length ); } // + " of " + config.activities.length
        if ('rep' in currentActivity){           $(divRepCount).html("Rep  " + currentActivity['rep']  + " of " + config.reps_count ); } //+ " of " + config.reps_count
        if ('name' in currentActivity){          $(divActivity).html(currentActivity['name']); }
        if ('background-color' in currentActivity){ $("body").css("background-color", currentActivity['background-color']); }

        $(divCountdown).html( t1.currentcount );
        $(divRemainingTime).html( "remaining: " + t1.remainingtime() );

    }

    //set complete callback
    t1.oncomplete = function(){
        console.log("oncomplete callback");

       $('#screen_complete').toggle();

    }

    //complete  done button
    $('#completedonebutton').click(function(){
        $('#screen_complete').hide();     
    }); 



    //show info box
    $('#infobutton').click(function(){
        $('#screen_info').toggle();     
    });

    //show config box 
    $('#configbutton').click(function(){
        $('#screen_config').toggle();     
    });


    //config done button
    $('#configdonebutton').click(function(){
        $('#screen_config').hide();     
    }); 


    //spin the slots
    $('#spinbutton').click(function(){
        console.log("Spin");

        $('#screen_config').hide(); 
        $('#screen_info').hide(); 
        $('#screen_complete').hide(); 

        if ($(this).val() == "Spin")
        {
            //set button and div state
            $('#startbutton').attr("disabled", true);

            s1.start();
            $(this).val("Stop") ;


        }else{
            s1.stop();  //stop may need a callback function
            $(this).val("Spin");
           
            //display activities 
            arr = s1.selectedActivities.map( (a) => { return a['name'] }); 
            $("#exercise_list").html( arr.join(" | ") );

            //update config with activities
            config.activities = s1.selectedActivities;
            t1.actions = getActivityQueue();

            //show total time
            $(divTotalTime).html("total time: " + t1.totaltime());

            //enable start 
            $('#startbutton').attr("disabled", false);
        }

    });

    // start the excerise timer 
    $('#startbutton').click(function(){

        $('#screen_config').hide(); 
        $('#screen_info').hide(); 
        $('#screen_complete').hide(); 

        if ($(this).val() == "Start")
        {
            console.log("Start button clicked")

            keepAliveVid.trigger('play');

            //reconfigure butons and screens
            $(this).val("Pause") ;
            $('#spinbutton').attr("disabled", true);
            $('#screen_running').show();

            //create activities queue and start
            t1.actions = getActivityQueue();
            t1.start();


        }else if ($(this).val() == "Pause")
        {
            console.log("Pause button clicked")
            keepAliveVid.trigger('pause');
            t1.pause();
            $(this).val("Continue") 


        }else if ($(this).val() == "Continue")
        {
            console.log("Continue button clicked")
            keepAliveVid.trigger('play');
            t1.start();
            $(this).val("Pause") 

        }

    });

    //reset 
    $('#resetbutton').click(function(){
        console.log("Reset button clicked");
        if (confirm("Are you sure you want to reset? (This will stop any current session)") == true)
        {
            console.log("Resetting session");
            $('#startbutton').attr("disabled", false).val("Start");
            $('#spinbutton').attr("disabled", false);
            $('#screen_config').hide(); 
            $('#screen_info').hide(); 

            //stop keep-alive vid
            keepAliveVid.trigger('stop');

            //reset timer
            t1.reset();

            //reset background color
            $("body").css("background-color", "var(--color-background)")

            //clear counter divs
            $('#div_set_count, #div_activity_count, #div_rep_count').html(""); 
            $('#div_activity,#div_countdown, #div_remaining_time').html(""); 
      
      
        }

    });


});




