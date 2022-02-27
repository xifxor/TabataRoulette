



var arrImages = [
    "hipthrusts.png",
    "lunge1.png",
    "mountainclimbers1.png",
    "plank.png",
    "pushup1.png",
    "sideplank1.png",
    "situps.png",
    "squats1.png"
];



var activityList = [
    {"name" : "Hip Thrusts", "image" : "hipthrusts.png"},
    {"name" : "Lunge", "image" : "lunge1.png"},
    {"name" : "Mountain Climbers", "image" : "mountainclimbers1.png"},
    {"name" : "Plank", "image" : "plank.png"},
    {"name" : "Pushups", "image" : "pushup1.png"},
    {"name" : "Lunge", "image" : "sideplank1.png"},
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
        _this.slots.push( new Slot(divSlot, index, arrImages, max, 2) );

    });
    
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
    //start each child slot rolling
    _this.slots.forEach((slot, index) => {
        slot.stop();
        //save the activity that is selected
        _this.selectedActivities.push( slot.activity );
    });


};



function Slot(element, name, imagepaths, maxspeed, step) {
    
    var _this = this;
    _this.element = element; //dom element of the slot
    _this.slotname = name; //slot gets a name, mainly for troubleshooting
    _this.speed = 0; //current speed
    _this.step = step; //accelleration rate
    _this.timer = null; //timer for animation
    _this.intialposition = 0;
    _this.maxSpeed = maxspeed; //max speed this slot can have
    _this.imagepaths = imagepaths; 
    _this.loadedimages = 0;
    _this.yoffset = 0; //the hidden amount above the top of the slot container (automatically calculated)
    _this.toppadding = 0; //padding is increased to create scroll effect
    _this.imagetocenteron = 2; //image index to center on
    _this.activity = null; //records the currently selected activity

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
    $('<div>').addClass("slot_line").css({top: centerpoint, width: 100,  position:'absolute'}).appendTo( _this.element );


    //load & append images to images container
    $(arrImages).each(function(){

        imagepath = imagePath + this;
        $('<img>')
            .attr("src",  imagepath)
            .appendTo( _this.imagesdiv )  
            .on('load', function(){
                _this.loadedimages++; //incremement the loaded images counter
               
                //check if all images are loaded
                if (_this.loadedimages >= _this.imagepaths.length)
                {
                    console.log("Slot " + _this.slotname + ": all images loaded");
    
                    //calculate initial yoffset - use half way down second image for now
                    $(_this.imagesdiv).find("img").each(function(index){
                  
                        if (index < _this.imagetocenteron ){
                            _this.yoffset -= $(this).height();
                        }
                        else if (index == _this.imagetocenteron ){
                           // _this.yoffset -= ($(this).height() / 2);
                           //console.log("Slot " + _this.slotname + ": el height: " +  $(_this.element).parent().height());
                           _this.yoffset +=  ( $(_this.element).parent().height() / 2) - ($(this).height() / 2);
                           _this.activity = $(this).attr("src");
                        }
                        //console.log("Slot " + _this.slotname + ": yoffset=" + _this.yoffset);
                       
                    });
                    
                    //console.log("Slot " + _this.slotname + ": final yoffset=" + _this.yoffset);
                    //console.log("Slot " + _this.slotname + ": initial left=" + _this.intialposition.left);
    
                   
    
                    //all iages loaded so run other intialization activities
                    //left: _this.intialposition.left,
                   // $(_this.imagesdiv).css({top: -_this.yoffset, left: _this.intialposition.left, position:'absolute'});
                    $(_this.imagesdiv).css({top: _this.yoffset,  position:'absolute'});
    
         
    
                   
    
                }
    
              });
    });

    
    //add onload handler to all images
    //$(this.imagesdiv).find("img").each(function(){ });
            
}

Slot.prototype.load = function() {
    console.log("prototype load");


}

Slot.prototype.start = function() {
    var _this = this;
    console.log("Slot " + _this.slotname + ": start()");

    //wait for slot to be ready


    //reset speed
    _this.speed = 0;


    //increase the top padding until there is enough space for the bottom image(s)
    _this.timer = window.setInterval(function() {

        //increase speed up to max
        if(_this.speed < _this.maxSpeed) {
            _this.speed += _this.step;  
        }

        //move images down by speed
        //let currentTopPadding = $(_this.imagesdiv).css("padding-top");
        let newTopPadding  = _this.toppadding + _this.speed;
        console.log("speed: "  + _this.speed);
        console.log("newTopPadding: "  +  _this.toppadding );
        
       

        //move bottom images back to top (and reset padding)
        //*** needs to  repeat until not true in case of larger steps
        if ( newTopPadding  >= $(_this.imagesdiv).find("img").last().height() ){
            //console.log("the new top is greater than the height of the bottom image")

            lastheight = $(_this.imagesdiv).find("img").last().height();
           
            //move bottom image to top
            $(_this.imagesdiv).find("img").last().detach().prependTo(_this.imagesdiv);         

            //reduce new top by the image height
            _this.toppadding = newTopPadding - lastheight;
        }else{
            _this.toppadding = newTopPadding;

        }

        console.log("setting top padding to : "  + _this.toppadding);
        $(_this.imagesdiv).css({"padding-top" : _this.toppadding  });



    }, 50);
};


