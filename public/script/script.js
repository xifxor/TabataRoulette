

const divActivity = "#div_activity";
const divCountdown = "#div_countdown";
const divTotalTime = "#div_total_time";
const divRemainingTime = "#div_remaining_time";
const divSetCount = "#div_set_count";
const divRepCount = "#div_rep_count";
const divActivityCount = "#div_activity_count";

let pauseFlag = false; //pause the current interval
let skipFlag = false; //skip the current interval


function secondsToHMS(seconds) {
    var convert = function(x) { return (x < 10) ? "0"+x : x; }
    return convert(parseInt(seconds / (60*60))) + ":" +
           convert(parseInt(seconds / 60 % 60)) + ":" +
           convert(seconds % 60)
  }

let config = {

    warm_up_time : 10,  //starting warm up
    cool_down_time : 10, //final cool down
    set_count : 1,
    set_rest_duration : 5, //rest between sets
    reps_count : 8, //number of reps per activity in a set
    rep_duration : 20,  //work time per rep
    rep_rest_duration : 10,  //reset between reps
    activity_rest_duration : 0,  //rest between activities
    activities : [ ],
    totaltime : function(){

        time_per_activity = (this.rep_duration + this.rep_rest_duration) * this.reps_count; //time taken for each activity
        time_per_set = (time_per_activity * this.activities.length) + (this.activity_rest_duration * (this.activities.length -1)); //time for a full set of activities which includes the rest between
        time_for_all_sets = (time_per_set * this.set_count) + (this.set_rest_duration * (this.set_count - 1)); //time taken for all sets including rest between
        total_time = this.warm_up_time + time_for_all_sets + this.cool_down_time;

        return total_time;
    },
    totaltimeHMS : function(){

        return secondsToHMS( this.totaltime() );
    }

}




function getActivitiesQueue() { 

    console.log("Running getActivitiesQueue()");

    let Activities = new Array();
  
    //run warm up interval
    if (config.warm_up_time > 0){
        Activities.push( {
            "count" : config.warm_up_time,
            "activity" :  "Warm up",
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
                Activities.push( 
                    {"count" : config.rep_duration,
                    "activity" : activity.name,
                    "set" : setDisplayNumber,
                    "rep" : repDisplayNumber,
                    "activitycount" : activityCount,
                    "background-color" : "var(--color-work)"
                });

                //queue rest interval
                Activities.push( 
                    {"count" : config.rep_rest_duration,
                    "activity" : "Rest",
                    "set" : setDisplayNumber,
                    "rep" : repDisplayNumber,
                    "activitycount" : activityCount,
                    "background-color" : "var(--color-rest)"
                });

            }); //end of reps loop for this activity

            //add reset between activities
            if (config.activity_rest_duration > 0){

                Activities.push( 
                    {"count" : config.activity_rest_duration,
                    "activity" : "Rest before next activity",
                    "set" : setDisplayNumber,
                    "rep" : repDisplayNumber,
                    "activitycount" : activityCount,
                    "background-color" : "var(--color-activityrest)"
                });

            }

        }); //end of activities loop

        //add reset between sets
        if (config.set_rest_duration > 0 && config.set_count > 1){
            Activities.push( 
                {"count" : config.set_rest_duration,
                "activity" : "Rest before next set",
                "set" : setDisplayNumber,
                "rep" : repDisplayNumber,
                "activitycount" : activityCount,
                "background-color" : "var(--color-setrest)"
            });

        }

    }); //end of sets loop

    //run cool down interval
    if (config.cool_down_time > 0){
        Activities.push( 
            {"count" : config.cool_down_time,
            "activity" : "Cool down",
            "set" : setDisplayNumber,
            "rep" : repDisplayNumber,
            "activitycount" : activityCount,
            "background-color" : "var(--color-cooldown)"
        });
    }

    console.log("Collected " + Activities.length + " activities");

    //return
    return Activities;

    
}



function runActivities(activities) {

    console.log("Running runActivities()");
    console.log("Activity count: " + activities.length )

    let totalelapsed = 0;
    let currentCount = 0;

    let counter = setInterval(() => {
        
        if (pauseFlag != true)
        {
           

            //if the current count is 0 then pick up the next activity to process
            if (currentCount <= 0){
            
                //if there are more activities then pick up the next one
                if (activities.length > 0){
                    currentActivity = activities.shift();
                    currentCount = currentActivity['count'];
                }
                //otherwise end the process
                else{
                    console.log("No activities remaining");
                    $('#startbutton').attr("disabled", false);
                    clearInterval(counter);
                    return;
                }

            }       

            //update divs
            //* can we pass a function in the activities list instead??
            if ('set' in currentActivity){           $(divSetCount).html("Set " + currentActivity['set'] + " of " + config.set_count ); } // + " of " + config.set_count
            if ('activitycount' in currentActivity){ $(divActivityCount).html("Activity " + currentActivity['activitycount'] + " of " + config.activities.length ); } // + " of " + config.activities.length
            if ('rep' in currentActivity){           $(divRepCount).html("Rep  " + currentActivity['rep']  + " of " + config.reps_count ); } //+ " of " + config.reps_count
            
            if ('activity' in currentActivity){      $(divActivity).html(currentActivity['activity']); }
            if ('background-color' in currentActivity){ $("body").css("background-color", currentActivity['background-color']); }

            $(divCountdown).html( currentCount );
            $(divRemainingTime).html( "remaining: " + secondsToHMS(config.totaltime() - totalelapsed) );
            
            //increment and deincrement
            currentCount--;
            totalelapsed++;


        }


    }, 1000);

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


    let x = 5;
    //load slots
    loadedCallback = function (){
        console.log("Slots load callback");
        console.log("value of x = " + x);
       
        arr = s1.selectedActivities.map( (a) => { return a['name'] }); 
        console.log("Selected activities: " +  arr.join(", "));
        $("#exercise_list").html( arr.join(" | ") );

        //update config with activities
        config.activities = s1.selectedActivities;

        //enable start 
        $('#startbutton').attr("disabled", false);

        //set total time
        $(divTotalTime).html("total time: " + config.totaltimeHMS());

    
    }

    var s1 = new SlotGroup("#slots1", 4, loadedCallback);
    //***need to wait for s1 to properly load
   




    //update config form values
    $('#input_warm_up_time').val( config.warm_up_time );
    $('#input_cool_down_time').val( config.cool_down_time );
    $('#input_set_count').val( config.set_count );
    $('#input_set_rest_duration').val( config.set_rest_duration );
    $('#input_reps_count').val( config.reps_count );
    $('#input_rep_duration').val( config.rep_duration );
    $('#input_rep_rest_duration').val( config.rep_rest_duration );
    $('#input_activity_rest_duration').val( config.activity_rest_duration );

    //change handler
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

            //show total time
            $(divTotalTime).html("total time: " + config.totaltimeHMS());

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

            a = getActivitiesQueue();
            runActivities(a);

        }else if ($(this).val() == "Pause")
        {
            console.log("Pause button clicked")
            pauseFlag = true;
            $(this).val("Continue") 


        }else if ($(this).val() == "Continue")
        {
            console.log("Continue button clicked")
            
            pauseFlag = false;
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
            s1.stop();

        }

    });
    
    
 



});