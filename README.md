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

# license

GPL. See LICENSE file in the root of the repository.

# preview

![](http://i.imgur.com/drejkVh.jpg)

# from author

Special thanks for the awesome authors of Battle for Wesnoth!
