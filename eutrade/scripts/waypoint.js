// animated logo
$(window).scroll(function () {
    "use strict";
    $("#logo_pic").fadeOut("slow");
    if ($(window).scrollTop() === 0) {
        $("#logo_pic").css("display", "block");
    }
});


// make text blocks of equal height
$(window).on("load resize", function () {
    "use strict";
    var height_add = $(".block_left").outerHeight(true) - $(".block_right").outerHeight(true);
    $("#last_paragraph").css("padding-bottom", height_add);
});


// show countries' list on scroll
$("#my_scatterplot").waypoint({
    handler: function (dir) {
        "use strict";
        if (dir === "down") {
            $(".panel").slideDown(1500);
            $("#prompt").animate({
                opacity: 1
            }, 1500);

        } else {
            $(".panel").slideUp(1500);
            $("#prompt").animate({
                opacity: 0
            }, 1500);
        }
    },
    offset: "55%"
});


// calculate font-size and line-height for countries' list 
function to_rem(d) {
    "use strict";
    return d + "rem";
}


var panel_max_height = $("#my_scatterplot").width() + $(".chart_info").height(),

    line_max_height = panel_max_height / d3.select(".panel").selectAll("li").size(),

    base_font = parseInt($("html").css("font-size"), 0),

    panel_line = line_max_height / base_font,

    panel_font = panel_line * 0.65;


$(".panel li").css({
    "font-size": to_rem(panel_font),
    "heigh": to_rem(panel_line)
});