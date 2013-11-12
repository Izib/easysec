$('a').click(function(event) {
    event.preventDefault();
});

var camListObj = {};

var connect = function() {
    easyrtc.enableAudio(false);
    easyrtc.enableVideo(false);
    easyrtc.setUserName("monitor");
    easyrtc.setRoomOccupantListener(roomOccupantListener);
    easyrtc.connect("easysec", loginSuccess, loginFailure);
};

// Run at connection if there is a connection or authorization failure.
var loginFailure = function(errorCode, message) {
    easyrtc.showError(errorCode, message);
};

// Run at connection after successful authorization with EasyRTC server
var loginSuccess = function(easyrtcid) {
    $("#iam").html("I am " + easyrtc.cleanId(easyrtcid));

    easyrtc.setStreamAcceptor(streamAcceptor);
};

// When a stream arrives, this gets run.
var streamAcceptor = function(peerEasyrtcid, stream) {
    console.debug("Getting stream from " + peerEasyrtcid);
    var monitorVideo = document.getElementById("video_" + peerEasyrtcid);
    easyrtc.setVideoObjectSrc(monitorVideo, stream);
    $("#snapshot_" + peerEasyrtcid).hide();
    $("#video_" + peerEasyrtcid).show();
};



// This listener gets called when ever there is a change to the details of who is in the room
var roomOccupantListener = function(roomName, peerListObj, myDetails) {
    console.debug("Running roomOccupantListener for room [" + roomName + "] with client list object:", peerListObj);
    console.debug("My details:", myDetails);

    // remove cameras?
    $.each(camListObj, function(peerEasyrtcid, clientObj) {
        if (!peerListObj[peerEasyrtcid]) {
            cameraRemove(peerEasyrtcid);
        }
    });

    // add cameras?
    $.each(peerListObj, function(peerEasyrtcid, clientObj) {
        if (clientObj.username == "cam" && !camListObj[peerEasyrtcid]) {
            // Adding camera after a short delay to ensure camera is done login
            setTimeout(function() {
                cameraAdd(peerEasyrtcid, clientObj);
                 easyrtc.call(peerEasyrtcid, 
                   function(easyrtcid, mediaType) {
                     console.log("Got mediatype " + mediaType + " from " + easyrtc.idToName(easyrtcid));
                   }, 
                   function(errorCode, errMessage) {
                     console.log("call to  " + easyrtc.idToName(peerEasyrtcid) + " failed:" + errMessage);
                   },
                  function(wasAccepted, easyrtcid) { }
                 );
            }, 500);
        }
    });
};

// Adds the element to hold a camera view, and initiates the call
cameraAdd = function(peerEasyrtcid, clientObj) {
    console.debug("Adding camera view for " + peerEasyrtcid);

    // Clone clientObj into camListObj
    camListObj[peerEasyrtcid] = JSON.parse(JSON.stringify(clientObj));

    // Create HTML element to hold cam video
    var newDiv = "<div class=\"monitor\" id=\"monitor_" + peerEasyrtcid + "\" >";
    newDiv += "<video class=\"video \" id=\"video_" + peerEasyrtcid + "\"></video>";
    newDiv += "</div>";

    // Append new Monitor to Monitors
    $(newDiv).appendTo("#monitors");

    // Initialize Controls for new Monitor
    initNewMonitorControls(peerEasyrtcid);
};

// Removing the element to which holds the camera view. Ensures the connection is disconnected.
cameraRemove = function(peerEasyrtcid) {
    console.debug("Removing camera view for " + peerEasyrtcid);

    easyrtc.hangup(peerEasyrtcid);
    $("#monitor_" + peerEasyrtcid).remove();

    if (camListObj[peerEasyrtcid]) {
        delete camListObj[peerEasyrtcid];
    }
};




