var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var w = c.width;
var h = c.height;

var alphadeg = 35.264;
var betadeg = -10;

var alpha = deg2rad(alphadeg);
var beta = deg2rad(betadeg);

var cstep = 5;
var cx = 0;
var cy = 0;
var cz = 0;

var axes = {c: "black", m: [{m: [[-w/3, 0, 0], [w/3, 0, 0]]}, {m: [[0, 0, -w/3], [0, 0, w/3]]} ,{m: [[-0, -h/3, 0], [0, h/2, 0]]}]};

var objects = [box(0, 0, 0, 100, 100, 40)];

init();
function init() {
    repaint();
}

function repaint() {
    objects.forEach(function(o) {
        o.m.sort(function(a, b) {
            var a_z = mid(a.m, 2);
            var b_z = mid(b.m, 2);

            var alpha = Math.abs(alphadeg);
            var beta = Math.abs(betadeg);

            if(a_z - b_z == 0) {
                var a_y = mid(a.m, 1);
                var b_y = mid(b.m, 1);
                if(a_y == b_y) {
                    var a_x = mid(a.m, 0);
                    var b_x =  mid(b.m, 0);
                    if((betadeg < 0 && betadeg > -190)
                       || (betadeg > 180 && betadeg < 360)){
                        return b_x - a_x;
                    }
                    return a_x - b_x;
                }
                return b_y - a_y;
            }
            if((alpha < 90 || alpha > 225) && (beta < 90 || beta > 270)) {
                return a_z - b_z;
            } else {
                return b_z - a_z;
            }
        });
    });

    ctx.clearRect(0, 0, c.width, c.height);
    draw(axes, w/3, h/3, 0, 0, 0);
    objects.forEach(function(o) {
        draw(o, w/3, h/3, cx, cy, cz);
    });
    window.requestAnimationFrame(repaint);
}

function draw(object, ox, oy, cx, cy, cz) {
    object.m.forEach(function(s) {
        ctx.beginPath();
        s.m.forEach(function(p) {
            var tp = [[p[0] + cx,
                       p[1] + cy,
                       p[2] + cz]];
            var ip = isofy(tp)[0];
            var d = [ip[0] + ox, ip[1] + oy];
            ctx.lineTo(d[0], d[1]);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle=s.c || object.c;
        ctx.fill();
    });
}

document.onkeydown = function(e) {
    var c = String.fromCharCode(e.which);
    console.log(c);

    if(c == "S") {
        if(alphadeg - cstep > 0)
            alphadeg -= cstep;
    }
    else if(c == "W") {
        if(alphadeg + cstep < 90)
            alphadeg += cstep;
    }
    else if(c == "A") {
        betadeg += cstep;
    }
    else if(c == "D") {
        betadeg -= cstep;
    }
    else if(c == "Q") {
        cx -= cstep
    }
    else if(c == "E") {
        cx += cstep
    }
    else if(c == "Z") {
        cy -= cstep
    }
    else if(c == "C") {
        cy += cstep
    }

    else if(c == "F") {
        cz -= cstep
    }
    else if(c == "V") {
        cz += cstep
    }

    betadeg %= 360;
    alpha = deg2rad(alphadeg);
    beta = deg2rad(betadeg);
    console.log(alphadeg, betadeg);
};

function isofy(mp) {
    var cosa = Math.cos(alpha);
    var cosb = Math.cos(beta);
    var sina = Math.sin(alpha);
    var sinb = Math.sin(beta);

    var am = [
        [1, 0,    0],
        [0, cosa, -sina],
        [0, sina, cosa]
    ];
    var bm = [
        [cosb,  0, sinb],
        [0,     1, 0],
        [-sinb, 0, cosb]];

    var c = cm(cm(am,bm), mp);

    var im = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    var b = cm(im, c);

    return b;
}

function box(x, y, z, d, w, h0, color) {
    var h = -h0;
    var short1 = [
        [x,   y,   z],
        [x,   y+h, z],
        [x+w, y+h, z],
        [x+w, y,   z]
    ];
    var short2 = [
        [x,   y,   z+d],
        [x,   y+h, z+d],
        [x+w, y+h, z+d],
        [x+w, y,   z+d]
    ];

    var roof = [
        [x,   y+h, z],
        [x+w, y+h, z],
        [x+w, y+h, z+d],
        [x,   y+h, z+d]
    ];

    var long1 = [
        [x, y,   z],
        [x, y+h, z],
        [x, y+h, z+d],
        [x, y,   z+d]
    ];

    var long2 = [
        [x+w, y,   z],
        [x+w, y+h, z],
        [x+w, y+h, z+d],
        [x+w, y,   z+d]
    ];

    return {
        m: [
            {c: "red",   m: short1},
            {c: "blue",  m: short2},
            {c: "green", m: roof},
            {c: "grey",  m: long1},
            {c: "brown",  m: long2}
        ]};
};

function deg2rad(deg) {
    return deg*Math.PI/180;
}

function cm(a, b) {
    var c = [];
    for(var i = 0; i < b.length; i++) {
        c.push([])
    };
    for(var i = 0; i < a[0].length; i++) {
        for(var j = 0; j < b.length; j++) {
            var sum = 0;
            for(var k = 0; k < a.length; k++) {
                sum += a[k][i]*b[j][k];
            }
            c[j].push(sum);
        }
    }
    return c;
}

function mreduce(points, i, fun) {
    return points.reduce(function(acc, curr) {
        return fun(acc, curr[i]);
    }, points[0][i]);
}

function mid(points, i) {
    var min = mreduce(points, i, Math.min);
    var max = mreduce(points, i, Math.max);
    return (min+max)/2;
}
