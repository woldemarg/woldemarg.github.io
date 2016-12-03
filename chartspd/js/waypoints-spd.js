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
            disable_scroll()
        }
    };
}());

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

// точки побытий - изменения цвета и перерисовка гарфика
// при скорлле абзаца вызывается метод graph.changeClass()
// для перерисовки графика, которому передается аргумент-"фильтр"
// перерисовка графика происходит только в направлении "вниз"
var wp_OpeningComment = new Waypoint({
    element: document.getElementById('OpeningComment'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'OpeningComment', "streamGraph");
    },
    offset: "35%"
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
    },
    offset: "35%"
});

var wp_tenderAvoid = new Waypoint({
    element: document.getElementById('tenderAvoid'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'tenderAvoid', 'lastMonth');
        tenderOnce(dir);
    },
    offset: "35%"
});

var wp_familyContract = new Waypoint({
    element: document.getElementById('familyContract'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'familyContract', 'tenderAvoid');
        familyOnce(dir);
    },
    offset: "35%"
});

var wp_strongCollaboration = new Waypoint({
    element: document.getElementById('strongCollaboration'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'strongCollaboration', 'familyContract');
        strongOnce(dir);
    },
    offset: "35%"
});

var wp_strangeTransactions = new Waypoint({
    element: document.getElementById('strangeTransactions'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'strangeTransactions', 'strongCollaboration');
        strangeOnce(dir);
    },
    offset: "35%"
});

var wp_restoreNet = new Waypoint({
    element: document.getElementById('closingComment'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'closingComment', 'strangeTransactions')
    },
    offset: "35%"
});
