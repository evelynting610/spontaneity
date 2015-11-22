var clickedEvent;
console.log("js is working");
Events = new Mongo.Collection("events");
var error = false;


if (Meteor.isClient) {
    
    Session.setDefault("counter", 0);
    Session.setDefault("selectedEvent", '');
    
    displayMainPage = function() {
        document.getElementById("submit-event-page").style.display = 'none';  
        document.getElementById("main-page").style.display = 'block';
        document.getElementById("event-details").style.display = 'none';
        document.getElementById("submission-notification").style.display = 'none';
        
    }

    Template.mainPageBody.rendered = function () {
        document.getElementById("submit-event-page").style.display = 'none';  
        document.getElementById("main-page").style.display = 'block';
        document.getElementById("login-page").style.display = 'block';
        document.getElementById("event-details").style.display = 'none';
        document.getElementById("submission-notification").style.display = 'none';
        
        var goBackButton = document.getElementById("returnToMainPage");
        goBackButton.onclick = displayMainPage;
        
        var elems = document.getElementsByClassName('eventDetailsBody');
        for (var i=0;i<elems.length;i+=1){
            document.getElementsByClassName('eventDetailsBody')[i].style.display='none';
            console.log("one elem" + " i= " + i);
        } //this code is not working unless I input it into the console
        var postEventButton = document.getElementById("postEvent");
            postEventButton.onclick = function() { 
                document.getElementById("submit-event-page").style.display = 'block';  
                document.getElementById("main-page").style.display = 'none';
                document.getElementById("event-details").style.display = 'none';
            }   

    }
    
    Template.getEvent.events({
        'click .close': function(){
            Events.remove(this._id);
        },        
        'click .eventDetailsSummary': function(){
            Session.set("selectedEvent", this._id);
        }
        
    });
    
     Template.getEvent.helpers({
        selected: function () {
            return Session.equals("selectedEvent", this._id) ? "selected" : '';
     },
         userPostedEvent: function() {
             return Meteor.userId()==this.owner;
         }
     });
    
    Template.eventDetailsBody.events({
        'click .peopleCount': function(){
            Events.update(this._id, {
                $inc: {peopleGoing: 1}
            });
        }
    });
    
     Template.mainPageBody.helpers({
        events: function(){
            //CHECKS if location is close enough
            if (Geolocation.latLng()){
                var userLat= Geolocation.latLng().lat;    //USER lat refers to listener
                var userLng= Geolocation.latLng().lng;
                var upperLat = userLat+0.0224982;
                var lowerLat = userLat-0.0224982;
                var additive = 2.5/(Math.cos(userLat)*111.321);
                var upperLng = userLng+additive;
                var lowerLng = userLng-additive;
                //console.log(upperLat, lowerLat, upperLng,lowerLng);
            }else{
                console.log("Hasn't yet found lat and long");
            }
            
            var currentTime = new Date().getTime();
            var expiredTime = currentTime-28800000; //8 hours in milliseconds

            return Events.find( { $and: [ { lat: { $lt: upperLat, $gt: lowerLat} }]  }, { $and: [ { lng: { $lt: upperLng, $gt: lowerLng} }]  }, {createdAt: {$gt: expiredTime} }, {sort: {createdAt: 1} }).fetch();
            //return Events.find().fetch();
        }
    });
    
     Template.addEventForm.events({
        "submit form": function (evt) {
        // This function is called when the new event form is submitted
        evt.preventDefault();
            
        console.log("The event type is "+ evt.type);
        var eventTitle = event.target.eventTitle.value;
        var eventLocation = event.target.eventLocation.value;
        var eventStart = event.target.eventStart.value;
        var eventEnd = event.target.eventEnd.value;
        var lat = Geolocation.latLng().lat;
        var lng = Geolocation.latLng().lng;
        if (eventTitle.length > 140) {
            error = true;
        } else if (eventTitle.length<1 || eventLocation.length < 1) {
            error = true;
        } else {
            error = false;
        }
            
        if (error){
            alert("Please fill all fields");
        }else {
            document.getElementById("submit-event-page").style.display = 'none';  
            document.getElementById("main-page").style.display = 'none';
            document.getElementById("event-details").style.display = 'none';
            document.getElementById("submission-notification").style.display = 'block';
            
            Events.insert({
                title: eventTitle,
                owner: Meteor.userId(),
                createdAt: new Date().getTime(), // current time
                startTime: eventStart,
                endTime: eventEnd,
                nominalLocation: eventLocation, // location user says event is at
                lat: lat,
                lng: lng,
                peopleGoing: 0
            });
            console.log("EVENT LOGGED IN MONGO SUCCESSFULLY");
        }

        // Clear form
        event.target.eventTitle.value = "";
        event.target.eventLocation.value = "";
        event.target.eventStart.value = "";
        event.target.eventEnd.value = "";
        

        // Prevent default form submit
        return false;
    }
});
    
    Template.submissionNotification.rendered = function () {
        document.getElementById("submit-event-page").style.display = 'none';  
        document.getElementById("main-page").style.display = 'none';
        document.getElementById("login-page").style.display = 'none';
        document.getElementById("event-details").style.display = 'none';
        document.getElementById("submission-notification").style.display = 'block';
        
        var goHome = document.getElementById("goHome"); //post an event
        goHome.onclick = displayMainPage; 

    }

}