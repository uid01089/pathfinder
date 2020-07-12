# Pathfinder

## What is Pathfinder

Mainly Pathfinder is an object to learn and understand Javascript, Typescript, Css, HTML and all the funny things like NodeJS, WebPack and other cool stuff.

The focus was not 'only' use and learn an existing framework, but more to learn the techniques behind that. Hence I do not use any of the famous frameworks - but at the end it seems I created my own framework ;-). 

I have the personal need to show and create GPX tracks. Maps and tracks seems to be a good opportunity to lean the Web-techniques.

### Showing Maps
I tried to use all existing tile providers I found on the free web. Mainly related to https://openstreetmap.com, as well as from commercial providers (like https://google.com or https://mapbox.com). As rendering engine the famous https://leafletjs.com/ is used.

### Showing trails
Existing, official available trails can be displayed on the maps. Following resources can be added to the map:

- https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw
- https://hiking.waymarkedtrails.org/help/legal

### Showing weather
The raining radar as well the the clouds can be displayed of the map. These information are provided by 

- https://maps.dwd.de/geoserver/web/
- https://maps.dwd.de/geoserver/web

### Showing parking possibilities, Alpin Huts and Guest Houses
Parking possibilities, Alpin Huts and Guest Houses are retrieved from https://wiki.openstreetmap.org/wiki/Overpass_API[openstreetmap via Overpass-API].

### Loading, showing, editing and saving GPX tracks
Own tracks can be imported, modified and saved. 

### Showing as 3D model
The current map-view can be rendered as 3D object (like https://www.google.com/earth/). For rendering https://threejs.org/ is used.


