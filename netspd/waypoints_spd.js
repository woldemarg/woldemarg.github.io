// пример работы waypoint.js - тут http://texty.org.ua/d/imf/
var offset_keepScrolling,
    offset_lastMonth,
    offset_tenderAvoid,
    offset_familyContract,
    offset_strongCollaboration,
    offset_strangeTransactions,
    offset_netRestore,
    
    // функции единоразового выполнения
    // http://stackoverflow.com/questions/12713564/function-in-javascript-that-can-be-called-only-once
    // извне нельзя изменить флаг executed
    filterOnce = (function (dir) {
        "use strict";
        var executed = false;
        return function (dir) {
            if (!executed && dir === "down") {
                executed = true;
                graph.filterNet();
            }
        };
    })(),

    restoreOnce = (function (dir) {
        "use strict";
        var executed = false;
        return function (dir) {
            if (!executed && dir === "down") {
                executed = true;
                graph.restoreNet();
            }
        };
    })();


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

// расчет расстояния до точки смены цвета
// середина абзаца напртив середины гарфика
function wp_offset(div) {

    "use strict";

    return ($("#chart2")
        .outerHeight() / 2) + 30 - ($(div)
        .outerHeight() / 2);
}

// расстояния до точек переключения цвета для каждого абзаца комментариев
offset_keepScrolling = wp_offset("#keepScrolling");
offset_lastMonth = wp_offset("#lastMonth");
offset_tenderAvoid = wp_offset("#tenderAvoid");
offset_familyContract = wp_offset("#familyContract");
offset_strongCollaboration = wp_offset("#strongCollaboration");
offset_strangeTransactions = wp_offset("#strangeTransactions");
offset_netRestore = wp_offset("#netRestore");



// точки побытий - изменения цвета и перерисовка гарфика
// при скорлле абзаца вызывается метод graph.changeClass()
// для перерисовки графика, которому передается аргумент-"фильтр"
// перерисовка графика происходит только в направлении "вниз"
var wp_filterNet = new Waypoint({
    element: document.getElementById('netFilter'),
    handler: function (dir) {
        "use strict";
        return filterOnce(dir);
    },
    offset: 30 // отступ контейнера с графиком, заданный в css 
});

var wp_keepScrolling = new Waypoint({
    element: document.getElementById('keepScrolling'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'keepScrolling', 'filterNet');
    },
    offset: offset_keepScrolling
});

var wp_lastMonth = new Waypoint({
    element: document.getElementById('lastMonth'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'lastMonth', 'keepScrolling');
        if (dir === "down") {
            graph.changeClass("lm");
        }
    },
    offset: offset_lastMonth
});

var wp_tenderAvoid = new Waypoint({
    element: document.getElementById('tenderAvoid'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'tenderAvoid', 'lastMonth');
        if (dir === "down") {
            graph.changeClass("ta");
        }
    },
    offset: offset_tenderAvoid
});

var wp_familyContract = new Waypoint({
    element: document.getElementById('familyContract'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'familyContract', 'tenderAvoid');
        if (dir === "down") {
            graph.changeClass("fc");
        }
    },
    offset: offset_familyContract
});

var wp_strongCollaboration = new Waypoint({
    element: document.getElementById('strongCollaboration'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'strongCollaboration', 'familyContract');
        if (dir === "down") {
            graph.changeClass("sc");
        }
    },
    offset: offset_strongCollaboration
});

var wp_strangeTransactions = new Waypoint({
    element: document.getElementById('strangeTransactions'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'strangeTransactions', 'strongCollaboration');
        if (dir === "down") {
            graph.changeClass("st");
        }
    },
    offset: offset_strangeTransactions
});

var wp_restoreNet = new Waypoint({
    element: document.getElementById('netRestore'),
    handler: function (dir) {
        "use strict";
        switch_colors(dir, 'netRestore', 'strangeTransactions');
        return restoreOnce(dir);
    },
    offset: offset_netRestore
});