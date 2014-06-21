var selfEasyrtcid = "";
var monitorList = {};

var connect = function() {
    console.debug("Initializing local media");

    easyrtc.enableAudio(false);
    easyrtc.enableVideo(true);
    easyrtc.setUsername("cam");
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









