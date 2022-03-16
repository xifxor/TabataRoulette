
var activityList = [
    {"name" : "Hip Thrusts", "image" : "hipthrusts.png"},
    {"name" : "Lunge", "image" : "lunge1.png"},
    {"name" : "Mountain Climbers", "image" : "mountainclimbers1.png"},
    {"name" : "Plank", "image" : "plank.png"},
    {"name" : "Pushups", "image" : "pushup1.png"},
    {"name" : "Sideplank", "image" : "sideplank1.png"},
    {"name" : "Situps", "image" : "situps.png"},
    {"name" : "Squats", "image" : "squats1.png"}
];




var imagePath = "images/"

//preload images





function SlotGroup(element, slotcount)
{
    var _this = this;
    this.element = element;
    this.slotcount = slotcount;
    this.slots = [];
    this.selectedActivities = [];

    //configure the container
    $(_this.element).addClass('slots_container');

    //create slots
    [...Array(slotcount)].forEach((slot, index) => {
        
        //create a div for the slot
        divSlot = document.createElement('div');

        //append the div to the container        
        $(divSlot).appendTo( $(_this.element) );


        //create the slot
        max = 25 + (index * 10);
        _this.slots.push( new Slot(divSlot, index, activityList, max, 2) );

    });
    
    //set slot width
    let totalSlotBorderWidth = parseInt($('.slot').css("border-left-width")) + parseInt($('.slot').css("border-right-width"));
    let availableWidth = $(_this.element).width() - (totalSlotBorderWidth * slotcount);
    let slotwidth = (availableWidth / slotcount);

    console.log("Setting slot with to " + slotwidth);
    $('.slot').css({width: slotwidth});


}


SlotGroup.prototype.start = function() {
    var _this = this;

    _this.selectedActivities = [];
    
    //start each child slot rolling
    _this.slots.forEach((slot, index) => {
        slot.start();
    });

};



SlotGroup.prototype.stop = function() {
    var _this = this;

    //clear the current selection
    _this.selectedActivities = [];
    //stop each child slot rolling
    _this.slots.forEach((slot, index) => {
        slot.stop();

        //save the activity that is selected
        //** this is running before the activity has finished */
        _this.selectedActivities.push( slot.activity );
    });


};



function Slot(element, name, activities, maxspeed, step) {
    
    var _this = this;
    _this.element = element; //dom element of the slot
    _this.slotname = name; //slot gets a name, mainly for troubleshooting
    _this.speed = 0; //current speed
    _this.step = step; //accelleration rate
    _this.timer = null; //timer for animation
    _this.interval = 50;
    _this.intialposition = 0;
    _this.maxSpeed = maxspeed; //max speed this slot can have
    _this.activities = activities; 
    _this.loadedimages = 0;
    _this.yoffset = 0; //the hidden amount above the top of the slot container (automatically calculated)
    _this.centerPointWithOffset = 0;
    _this.toppadding = 0; //padding is increased to create scroll effect
    _this.imagetocenteron = 3; //image index to center on
    _this.activity = null; //records the currently selected activity
    _this.images = [];

    console.log("Creating slot " + _this.slotname);



    //configure main element
    $(_this.element).addClass('slot');

    //create & append images container
    _this.imagesdiv = document.createElement('div');     
    $(_this.imagesdiv).addClass('slot_image_container')
        .appendTo( $(_this.element) );

    
    //record initial position of the div
    _this.intialposition = $(_this.element).position();

    //add center line
    centerpoint =  $(_this.element).parent().height() / 2;
    $('<div>').addClass("slot_line").appendTo( _this.element );

    //.css({top: centerpoint, width: 100,  position:'absolute'})

    //load & append images to images container
    _this.activities.forEach( (activity, index) => {

        activity['fullpath'] = imagePath + activity['image'];
        
        $('<img>')
            .attr("src",  activity['fullpath'])
            .appendTo( _this.imagesdiv )  
            .on('load', function(){
                _this.loadedimages++; //incremement the loaded images counter
               
                //check if all images are loaded
                if (_this.loadedimages >= _this.activities.length)
                {
                    console.log("Slot " + _this.slotname + ": All images loaded.");
    
                    //calculate y offset
                    $(_this.imagesdiv).find("img").each(function(index){
                  
                        if (index < _this.imagetocenteron ){
                            _this.yoffset -= $(this).height();
                        }
                        else if (index == _this.imagetocenteron ){

                           _this.yoffset +=  ( $(_this.element).parent().height() / 2) - ($(this).height() / 2);
                           _this.activity = activity; //set the currently selected activity

                        }
                        //console.log("Slot " + _this.slotname + ": yoffset=" + _this.yoffset);
                       
                    });

                    //all iages loaded so run other intialization activities
                    // $(_this.imagesdiv).css({top: -_this.yoffset, left: _this.intialposition.left, position:'absolute'});
                    $(_this.imagesdiv).css({top: _this.yoffset,  position:'absolute'});
    
                 }
    
            });
   

    });
            
}



