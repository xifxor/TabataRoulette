
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



/************************************************************************
*
* Slot GROUP object
*
***********************************************************************/

function SlotGroup(element, slotcount, loadedCallback=null)
{
    var _this = this;
    _this.element = element;
    _this.slotcount = slotcount;
    _this.slots = [];
    _this.selectedActivities = [];
    _this.loadedCallback = loadedCallback;

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
        _this.slots.push( new Slot(divSlot, index, activityList, max, 2, function(x){ _this.slotLoadedCallback(x) } ) );

    });
    
    //set slot width
    let totalSlotBorderWidth = parseInt($('.slot').css("border-left-width")) + parseInt($('.slot').css("border-right-width"));
    let availableWidth = $(_this.element).width() - (totalSlotBorderWidth * slotcount);
    let slotwidth = (availableWidth / slotcount);

    console.log("Setting slot with to " + slotwidth);
    $('.slot').css({width: slotwidth});


    

}

//this function is called when each slot confirms it has loaded
SlotGroup.prototype.slotLoadedCallback = function(name) {
   
    var _this = this;
    console.log("Slot " + name + " has loaded");

    //check if all slots are loaded
    let allSlotsLoaded = _this.slots.every(function(slot){
         return slot.loaded;  
    });

    if (allSlotsLoaded)
    {
        console.log("All slots are now loaded");
      
        if (_this.loadedCallback != null){
            console.log("Callback function is present");

            //update activities
            _this.selectedActivities = [];

            _this.slots.forEach((slot, index) => {
                _this.selectedActivities.push( slot.activity );
            });


             _this.loadedCallback();
        }else{
    
            console.log("No callback function is present")
        }

    }


};


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




/************************************************************************
*
* Slot object
*
***********************************************************************/


function Slot(element, name, activities, maxspeed, step, loadedCallback) {
    
    var _this = this;
    _this.element = element; //dom element of the slot
    _this.slotname = name; //slot gets a name, mainly for troubleshooting
    _this.speed = 0; //current speed
    _this.step = step; //accelleration rate
    _this.timer = null; //timer for animation
    _this.interval = 50;
    _this.intialposition = 0;
    _this.maxSpeed = maxspeed; //max speed this slot can have
    _this.activities = activities; //the possible activities
    _this.loadedimages = 0;  //the count of images that have been loaded
    _this.yoffset = 0; //the hidden amount above the top of the slot container (automatically calculated)
    _this.centerPointWithOffset = 0;
    _this.toppadding = 0; //padding is increased to create scroll effect
    _this.imagetocenteron = 3; //image index to center on
    _this.activity = null; //records the currently selected activity
    //_this.images = [];
    _this.distanceToSelectedImageCenter = 0;
    _this.loadedCallback = loadedCallback; //loaded callback function
    _this.loaded = false;


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

    //**load sounds
    //** load all elements? */


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
    
                    //calculate initial y offset
                    $(_this.imagesdiv).find("img").each(function(index){
                        
                        if (index < _this.imagetocenteron ){
                            _this.yoffset -= $(this).height();
                        }
                        else if (index == _this.imagetocenteron ){

                           _this.yoffset +=  ( $(_this.element).parent().height() / 2) - ($(this).height() / 2);
                           _this.activity = activity; //set the currently selected activity
                           //console.log("Slot " + _this.slotname + ": Activity has been set to " + _this.activity['name'])
                        
                        }
                        //console.log("Slot " + _this.slotname + ": yoffset=" + _this.yoffset);
                       
                    });

                   
                    //console.log("Slot " + _this.slotname + ": Activity has been set to " + _this.activity['name'])

                    //all iages loaded so run other intialization activities
                    // $(_this.imagesdiv).css({top: -_this.yoffset, left: _this.intialposition.left, position:'absolute'});
                    $(_this.imagesdiv).css({top: _this.yoffset,  position:'absolute'});
                   

                    //record container center point
                    //this is the distance from the top of the images div to the center of the visible slots container
                    _this.centerPointWithOffset = -_this.yoffset + ($(_this.element).parent().height() / 2 );

                    //get the selected activity
                     _this.getSelectedActivity();

                    

                    // run callback
                    _this.loaded = true;
                    _this.loadedCallback(_this.slotname);
    
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


/* 
get the currently selected image

*/

Slot.prototype.getSelectedActivity = function() {
    
    var _this = this;

    console.log("Slot " + _this.slotname + " : getting selected activity")

    let cumulativeHeight = _this.toppadding;
    let selectedImage = null;

    //loop through the images 
    $(_this.imagesdiv).find("img").each(function(index){

            //calculate the distance from the top of the images div, to the center point of this image
            imageCenterPoint = cumulativeHeight  + ($(this).height() /2);


            cumulativeHeight += $(this).height();
            console.log("Slot " + _this.slotname + 
                        " : index " + index + 
                        " image:" +  $(this).attr("src") + 
                        " y_offset:" + _this.yoffset + 
                        " imageCenterPoint:" + imageCenterPoint + 
                        " centerPointWithOffset:" + _this.centerPointWithOffset  
                        );

            //select the image if it's center line hasnt yet met the container center line
            //the last one that matches will be the actual selected one
             if (imageCenterPoint >=_this.centerPointWithOffset){  
                if (selectedImage == null){

                    //we found the selected image.  see which of the activities it relates to 
                    selectedImage = this;
                    console.log("Slot " + _this.slotname + " : selected image found");

                    // should be a better way to do this
                    _this.activities.forEach( (activity, index) => {

                        if ( $(selectedImage).attr("src") == activity['fullpath'])
                        {
                            console.log("Slot " + _this.slotname + ":  selected activity: " + activity['name']);
                            _this.activity = activity;
                        }

                    });

                    _this.distanceToSelectedImageCenter = -(imageCenterPoint - _this.centerPointWithOffset);

                }

            }
           
        

    });

    console.log("Slot " + _this.slotname + ": Activity was foun to be " + _this.activity['name'])

    return _this.activity;

}


Slot.prototype.stop = function() {

    var _this = this;
    console.log("Slot " + _this.slotname + ": stop()");

    
    //clear previous timer and start a new one
    clearInterval(_this.timer);

    $(_this.imagesdiv).removeClass("blurdiv");

    //get the selected image
    _this.getSelectedActivity();


    //if image sizes are all the same then the new padding always comes out to 1 x image height


    //arrive at the desired padding within a few intervals

    let remainingDistance = _this.distanceToSelectedImageCenter;
    
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


