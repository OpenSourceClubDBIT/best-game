import meta from './Meta';
import Keyboard from './Keyboard';

export default class Map {
    constructor(ctx, spl) {
        this.spl = spl;

        this.terrain = [];
        this.obstacles = [];
        this.camera_width = meta.camera[0];
        this.camera_height = meta.camera[1];
        this.map_width = meta.map[0];
        this.map_height = meta.map[1];

        this.camera_top_x = Math.floor((this.map_width - this.camera_width)/2);
        this.camera_top_y = Math.floor((this.map_height - this.camera_height)/2);
        this.keyboard = new Keyboard();
        this.generate_map();

    }

    draw(char_pos) {
        if(char_pos) {

            const [x, y] = [char_pos[0] - window.camera[0], char_pos[1] - window.camera[1]];
            if(x < this.camera_width/4 && this.keyboard.left_pressed) {
                this.camera_top_x -= 1;
                if(this.camera_top_x < 0)
                    this.camera_top_x = 0
            }

            if(x > this.camera_width*3/4 && this.keyboard.right_pressed) {
                this.camera_top_x += 1;
                if(this.camera_top_x > this.map_width - this.camera_width)
                    this.camera_top_x = this.map_width - this.camera_width;

            }

            if(y < this.camera_height/4 && this.keyboard.up_pressed) {
                this.camera_top_y -= 1;
                if(this.camera_top_y < 0)
                    this.camera_top_y = 0;
            }

            if(y > this.camera_height*3/4 && this.keyboard.down_pressed) {
                this.camera_top_y += 1;
                if(this.camera_top_y > this.map_height - this.camera_height)
                    this.camera_top_y = this.map_height - this.camera_height;
            }
        }

        window.camera = [this.camera_top_x, this.camera_top_y];
        this.obstacles.forEach(function(row, i) {
            row.forEach(function(tile, j) {
                if(+!!tile) {
                    window.obstacles[i][j] = +!!tile;
                }
            });
        });
        this.render_camera(this.camera_top_x, this.camera_top_y);
    }

    generate_map() {
        var me = this;
        // TO DO: start at centre, define obstacles
        // TO DO: consider spacetime drawing: for multi units(space) and animations(time)

        for (var i = 0; i < this.map_width; i++) {
            var row = []
            for (var j = 0; j < this.map_height; j++) {
                row.push(0);
            }
            this.terrain.push(row);
        }

        for (var i = 0; i < this.map_width; i++) {
            var row = []
            for (var j = 0; j < this.map_height; j++) {
                row.push(0);
            }
            this.obstacles.push(row);
        }

        let terrain_objects = ['yellow_patch', 'blue_patch', 'green_patch_1', 'green_patch_2', 'green_patch_3', 'green_patch_4'];
        let obstacles = ['house_1', 'tower'];

        let frequencies = {
            area25: [5,6,7],
            area24: [4,5,6],
            area9: [15,16,17],
            area6: [19, 20, 21],
            area4: [24, 25, 26],
            area2: [24, 25, 26],
            area1: [22, 23, 24],
        };

        terrain_objects.forEach((object) => {
            const meta = this.spl.get_sprite_size('overworld', object);
            let freq_list = frequencies['area'+(meta.width * meta.height)]
            let frequency = freq_list[Math.floor(Math.random() * freq_list.length)];

            for(var i = 0; i < frequency; i++){
                var [rand_x, rand_y] = get_random_start_position(meta.width, meta.height);
                place_object(object, rand_x, rand_y, meta.width, meta.height);
            }
        });

        function place_object(object, x, y, width, height) {
            for (var i = x; i < x + width; i++) {
                for (var j = y; j < y + height; j++) {
                    if(me.terrain[i][j] !== 0) {
                        // regenerate random start and retry?
                        return;
                    }
                }
            }

            for (var i = x; i < x + width; i++) {
                for (var j = y; j < y + height; j++) {
                    me.terrain[i][j] = [object, i-x, j-y];
                }
            }
        }

        obstacles.forEach((object) => {
            const meta = this.spl.get_sprite_size('overworld', object);
            let freq_list = frequencies['area'+(meta.width * meta.height)]
            let frequency = freq_list[Math.floor(Math.random() * freq_list.length)];

            for(var i = 0; i < frequency; i++){
                var [rand_x, rand_y] = get_random_start_position(meta.width, meta.height);
                place_obstacle(object, rand_x, rand_y, meta.width, meta.height);
            }
        });

        function place_obstacle(object, x, y, width, height) {
            for (var i = x; i < x + width; i++) {
                for (var j = y; j < y + height; j++) {
                    if(me.obstacles[i][j] !== 0) {
                        // regenerate random start and retry?
                        return;
                    }
                }
            }

            for (var i = x; i < x + width; i++) {
                for (var j = y; j < y + height; j++) {
                    me.obstacles[i][j] = [object, i-x, j-y];
                }
            }
        }

        function get_random_start_position(width, height) {
            return [Math.floor(Math.random() * (me.map_width-width)),
                Math.floor(Math.random() * (me.map_height-height))]
        }
    }

    render_camera(x, y) {
        var t = [];
        var o = [];
        for (var i = x; i < x + this.camera_width; i++) {
            var row = [];
            for (var j = y; j < y + this.camera_height; j++) {
                row.push(this.terrain[i][j]);
            }
            t.push(row);
        }

        for (var i = x; i < x + this.camera_width; i++) {
            var row = [];
            for (var j = y; j < y + this.camera_height; j++) {
                row.push(this.obstacles[i][j]);
            }
            o.push(row);
        }

        for (var i = 0; i < this.camera_width; i++) {
            for (var j = 0; j < this.camera_height; j++) {
                if (t[i][j] === 0) {
                    this.spl.draw("overworld", 'grass', i, j);
                } else {
                    // this.spl.draw("overworld", t[i][j], i, j);
                    this.spl.draw_constrained("overworld", t[i][j][0], t[i][j][1], t[i][j][2], i, j);
                }
            }
        }

        for (var i = 0; i < this.camera_width; i++) {
            for (var j = 0; j < this.camera_height; j++) {
                if (o[i][j] !== 0) {
                    // this.spl.draw("overworld", o[i][j], i, j);
                    this.spl.draw_constrained("overworld", o[i][j][0], o[i][j][1], o[i][j][2], i, j);
                }
            }
        }
    }
}