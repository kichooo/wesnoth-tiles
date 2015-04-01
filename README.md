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

# plans
1. Terrains (grass, hills mountains);
2. Overlay objects (huts, windmills, flowers trees etc.);
3. Create bower component.
4. Easy usage.

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
- [ ] water
 - [x] ocean
 - [x] coast
 - [ ] waves
 - [ ] swamps
 - [ ] mud
- [ ] mountains
 - [x] regular
 - [x] dry
 - [x] snow
 - [x] volcano
 - [x] multihex
 - [ ] impassable
- [ ] villages (multiple types)
- [ ] woods, jungle and palms (multiple types)
- [ ] extra overlays
 -  [ ] rubbles
 -  [ ] oasis
 -  [ ] flowers
 -  [ ] farms
 -  [ ] stones
 -  [ ] mushrooms
 -  [ ] remains
- [ ] ethereal abyss (chasm)

# current iteration (v0.2)

 - [x] encode all needed terrain types
 - [x] finish plains
 - [ ] finish mountains
 - [ ] finish water
 - [ ] hunt transition bugs

# next iteration (sketch)

 - [ ] typescript formatter
 - [ ] macros cleanup
 - [ ] introduce some automatic testing
 - [ ] introduce some way to test manually without changing app.js all the time.
 
# license

GPL. See LICENSE file in the root of the repository.

# preview

![](http://i.imgur.com/drejkVh.jpg)

# from author

Special thanks for the awesome authors of Battle for Wesnoth!
