/*jslint plusplus: true*/

function make_nav_items(h, n) {

    "use strict";

    var navs = d3.select("#nav_items")
        .append("svg")
        .attr("height", h * 0.8)
        .attr("width", n.offsetWidth + "px"),

        g = navs.append("g"),

        slides = 6,
        pad = h * 0.8 / (slides + 1),
        arr = [],
        pad_accum = pad,
        i;

    for (i = 0; i < slides; i++) {
        arr.push(pad_accum);
        pad_accum = pad_accum + pad;
    }

    g.selectAll(".nav-item")
        .data(arr)
        .enter()
        .append("circle")
        .attr("class", "nav-item")
        .attr("id", function (d, i) {
            return "item_" + i;
        })
        .attr("cx", n.offsetWidth / 2)
        .attr("cy", function (d) {
            return d;
        })
        .attr("r", 4);
}

make_nav_items(viewport_h, nav_items);
