# wesnoth-tiles

Javascript port of the beautiful hex system from [Battle for Wesnoth](wesnoth.org)

# try yourself

You need npm and gulp. 

    sudo apt-get install npm
    sudo npm install -g gulp

With tooling installed, you can build the application and run the reference webpage.

    npm install
    gulp scripts
    gulp serve

Now point your browser to http://127.0.0.1:8001/ 

# techology

Component will be written using Typescript, drawn on the Canvas. Gulp will take care of building.
Tiles will be uploaded as a sprite atlas, in default png format. 
WML files with terrain definitions will be converted using short GO program.

# supported terrains

- [x] plains
 - [x] green grass
 - [x] semi-dry grass
 - [x] dry grass
 - [x] leaf litter (base for trees)
 - [x] ice
 - [x] snow
 - [x] desert
 - [x] beach
- [x] hills
 - [x] green
 - [x] dry
 - [x] dunes
 - [x] snow
- [x] water
 - [x] ocean
 - [x] coast
 - [x] waves
 - [x] swamps
 - [x] mud
- [x] mountains
 - [x] regular
 - [x] dry
 - [x] snow
 - [x] volcano
 - [x] multihex
- [x] villages (multiple types)
- [x] woods, jungle and palms (multiple types)
- [x] extra overlays
 -  [x] rubbles
 -  [x] oasis
 -  [x] flowers
 -  [x] farms
 -  [x] stones
 -  [x] mushrooms
 -  [x] remains
- [x] ethereal abyss (chasm)

# current iteration (v0.6)
 - [ ] some better way to match terrains with macros, instead of having terrain, overlay and fog. 
 - [ ] automatic tests of the checksums
 - [x] reconsider fast map redraw/reload 
 - [ ] Try to find few more not needed tg groups. 

# next iteration (v0.7)
 - [ ] api stabilizing
 - [ ] 

# backlog list
 - introduce some automatic testing
 - introduce some way to test manually without changing app.js all the time. Editor, preset map buttons, better randomizers, etc.
 - bower_package
 - angular directive (?)
 - interfaces cleanup
 - multiple maps
# license

GPL. See LICENSE file in the root of the repository.

# preview

![](http://i.imgur.com/jO4kabC.jpg)

# from author

Special thanks for the awesome authors of Battle for Wesnoth!