Slot.prototype.stop = function() {

    var _this = this;
    console.log("Slot " + _this.slotname + ": stop()");

    stopstep = -5;
    clearInterval(_this.timer);

    centerpoint =  $(_this.element).parent().height() / 2;
    lookingforhegiht = -_this.yoffset + centerpoint;
    console.log("Slot " + _this.slotname + ": yoffset=" + _this.yoffset );
    console.log("Slot " + _this.slotname + ": centerpoint=" + centerpoint);
    console.log("Slot " + _this.slotname + ": lookingforhegiht=" + lookingforhegiht);

    /*
        ((current image /2) + height of all previous images + toppadding)
            - this.yoffset
*/
    
    _this.timer = window.setInterval(function() {

        heightsofar=0;
        $(_this.imagesdiv).find("img").each(function(index){

            //test = heightsofar + ($(this).height() /2 );
            centerofthisimage = heightsofar + _this.toppadding + $(this).height() /2;
            distancefromcenterline = centerofthisimage - lookingforhegiht;
            console.log("Slot " + _this.slotname + ": padding=" + _this.toppadding + " index=" + index + " centerofthisimage=" + centerofthisimage + " distancefromcenterline=" + distancefromcenterline);
            
            heightsofar += $(this).height();

        });



        // if the speed is still greater than another step then keep going
        if(_this.speed > -stopstep) {
            _this.speed += stopstep;  
        }else{
            console.log("Slot " + _this.slotname + ": finished");
            clearInterval(_this.timer);
        }

        //move images down by speed
        //let currentTopPadding = $(_this.imagesdiv).css("padding-top");
        let newTopPadding  = _this.toppadding + _this.speed;
        console.log("speed: "  + _this.speed);
        console.log("newTopPadding: "  +  _this.toppadding );
        
        

        //move bottom images back to top (and reset padding)
        //*** needs to  repeat until not true in case of larger steps
        if ( newTopPadding  >= $(_this.imagesdiv).find("img").last().height() ){
            //console.log("the new top is greater than the height of the bottom image")

            lastheight = $(_this.imagesdiv).find("img").last().height();
            
            //move bottom image to top
            $(_this.imagesdiv).find("img").last().detach().prependTo(_this.imagesdiv);         

            //reduce new top by the image height
            _this.toppadding = newTopPadding - lastheight;
        }else{
            _this.toppadding = newTopPadding;

        }

        console.log("setting top padding to : "  + _this.toppadding);
        $(_this.imagesdiv).css({"padding-top" : _this.toppadding  });



    }, 500);

       

};



Slot.prototype.stop_old = function() {
    var _this = this;
    console.log("Slot " + _this.slotname + ": stop()");
    clearInterval(_this.timer);

    //the selected image is normally _this.imagetocenteron
    //**however the selection should always correct downwards
    //* currently it will jump back if it's more than half way past the current selection


    //calculate currently visible image
    $(_this.imagesdiv).find("img").each(function(index){
        
        if (index == _this.imagetocenteron ){
           // _this.yoffset -= ($(this).height() / 2);
           //console.log("Slot " + _this.slotname + ": el height: " +  $(_this.element).parent().height());
           _this.yoffset -=  ( $(_this.element).parent().height() / 2) - ($(this).height() / 2);
           console.log("Slot " + _this.slotname + ": index " + index + " selected image " + $(this).attr("src") );
            //record the value of the selecter activity

           _this.activity = $(this).attr("src");
        }
            
            //_this.yoffset += $(this).height();
        

    });
    
    //center the image (preferably with an animation)
    //$(_this.imagesdiv).css({top: -_this.yoffset,  position:'absolute'});
    $(_this.imagesdiv).css({"padding-top" : 0 });






};




/*

    Slot.prototype.stop = function() {
        var _this = this,
            limit = 30;
        clearInterval(_this.si);
        _this.si = window.setInterval(function() {
            if(_this.speed > limit) {
                _this.speed -= _this.step;
                $(_this.el).spSpeed(_this.speed);
            }
            if(_this.speed <= limit) {
                _this.finalPos(_this.el);
                $(_this.el).spSpeed(0);
                $(_this.el).spStop();
                clearInterval(_this.si);
                $(_this.el).removeClass('motion');
                _this.speed = 0;
            }
        }, 100);
    };

*/



$(document).ready(function(){   

    var s1 = new SlotGroup("#slots_container", 1);
    //***need to wait for s1 to properly load

    $(spinbutton).click(function(){
        console.log("Spin");

        if ($(this).val() == "Spin")
        {
            s1.start();
            $(this).val("Stop") ;
        }else{
            s1.stop();
            $(this).val("Spin");
            $("#exercise_list").html( s1.selectedActivities.join("<br>"));

        }

    });
    

});
