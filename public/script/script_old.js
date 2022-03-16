


let pauseFlag = false; //pause the current interval
let skipFlag = false; //skip the current interval

function convertSeconds(seconds) {
    var convert = function(x) { return (x < 10) ? "0"+x : x; }
    return convert(parseInt(seconds / (60*60))) + ":" +
           convert(parseInt(seconds / 60 % 60)) + ":" +
           convert(seconds % 60)
  }

let config = {

    warm_up_time : 10,  //starting warm up
    cool_down_time : 10, //final cool down
    set_count : 2,
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

        return convertSeconds(total_time);
    }
}



// Run a series of functions one after another
async function runSequence(sequence) {

    const results = [];
    for (let func of sequence) {
       const result = await func();
    }
    return results;
}


// a single countdown interval for one activity/reset etc
function countdownInterval(count, updateinfo) {

    return async () => {

        return new Promise(resolve => { //return a Promise
            console.log("Running countdown interval: " + name);
            console.log("Details: " + JSON.stringify(updateinfo));
            let counter = setInterval(() => {
                
                if (pauseFlag == false)
                {
                    //update elements
                    for (const elem in updateinfo) {
                        $(elem).html(updateinfo[elem]);
                    }

                    $('#div_countdown').html("Remaining: " + count);
    


                    if (count <= 0) {
                        clearInterval(counter);
                        resolve(); //it is resolved when the count finishes
                        return;
                    }

                    count = count - 1;
                    
                }

            }, 1000);
        });
    }
}


function queueSession() { //you can only use `await` in async funcions 

    funcs = new Array();
  
    //run warm up interval
    if (config.warm_up_time > 0){
        funcs.push( countdownInterval(config.warm_up_time,  {
                "#div_set_count" : "Set: n/a", 
                "#div_rep_count" : "Rep: n/a", 
                "#div_activity_count" : "Activity Count: n/a", 
                "#div_activity" : "Activity: Warm Up"
                })
            );
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

                console.log("queing set=" + setDisplayNumber + " : Activity=" + activity.name + " : rep=" + repDisplayNumber );
               
                //queue work interval
                funcs.push( countdownInterval(config.rep_duration, {
                    "#div_set_count" : "Set: " + setDisplayNumber + "of " + config.set_count, 
                    "#div_rep_count" : "Rep: " + repDisplayNumber + " of " + config.reps_count, 
                    "#div_activity_count" : "Activity Count: " + activityCount + " of " +   config.activities.length,
                    "#div_activity" : "Activity: " + activity.name
                    })
                );
                //queue rest interval
                funcs.push( countdownInterval(config.rep_rest_duration, {
                    "#div_set_count" : "Set: " + setDisplayNumber + " of " + config.set_count, 
                    "#div_rep_count" : "Rep: " + repDisplayNumber + " of " + config.reps_count, 
                    "#div_activity_count" : "Activity Count: " + activityCount + " of " +   config.activities.length,
                    "#div_activity" : "Activity: Rest"
                    }) 
                );
                
                //runSync( timer(config.rep_duration, '#statusdiv', activity.name) );
                //run rep rest


            }); //end of reps loop for this activity

            if (config.activity_rest_duration > 0){

                funcs.push( countdownInterval(config.activity_rest_duration, {
                    "#div_set_count" : "Set: " + setDisplayNumber + "of " + config.set_count,  
                    "#div_rep_count" : "Rep: " + repDisplayNumber + " of " + config.reps_count, 
                    "#div_activity_count" : "Activity Count: " + activityCount + " of " +   config.activities.length,
                    "#div_activity" : "Activity: Rest before next activity"
                    }) 
                );
            }

        }); //end of activities loop

        //run reset between sets (only both if the rest is more than 0 seconds and there's more than 1 set)
        if (config.set_rest_duration > 0 && config.set_count > 1){
            funcs.push( countdownInterval(config.set_rest_duration, {
                "#div_set_count" : "Set: " + setDisplayNumber + "of " + config.set_count, 
                "#div_rep_count" : "Rep: " + repDisplayNumber + " of " + config.reps_count, 
                "#div_activity_count" : "Activity Count: " + activityCount + " of " +   config.activities.length,
                "#div_activity" : "Activity: rest before next set"
                })
            );
        }

    }); //end of sets loop

    //run cool down interval
    if (config.cool_down_time > 0){

        funcs.push( countdownInterval(config.cool_down_time, {
            "#div_set_count" : "Set: " + setDisplayNumber + "of " + config.set_count,  
            "#div_rep_count" : "Rep: " + repDisplayNumber + " of " + config.reps_count, 
            "#div_activity_count" : "Activity Count: " + activityCount + " of " +   config.activities.length,
            "#div_activity" : "Activity: Cool down"
            })
        );
    }


    //run the queued functions sequentially
    console.log("Running sequence of functions")
    runSequence(funcs);

    
}




$(document).ready(function(){

    $('#startbutton').click(function(){
        console.log("Start button clicked")
        
        queueSession();

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

    $('#div_total_time').html("total time: " + config.totaltime());



});