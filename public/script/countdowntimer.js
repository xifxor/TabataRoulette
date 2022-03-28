

let countdowntimer = {

    timer : null, //interval object
    skipflag : false, //if this is true then the current activity will be skipped
    elapsedseconds : 0,
    /// ** change to setActions() function so that assets can be loaded
    actions : [], //individual countdown tasks to run 
    actionindex : -1, //current action index
    currentcount : 0,
    playsound : true,
    endsoundpath :null, //play this sound  on the end intervals
    endsound :null, //container for the sound object
    endsoundcount : 3, 
    currentaction : function(){
       return this.actions[ this.actionindex ];
    },
    oninterval : function(){}, //for callbacks
    oncomplete : function(){}, //for callbacks
    start : function(){

        console.log("start()");
       
        //load sound if not already loaded
        if (this.endsoundpath != null){
            this.endsound = new Audio( this.endsoundpath );
        }

        //start the timer
        this.timer = setInterval(() => {

            //if the current count is 0 then pick up the next activity to process
            if (this.currentcount <= 0){
            
                //if there are more actions then pick up the next one
                if (this.actionindex < this.actions.length-1){
                    this.actionindex++;
                    this.currentcount = (this.currentaction())['count'];
                }
                //otherwise end the process
                else{
                    console.log("No actions remaining");
                    clearInterval(this.timer); //stop the timer
                    this.oncomplete(); //callback
                    return;
                }

            }       

            //play sound
           
            if (this.playsound)
            {
                 //** move this to being specified by input activities
                if (this.endsound != null && this.currentcount <= this.endsoundcount){
                    this.endsound.play();
                }
            }

        

            //call oninterval callback
            this.oninterval(this.currentcount);

            //increment and deincrement
            this.currentcount--;
            this.elapsedseconds++;

        }, 1000);

    },

    pause : function(){
        console.log("pause()");
        clearInterval(this.timer); //stop the timer

    },

    secondsToHMS : function(seconds){
        var convert = function(x) { return (x < 10) ? "0"+x : x; }
        return convert(parseInt(seconds / (60*60))) + ":" +
               convert(parseInt(seconds / 60 % 60)) + ":" +
               convert(seconds % 60)
      },

    /* get the total time of all actions */
    totalseconds : function(){
       // console.log("Running totalseconds()");

        if ( this.actions.length > 0){

            // return this.actions.map( (item) => { return item.count } ).reduce( (prev, next) => { return prev + next } );
            
            //shorthand
            return this.actions.map(item => item.count ).reduce( (prev, next) => prev + next);

        }else{
            return 0;
        }
       
    },
    
    totaltime : function(){
        return this.secondsToHMS(this.totalseconds());
    },

    remainingtime :  function(){
        return this.secondsToHMS(this.totalseconds() - this.elapsedseconds);
    },

    reset :  function(){
        console.log("Running reset()");
        clearInterval(this.timer);
        this.skipflag = false;
        this.elapsedseconds = 0;
        this.actionindex = -1;   
        this.currentcount = 0;

    }


}




