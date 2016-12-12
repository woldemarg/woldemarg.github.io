// переключение цвета текста в абзацах
function text_color(id, color) {
    "use strict";
    d3.select("#" + id)
        .transition()
        .duration(250)
        .style('color', color);
}

// подстветка абзацев
function switch_colors(dir, id1, id2) {
    "use strict";
    if (dir === "down") {
        text_color(id1, '#444');
        text_color(id2, "#ddd");
    } else {
        text_color(id1, "#ddd");
        text_color(id2, "#444");
    }
}

function label_color(id, colorT, colorB) {
    "use strict";
    d3.select("#" + id)
    .transition()
    .duration(250)
    .style('color', colorT)
    .style("background-color", colorB);
    
}

function showExamples(dir, el1, el2) {
    "use strict";    
    if (dir === "down") {
        label_color(el1, '#fff', "#777");
        label_color(el2, "#eee", "#ddd");
        //d3.select(el1).classed("nonvisible", false).classed("visible", true);
        //d3.select(el2).classed("hidden", true);
    } else {
        label_color(el1, "#ddd", "#eee");
        label_color(el2, '#fff', "#777");
       // d3.select(el1).classed("hidden", true)
        // d3.select(el2).classed("hidden", false);
    }
}

if ($(window)
        .width() >= 992) {

    // пример работы waypoint.js - тут http://texty.org.ua/d/imf/
    // функции единоразового выполнения
    // http://stackoverflow.com/questions/12713564/function-in-javascript-that-can-be-called-only-once
    // извне нельзя изменить флаг executed
    var transformOnce = (function (dir) {
        "use strict";
        var executed = false;
        return function (dir) {
            if (!executed && dir === "down") {
                executed = true;
                chart.area();
                chart.dots();
            }
        };
    }());

    var lastOnce = (function (dir) {
        "use strict";
        var executed = false;
        return function (dir) {
            if (!executed && dir === "down") {
                executed = true;
                chart.stepByStep("last");
                chart.highlightDots("last");
            }
        };
    }());

    var tenderOnce = (function (dir) {
        "use strict";
        var executed = false;
        return function (dir) {
            if (!executed && dir === "down") {
                executed = true;
                chart.stepByStep("tender");
                chart.highlightDots("tender");
            }
        };
    }());

    var familyOnce = (function (dir) {
        "use strict";
        var executed = false;
        return function (dir) {
            if (!executed && dir === "down") {
                executed = true;
                chart.stepByStep("family");
                chart.highlightDots("family");
            }
        };
    }());

    var strongOnce = (function (dir) {
        "use strict";
        var executed = false;
        return function (dir) {
            if (!executed && dir === "down") {
                executed = true;
                chart.stepByStep("strong");
                chart.highlightDots("strong");
            }
        };
    }());

    var strangeOnce = (function (dir) {
        "use strict";
        var executed = false;
        return function (dir) {
            if (!executed && dir === "down") {
                executed = true;
                chart.stepByStep("strange");
                chart.highlightDots("strange");
            }
        };
    }());

    var noScrollingOnce = (function (dir) {
        "use strict";
        var executed = false;
        return function (dir) {
            if (!executed && dir === "down") {
                executed = true;
                disable_scroll();
            }
        };
    }());
    
    // точки побытий - изменения цвета и перерисовка гарфика
    // при скорлле абзаца вызывается метод graph.changeClass()
    // для перерисовки графика, которому передается аргумент-"фильтр"
    // перерисовка графика происходит только в направлении "вниз"
    var wp_OpeningComment = new Waypoint({
        element: document.getElementById('openingComment'),
        handler: function (dir) {
            "use strict";
            switch_colors(dir, 'OpeningComment', "streamGraph");
        },
        offset: "35%"
    });
    
     var wp_keepScrolling = new Waypoint({
        element: document.getElementById('keepScrolling'),
        handler: function (dir) {
            "use strict";
            switch_colors(dir, 'keepScrolling', "openingComment");            
        },
        offset: "50%"
    });

    var wp_streamGraph = new Waypoint({
        element: document.getElementById('streamGraph'),
        handler: function (dir) {
            "use strict";
            switch_colors(dir, 'streamGraph', "OpenningComment");
            noScrollingOnce(dir);
            transformOnce(dir);
        },
        offset: "35%"
    });

    var wp_lastMonth = new Waypoint({
        element: document.getElementById('lastMonth'),
        handler: function (dir) {
            "use strict";
            switch_colors(dir, 'lastMonth', 'streamGraph');
            lastOnce(dir);
            showExamples(dir, "last");
        },
        offset: "35%"
    });

    var wp_tenderAvoid = new Waypoint({
        element: document.getElementById('tenderAvoid'),
        handler: function (dir) {
            "use strict";
            switch_colors(dir, 'tenderAvoid', 'lastMonth');
            tenderOnce(dir);
            showExamples(dir, "tender", "last");
        },
        offset: "35%"
    });

    var wp_familyContract = new Waypoint({
        element: document.getElementById('familyContract'),
        handler: function (dir) {
            "use strict";
            switch_colors(dir, 'familyContract', 'tenderAvoid');
            familyOnce(dir);
            showExamples(dir, "family", "tender");
        },
        offset: "35%"
    });

    var wp_strongCollaboration = new Waypoint({
        element: document.getElementById('strongCollaboration'),
        handler: function (dir) {
            "use strict";
            switch_colors(dir, 'strongCollaboration', 'familyContract');
            strongOnce(dir);
            showExamples(dir, "strong", "family");
        },
        offset: "35%"
    });

    var wp_strangeTransactions = new Waypoint({
        element: document.getElementById('strangeTransactions'),
        handler: function (dir) {
            "use strict";
            switch_colors(dir, 'strangeTransactions', 'strongCollaboration');
            strangeOnce(dir);
            showExamples(dir, "strange", "strong");
        },
        offset: "35%"
    });

    var wp_restoreNet = new Waypoint({
        element: document.getElementById('closingComment'),
        handler: function (dir) {
            "use strict";
            switch_colors(dir, 'closingComment', 'strangeTransactions');
            showExamples(dir, null, "strange");
        },
        offset: "35%"
    });
    
    var wp_keepScrolling2 = new Waypoint({
        element: document.getElementById('keepScrolling2'),
        handler: function (dir) {
            "use strict";
            switch_colors(dir, 'keepScrolling2', "closingComment");            
        },
        offset: "50%"
    });

} else {

    d3.selectAll("div")
        .classed("chapter", false);

    d3.select("#keepScrolling")
        .remove();

    d3.select("#keepScrolling2")
        .remove();
    
    d3.select("#chartTitle")
        .remove();
    
    d3.select("#last").classed("myLabel", false).classed("label-default", true);
    d3.select("#tender").classed("myLabel", false).classed("label-default", true);
    d3.select("#family").classed("myLabel", false).classed("label-default", true);
    d3.select("#strong").classed("myLabel", false).classed("label-default", true);
    d3.select("#strange").classed("myLabel", false).classed("label-default", true);    
}