# flask-mapbox-app

This web application shows a map of fake data intended to illustrate some useful tools and possibilities 
provided throught Mapbox. Mapbox GL is a really cool open-source library that allows you to build interactive, 
customized maps.

This application is built with HTML, CSS, Javascript, Mapbox-GL.js and random geojson data. It is still in the 
development stage. Some browsers cannot load this site due to the fact that it uses cross-origin requests and 
many browsers, including Google Chrome, operate on a same-origin policy. 

If this is an issue, please try one of the following options:
(1) In the command line, go to the directry of your Chrome, and launch the application such that 
cross-origin requests are allowed:
   "chrome.exe" --allow-file-access-from-files
You can find more information on this method here https://stackoverflow.com/questions/18586921/how-to-launch-html-using-chrome-at-allow-file-access-from-files-mode.
(2) Download a zip file of my code from my GitHub repositoryand launch index.html as an HTML Preview in Atom. 
If you do not already have an HTML Preview add-on in Atom, try atom-html-preview 0.2.5.
(3) If you still cannot view the page, contact me and I would be happy to give you a live demo.