Slot.prototype.start = function() {
    var _this = this;
    console.log("Slot " + _this.slotname + ": start()");

    //wait for slot to be ready


    //reset speed
    _this.speed = 0;

    //record container center point
    _this.centerPointWithOffset = -_this.yoffset + ($(_this.element).parent().height() / 2 );

   

    //increase the top padding until there is enough space for the bottom image(s)
    _this.timer = window.setInterval(function() {
        console.log("-------------------");
        //increase speed up to max
        if(_this.speed < _this.maxSpeed) {
            _this.speed += _this.step;  
        }

        //blur
        //** replace this with proper motion blur effect
        if(_this.speed > 20){
            $(_this.imagesdiv).addClass("blurdiv")
        }else{
            $(_this.imagesdiv).removeClass("blurdiv")    
        }

        //calculate the new required top padding
        console.log("Slot " + _this.slotname + ": _this.toppadding=" + _this.toppadding + "  _this.speed=" + _this.speed);
     
        let newTopPadding  = _this.toppadding + _this.speed;
        console.log("Slot " + _this.slotname + ": newTopPadding would be:" + newTopPadding);

        //move bottom images back to top (and reset padding)
        stopFlag = false;
        heightOfLastImage = $(_this.imagesdiv).find("img").last().height();

        while ( newTopPadding > heightOfLastImage )
        {
            
            //the new top padding is greater than the height of the bottom image
             
            heightOfLastImage = $(_this.imagesdiv).find("img").last().height();
            console.log("Slot " + _this.slotname + ": heightOfLastImage=" + heightOfLastImage);
   
            //move bottom image to top
            console.log("Slot " + _this.slotname + ": moving bottom image to top");
            $(_this.imagesdiv).find("img").last().detach().prependTo(_this.imagesdiv);         

            //reduce the new padding value by ths image hight 
            //_this.toppadding = newTopPadding - lastheight;
            newTopPadding -= heightOfLastImage;
            console.log("Slot " + _this.slotname + ": heightOfLastImage=" + heightOfLastImage + "  newTopPadding=" + newTopPadding);

        }
    
        //update to the new location
        _this.toppadding = newTopPadding;
        console.log("Slot " + _this.slotname + ": Setting top padding to: "  + _this.toppadding);
        $(_this.imagesdiv).css({"padding-top" : _this.toppadding  });



    }, _this.interval);
};


Slot.prototype.stop = function() {

    var _this = this;
    console.log("Slot " + _this.slotname + ": stop()");

    
    //clear previous timer and start a new one
    clearInterval(_this.timer);

    $(_this.imagesdiv).removeClass("blurdiv");

    //determine the selected image. if the center line has passed then it will be the next in line
    cumulativeHeight=0;
    $(_this.imagesdiv).find("img").each(function(index){

        imageCenterPoint = cumulativeHeight + _this.toppadding + ($(this).height() /2);
        imageCenterToCenterPointDelta = imageCenterPoint - _this.centerPointWithOffset; //incorrect#
       // distanceToNextImageCenter = 
        cumulativeHeight += $(this).height();
        /*
        console.log("Slot " + _this.slotname + ": index=" + index 
                            + " imageCenterPoint="  + imageCenterPoint
                            + " imageCenterToCenterPointDelta="  + imageCenterToCenterPointDelta
                            + " cumulativeHeight="  + cumulativeHeight
                            
                            );*/

        //select the image if it's center line hasnt yet met the container center line
        //the last one that matches will be the actual selected one
        if (imageCenterToCenterPointDelta < 0){
            //we found the selected image.  see which of the activities it relates to 
            selectedImage = this;
            console.log("Slot " + _this.slotname + " : selected image found")
           
            _this.activities.forEach( (activity, index) => {

                //console.log( "Slot " + _this.slotname + " :Selected image: " + $(selectedImage).attr("src"))
                //console.log("Slot " + _this.slotname + ": checing activity : " + activity['fullpath']);
                //if ( $(selectedImage).attr("src") == activity['image'])
                if ( $(selectedImage).attr("src") == activity['fullpath'])
                {
                    console.log("Slot " + _this.slotname + ":  selected activity: " + activity['name']);
                    _this.activity = activity;
                }

            });
           // _this.activity = $(this).attr("src");


            distanceToSelectedImage = -imageCenterToCenterPointDelta;
        }

    });

    //if image sizes are all the same then the new padding always comes out to 1 x image height
    /*
    console.log("Slot " + _this.slotname 
        + ": _this.activity=" + _this.activity 
        + ":  _this.toppadding=" +  _this.toppadding
        + " distanceToSelectedImage="  + distanceToSelectedImage);
    */

    /*
    //change padding by the ditance to selected image
    _this.toppadding = _this.toppadding  + distanceToSelectedImage;
    
    console.log("setting top padding to : "  + _this.toppadding);
    //_this.toppadding = _this.toppadding
    $(_this.imagesdiv).css({"padding-top" : _this.toppadding });
    */

    //arrive at the desired padding within a few intervals

    let remainingDistance = distanceToSelectedImage;
    
    _this.timer = window.setInterval(function() {
        paddingToAdd = Math.floor( remainingDistance/2);
        /*
        console.log("Slot " + _this.slotname 
            + ": remainingDistance: " + remainingDistance
            + ": paddingToAdd: " + paddingToAdd
            );
            */

        // if there's only a small distance left just finish it
        if( remainingDistance > 3) {
            _this.toppadding += paddingToAdd;
            
            //console.log("Slot " + _this.slotname + ": Setting top padding to: "+ _this.toppadding);
            $(_this.imagesdiv).css({"padding-top" : _this.toppadding  });

        }else{
            _this.toppadding += remainingDistance;
            //console.log("Slot " + _this.slotname + ": Final setting top padding to: "+ _this.toppadding);
            $(_this.imagesdiv).css({"padding-top" : _this.toppadding  });
           
            //console.log("Slot " + _this.slotname + ": finished");
            clearInterval(_this.timer);
            return;
        }
       
        remainingDistance -= paddingToAdd;

        //clearInterval(_this.timer); //troubleshootigS


    }, _this.interval);
    
       

};


