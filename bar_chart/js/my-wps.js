var alreadyIsActive;

// переключение цвета текста в абзацах
function text_color(id, color) {
    "use strict";
    d3.select("#" + id)
        .transition()
        .duration(250)
        .style("color", color);
}

// подстветка абзацев
function switch_colors(dir, id1, id2) {
    "use strict";
    if (dir === "down") {
        text_color(id1, "#555");
        text_color(id2, "#ddd");
    } else {
        text_color(id1, "#ddd");
        text_color(id2, "#555");
    }
}

function make_active(dir, id1, id2) {
    "use strict";
    if (dir === "down") {
        alreadyIsActive = d3.select("#" + id1).classed("active");
        d3.selectAll(".nav-item")
            .classed("active", false);
        d3.select("#" + id1).classed("active", !alreadyIsActive);
    } else {
        alreadyIsActive = d3.select("#" + id2).classed("active");
        d3.selectAll(".nav-item")
            .classed("active", false);
        d3.select("#" + id2).classed("active", !alreadyIsActive);
    }
}

var wp_0 = $("#slide_0").waypoint({
    handler: function (dir) {
        "use strict";
        switch_colors(dir, "slide_0", null);
        make_active(dir, "item_0", null);
        $("#t_0").addClass("show");
        $("#t_01").addClass("show");
    },
    offset: "50%"
});

var $wp_1 = $("#slide_1").waypoint({
    handler: function (dir) {
        "use strict";
        switch_colors(dir, "slide_1", "slide_0");
        if (dir === "down") {
            $("#t_01").removeClass("show");
            $("#t_02").addClass("show");
            add_bars("loc");
        } else if (dir === "up") {
            $("#t_02").removeClass("show");
            $("#t_01").addClass("show");
            remove_bars("loc");
        }
        make_active(dir, "item_1", "item_0");
    },
    offset: "50%"
});

var wp_2 = $("#slide_2").waypoint({
    handler: function (dir) {
        "use strict";
        switch_colors(dir, "slide_2", "slide_1");
        if (dir === "down") {
            $("#t_0").removeClass("show");
            $("#t_02").removeClass("show");
            $("#t_2").addClass("show");
            $("#t_21").addClass("show");
            remove_bars("loc");
            remove_bars("sum");
            setTimeout(function () {
                update_yAxis("prc");
                add_bars("prc");
            }, time);
        } else if (dir === "up") {
            $("#t_2").removeClass("show");
            $("#t_21").removeClass("show");
            $("#t_0").addClass("show");
            $("#t_02").addClass("show");
            remove_bars("prc");
            setTimeout(function () {
                update_yAxis("sum");
                add_bars("sum");
                add_bars("loc");
            }, time);
        }
        make_active(dir, "item_2", "item_1");
    },
    offset: "50%"
});

var wp_3 = $("#slide_3").waypoint({
    handler: function (dir) {
        "use strict";
        switch_colors(dir, "slide_3", "slide_2");
        if (dir === "down") {
            $("#t_21").removeClass("show");
            $("#t_22").addClass("show");
            add_bars("dead");
        } else if (dir === "up") {
            $("#t_22").removeClass("show");
            $("#t_21").addClass("show");
            remove_bars("dead");
        }
        make_active(dir, "item_3", "item_2");
    },
    offset: "50%"
});

var wp_4 = $("#slide_4").waypoint({
    handler: function (dir) {
        "use strict";
        switch_colors(dir, "slide_4", "slide_3");
        if (dir === "down") {
            $("#t_2").removeClass("show");
            $("#t_22").removeClass("show");
            $("#t_3").addClass("show");
            $("#t_31").addClass("show");
            add_lines();
        } else if (dir === "up") {
            $("#t_3").removeClass("show");
            $("#t_31").removeClass("show");
            $("#t_2").addClass("show");
            $("#t_22").addClass("show");
            remove_lines();
        }
        make_active(dir, "item_4", "item_3");
    },
    offset: "50%"
});

var wp_5 = $("#slide_5").waypoint({
    handler: function (dir) {
        "use strict";
        switch_colors(dir, "slide_5", "slide_4");
        if (dir === "down") {
            $("#t_3").removeClass("show");
            $("#t_31").removeClass("show");
            $("#t_4").addClass("show");
            $("#t_41").addClass("show");
            remove_lines();
            remove_bars("dead");
            remove_bars("prc");
            setTimeout(function () {
                update_yAxis("index");
                add_bars("index");
            }, time);
        } else if (dir === "up") {
            $("#t_4").removeClass("show");
            $("#t_41").removeClass("show");
            $("#t_3").addClass("show");
            $("#t_31").addClass("show");
            remove_bars("index");
            setTimeout(function () {
                update_yAxis("prc");
                add_bars("prc");
                add_bars("dead");
                add_lines();
            }, time);
        }
        make_active(dir, "item_5", "item_4");
    },
    offset: "50%"
});
