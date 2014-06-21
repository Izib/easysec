var selfEasyrtcid = "";
var monitorList = {};

var connect = function() {
    console.debug("Initializing local media");

    easyrtc.enableAudio(false);
    easyrtc.enableVideo(true);
    easyrtc.setUsername("cam");
    easyrtc.setPeerListener(peerListener);
    easyrtc.setRoomOccupantListener(roomOccupantListener);

    // Initialize the local media via getUserMedia()
    easyrtc.initMediaSource(
        function (){
            // Setup self video
            var selfVideo = document.getElementById("selfVideo");
            selfVideo.muted = true;
            easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());

            // Connect to EasyRTC Server
            console.debug("Connecting to EasyRTC Server");
            easyrtc.connect("easysec", loginSuccess, loginFailure);
            initiateMotionDetection();
        },
        function (){
            easyrtc.showError("no-media", "Unable to get local media");
        }
    );
};


// Run at connection if there is a connection or authorization failure.
var loginFailure = function(errorCode, message) {
    easyrtc.showError(errorCode, message);
};


// Run at connection after successful authorization with EasyRTC server
var loginSuccess = function(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    console.debug("Successful connection. Easyrctid is " + selfEasyrtcid);
    document.getElementById("iam").innerHTML = "I am " + easyrtc.cleanId(selfEasyrtcid);
};


// This listener gets called whenever there is a change to the details of who is in the room
var roomOccupantListener = function(roomName, clientListObj, myDetails) {
    console.debug("Running roomOccupantListener for room ["+roomName+"] with client list object:", clientListObj);
    console.debug("My details:", myDetails);

    //
    // remove any monitors that have gone away
    //
    for( monitor in monitorList) {
        if( !clientListObj[monitor]) {
           delete monitorList[monitor];
        }
    }
};


// This listener is called whenever a message is received from another peer
var peerListener = function(senderEasyrtcid, msgType, msg, target) {
    switch(msgType){
        case "getSnapshot":
            console.log("Sending snapshot");
            sendSnapshot(senderEasyrtcid);
            // add the monitor if not already added
            monitorList[senderEasyrtcid] = senderEasyrtcid;
        break;

        default:
            console.warn("["+senderEasyrtcid+"] Received unhandled msgType: " + msgType);
    }
    console.log("\nPeer Listener:\nARGUMENTS:", arguments);
};


// Takes a snapshot of the current video screen
var takeSnapshot = function() {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    var videoElement = document.getElementById("selfVideo");
    canvas.width = easyrtc.nativeVideoWidth;
    canvas.height = easyrtc.nativeVideoHeight;
    ctx.drawImage(videoElement, 0, 0, easyrtc.nativeVideoWidth, easyrtc.nativeVideoHeight, 0, 0, easyrtc.nativeVideoWidth, easyrtc.nativeVideoHeight);

    var imageDataURL = canvas.toDataURL('image/jpeg');
    return imageDataURL;
};


// Send snapshot to a specific easyrtcid
var sendSnapshot = function(targetEasyrtcid) {
    easyrtc.sendData(targetEasyrtcid, "snapshot", takeSnapshot(), function(){});
};


// Simple code to detect motion via the canvas method
var lastFrame = null;
var currentFrame = null;
var smallFrame;
var ampThreshold = 30;
var hitThreshold = 1000;
var lastMotion = false;

function compareFrames() {
    if( !smallFrame) {
        smallFrame = document.createElement("canvas");
        smallFrame.width = 180;
        smallFrame.height = 135;        
    }
    var ctx = smallFrame.getContext("2d");
    var videoElement = document.getElementById("selfVideo");
    ctx.drawImage(videoElement, 0, 0, easyrtc.nativeVideoWidth, easyrtc.nativeVideoHeight, 0, 0, smallFrame.width, smallFrame.height);
    currentFrame = ctx.getImageData(0, 0, smallFrame.width, smallFrame.height).data;
    var hits = 0;
    if( lastFrame) {
        var n = currentFrame.length;
        for( i = 0; i < n; i++) {
            if( Math.abs(currentFrame[i]-lastFrame[i]) > ampThreshold) {
                hits++;
            }
        }
    }
    lastFrame = currentFrame;
    var sawMotion = (hits > hitThreshold);
    if( lastMotion != sawMotion) {
        lastMotion = sawMotion;
        reportMotion(sawMotion);
    }

    return sawMotion;
}

// Send motion status to all monitors
function reportMotion(sawMotion) {
    if (sawMotion) {
        console.debug("Motion detected.");
    }
    else {
        console.debug("Motion not detected.");
    }

    for( monitor in monitorList) {
         easyrtc.sendData(monitor, "motionState", {"motion":sawMotion}, function(){});
    }
}

// Initiate motion detect to scan video four times a second
function initiateMotionDetection() {
    var sawMotion = compareFrames();
    setTimeout( initiateMotionDetection, (sawMotion?1000:250));
}
