

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


  $(document).ready(function() {
    $("#myTextBox").inputFilter(function(value) {
      return /^\d*$/.test(value);    // Allow digits only, using a RegExp
    });
  });



$(document).ready(function(){



    //set button and div state
    $('#startbutton').attr("disabled", true);
    $('#screen_config').hide(); 


    //slots loaded callback
    let loadedCallback = function (){
        console.log("Slots load callback");

        //arr = s1.selectedActivities.map( (a) => { return a['name'] }); 
        arr = s1.selectedActivities.map( a => a.name ); 

        console.log("Selected activities: " +  arr.join(", "));
        $("#exercise_list").html( arr.join(" | ") );

        //update config with activities
        config.activities = s1.selectedActivities;
        t1.intervals = getActivityQueue();

        //enable start 
        $('#startbutton').attr("disabled", false);

        //set total time
        $(divTotalTime).html("total time: " + t1.totaltime());

    
    }

    //create a new slot group
    const s1 = new SlotGroup("#slots1", 4, loadedCallback);

    //create a new timer
    const t1 = Object.create(countdowntimer); 
    //t1.intervals = activities;

    //timer interval callback
    t1.oninterval = function(){
        console.log("oninterval callback");

        currentActivity = t1.currentinterval();

        if ('set' in currentActivity){           $(divSetCount).html("Set " + currentActivity['set'] + " of " + config.set_count ); } // + " of " + config.set_count
        if ('activitycount' in currentActivity){ $(divActivityCount).html("Activity " + currentActivity['activitycount'] + " of " + config.activities.length ); } // + " of " + config.activities.length
        if ('rep' in currentActivity){           $(divRepCount).html("Rep  " + currentActivity['rep']  + " of " + config.reps_count ); } //+ " of " + config.reps_count
        if ('name' in currentActivity){      $(divActivity).html(currentActivity['name']); }
        if ('background-color' in currentActivity){ $("body").css("background-color", currentActivity['background-color']); }

        $(divCountdown).html( t1.currentcount );
        $(divRemainingTime).html( "remaining: " + t1.remainingtime() );

    }

    //time complete callback
    t1.oncomplete = function(){
        console.log("The timer completed");
    }



    //update config form values
    $('#input_warm_up_time').val( config.warm_up_time );
    $('#input_cool_down_time').val( config.cool_down_time );
    $('#input_set_count').val( config.set_count );
    $('#input_set_rest_duration').val( config.set_rest_duration );
    $('#input_reps_count').val( config.reps_count );
    $('#input_rep_duration').val( config.rep_duration );
    $('#input_rep_rest_duration').val( config.rep_rest_duration );
    $('#input_activity_rest_duration').val( config.activity_rest_duration );

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


        $(divTotalTime).html("total time: " + config.totaltimeHMS());

    })

    $('#configbutton').click(function(){
        $('#screen_config').toggle();     
    });

    $('#infobutton').click(function(){
        $('#screen_info').toggle();     
    });


    $('#spinbutton').click(function(){
        console.log("Spin");

        if ($(this).val() == "Spin")
        {
            //set button and div state
            $('#startbutton').attr("disabled", true);
            $('#screen_config').hide(); 

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
            t1.intervals = getActivityQueue();

            //show total time
            $(divTotalTime).html("total time: " + t1.totaltime());

            //enable start 
            $('#startbutton').attr("disabled", false);
        }

    });


    $('#startbutton').click(function(){

        if ($(this).val() == "Start")
        {
            console.log("Start button clicked")

            //change to pause button
            $(this).val("Pause") ;

            //disable spin button
            $('#spinbutton').attr("disabled", true);

            $('#screen_running').show();

            t1.intervals = getActivityQueue();
            t1.start();


        }else if ($(this).val() == "Pause")
        {
            console.log("Pause button clicked")
            t1.ispaused = true;
            $(this).val("Continue") 


        }else if ($(this).val() == "Continue")
        {
            console.log("Continue button clicked")
            
            t1.ispaused = false;
            $(this).val("Pause") 




        }

    });


    //reset 
    $('#resetbutton').click(function(){
        console.log("Reset button clicked");
        if (confirm("Are you sure you want to reset? (This will stop any current session)") == true)
        {
            console.log("Resetting session");
            $('#startbutton').attr("disabled", false);
            $('#screen_config').hide(); 
            t1.reset();

            //reset background color

        }

    });
    
    
 



});