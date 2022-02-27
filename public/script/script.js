

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
    activities : [
        {"name" : "Situps", "image" : "situps.png"},
        {"name" : "Squats", "image" : "squats1.png"},
        {"name" : "Pushups", "image" : "pushup1.png"},
        {"name" : "Lunge", "image" : "lunge1.png"}
    ],
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




function getActivitiesQueue() { //you can only use `await` in async funcions 

    console.log("Running getActivitiesQueue()");

    let Activities = new Array();
  
    //run warm up interval
    if (config.warm_up_time > 0){
        Activities.push( {
            "count" : config.warm_up_time,
            "activity" :  "Warm up",
            "set" : "n/a",
            "rep" : "n/a",
            "activitycount" : "n/a",
            "background-color" : "var(--color-warmup)"
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
                console.log("Picking up new activity");

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
            if ('set' in currentActivity){           $(divSetCount).html("Set: " + currentActivity['set']); } // + " of " + config.set_count
            if ('activitycount' in currentActivity){ $(divActivityCount).html("Activity: " + currentActivity['activitycount'] ); } // + " of " + config.activities.length
            if ('rep' in currentActivity){           $(divRepCount).html("Rep: " + currentActivity['rep'] ); } //+ " of " + config.reps_count
            
            if ('activity' in currentActivity){      $(divActivity).html(currentActivity['activity']); }
            if ('background-color' in currentActivity){ $("body").css("background-color", currentActivity['background-color']); }

            $(divCountdown).html( currentCount );
            $(divRemainingTime).html( "remaining time: " + secondsToHMS(config.totaltime() - totalelapsed) );
            
            //increment and deincrement
            currentCount--;
            totalelapsed++;


        }


    }, 1000);

}


$(document).ready(function(){

    $('#startbutton').click(function(){
        $('#startbutton').attr("disabled", true);
        console.log("Start button clicked")
        
        start =  (new Date()).getTime()
       
        a = getActivitiesQueue();
        runActivities(a);

    });


    $('#pausebutton').click(function(){

        if ($(this).val() == "Pause")
        {
            console.log("Pause button clicked")
            pauseFlag = true;
            $(this).val("Continue") 
        }else{
            console.log("Continue button clicked")
            pauseFlag = false;
            $(this).val("Pause") 

        }

    });

    $(divTotalTime).html("total time: " + config.totaltimeHMS());



});