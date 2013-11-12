EasyRTC Security App Example
============================

This demo app was originally created for a conference, however it's gained enough attention that we'll be fixing it up a bit more.

Currently this project is split into thee folders to show the progression the development process would take. To save on maintenance we'll be combining the three into one app in the near future.

Features:
---------
 
1. Uses new EasyRTC Modular
2. One monitor can view many security cameras
3. Motion detection used to alert monitor of movement
4. Monitor gets periodic images from each camera
5. Monitor can view live feed from camera with a single click 


Folders:
--------

 - **1_easysec-minimal**
   - Monitor simply shows live feed from all camera

 - **2_easysec_with_motion**  
   - Camera sends image to monitor rather than video
   - Camera sends alert when motion detected
   - Monitor can view live feed with one click

 - **3_easysec_dressed_up**
   - Added CSS and some images to make it look better 

 - Each folder contains:
   - `package.json` - Provides project information allowing npm to find and install required modules.
   - `server.js` - Contains server code.
   - `static` - Subfolder where client side HTML, Javascript, and CSS reside.

 
Installing Required Modules:
----------------------------

 - Enter the folder of the version you wish to start
 - Type `npm install` in console.
 - This will read the package.json file to find and install the required modules including EasyRTC, Express, and Socket.io.
 - Required modules will go into a new 'node_modules' subfolder


Running the Server:
-------------------

 - Type `node server` in console.


Viewing the examples:
---------------------

 - In your WebRTC enabled browser, visit your server address including the port. By default port 80 is used.
 - http://localhost/