

let countdowntimer = {

    timer : null, //interval object
    skipflag : false, //if this is true then the current activity will be skipped
    elapsedseconds : 0,
    intervals : [], //interval details 
    intervalindex : -1, //current interval index
    currentcount : 0,
    currentinterval : function(){
       return this.intervals[ this.intervalindex ];
    },
    oninterval : function(){}, //for callbacks
    oncomplete : function(){}, //for callbacks
    start : function(){

        console.log("Running start()");
       // console.log("Interval count: " + this.intervals.length )
        
        this.timer = setInterval(() => {

            //if the current count is 0 then pick up the next activity to process
            if (this.currentcount <= 0){
            
                //if there are more intervals then pick up the next one
                if (this.intervalindex < this.intervals.length-1){
                    this.intervalindex++;
                    this.currentcount = (this.currentinterval())['count'];
                }
                //otherwise end the process
                else{
                    console.log("No intervals remaining");
                    clearInterval(this.timer); //stop the timer
                    this.oncomplete(); //callback
                    return;
                }

            }       

            //increment and deincrement
            this.currentcount--;
            this.elapsedseconds++;

            //call oninterval callback
            this.oninterval();

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

    /* get the total time of all intervals */
    totalseconds : function(){
       // console.log("Running totalseconds()");

        if ( this.intervals.length > 0){

            // return this.intervals.map( (item) => { return item.count } ).reduce( (prev, next) => { return prev + next } );
            
            //shorthand
            return this.intervals.map(item => item.count ).reduce( (prev, next) => prev + next);

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
       
        this.timer = null;
        this.skipflag = false;
        this.elapsedseconds = 0;
        this.intervalindex = -1;   
        this.currentcount = 0;

    }


}




