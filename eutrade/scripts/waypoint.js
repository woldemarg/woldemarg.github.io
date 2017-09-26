$("#intro_text").css("margin-top", $("#my_title").outerHeight() - $("#intro_text").outerHeight())

console.log($("#my_title").outerHeight())

$("#my_scatterplot").waypoint({
    handler: function (dir) {
        "use strict";
        if (dir === "down") {
            $(".panel").slideDown(1500);
            /*$(".subtitle.mid").css({
                "-webkit-clip-path": "polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)",
                "clip-path": "polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)",
                "transition": "all 1.5s ease"
            });*/
        } else {
            $(".panel").slideUp(1500);
            /* $(".subtitle.mid").css({
                 "-webkit-clip-path": "polygon(0 0, 100% 0, 100% 100%, 50% 100%, 0 100%)",
                 "clip-path": "polygon(0 0, 100% 0, 100% 100%, 50% 100%, 0 100%)",
                 "transition": "all 1.5s ease"
             });*/
        }
    },
    offset: "55%"
});

function to_rem(d) {
    "use strict";
    return d + "rem";
}

var menu = $(".subtitle.mid"),

    panel_max_height = $(".chart_info").outerHeight() + $("#my_scatterplot").width(),

    line_max_height = panel_max_height / d3.select(".panel").selectAll("li").size(),

    base_font = parseInt($("html").css("font-size"), 0),

    panel_line = line_max_height / base_font,

    panel_font = panel_line * 0.65;



$(".panel li").css({
    "font-size": to_rem(panel_font),
    "heigh": to_rem(panel_line)
});


/*d3.csv("data/exim_absolute.csv", function (error, data) {

        if (error) {
            throw error;
        }

        data.forEach(function (d) {
            d.exp = +d.exp;
            d.imp = +d.imp;
            
        });
    
    var countries = d3.nest()
            .key(function (d) {
                return d.partner;
            })
            .entries(data)
    
    countries.forEach(function (country) {
        country.turnover = country.values[1].exp + country.values[1].imp
    })
    
    countries.sort(function (a, b) {
                    return d3.descending(a.turnover, b.turnover);
                })
    
    var list = d3.select("#panel")
    
    list.selectAll("span")
    .data(countries)
        .enter()
    .append("span")
    .attr("onmouseover", "export_stepchart.show_bars(this)")
        //.on("mouseover", exim_scatterplot.show_tips(this))
    .attr("onmouseout","export_stepchart.hide_bars(); exim_scatterplot.hide_tips()")
    .text(function (d) {return d.key})
    
    
    console.log(countries)
})*/
