/*jslint plusplus: true */
// логика работы:
// 1. т.к. обработка данных занимает ок. 15 сек., то сначала отключаем
// скролл страницы и ставим спиннер, которые отключаются перед созданием
// графика в setupData()
// 2. setupData() обрабатывает входящую таблицу, создает БД с точками и // связями между ними и вызывает update()
// 3. построение графика и его перерисовка происходят в update()
// 4. в update() также задаются параметры force
// 5. filterNet() удалет СПД с общей суммой менее 50 тыс., их связи с точками предприятиями,
// а также предприятия, у которых в результате фильтрации удалены все СПД-контрагенты,
// и их пустые связи


// отключаем скролл
$('html, body')
        .css({
        'overflow': 'hidden'
    });

// force page scroll to top at refresh
window.onbeforeunload = function () {
    "use strict";
    window.scrollTo(0, 0);
}

var graph,    
    
    // default параметры для спиннера
    opts = {
        lines: 13, // The number of lines to draw
        length: 28, // The length of each line
        width: 14, // The line thickness
        radius: 42, // The radius of the inner circle
        scale: 1, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        color: '#000', // #rgb or #rrggbb or array of colors
        opacity: 0.25, // Opacity of the lines
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        className: 'spinner', // The CSS class to assign to the spinner
        top: '50%', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        position: 'absolute' // Element positioning
    },

    target = document.getElementById('page'),
    
    // вызов спиннера
    spinner = new Spinner(opts)
        .spin(target);
    
    
function MyNet(el) {

    "use strict";

    // ширина и высота графика привязаны к сетке bootstrap
    var w = document.getElementById("chart2")
        .offsetWidth,
        h = w,
        radius = 6,

        linksRemoved,
        nodesRemoved,
        
        isFilterOn,
        
        // инициализация тултипа
        tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>node-id:</strong> <span style='color:red'>" + d.id + "</span>";
            }),
        
        vis = d3.select(el)
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "svg")
        .attr("pointer-events", "all")
        .append('svg:g')
        // вызов тултипов на графике
        .call(tip),

        force = d3.layout.force(),

        nodes = force.nodes(),
        links = force.links();
    
    function findNode(id) {

        for (var i in nodes) {
            if (nodes[i].id === id) {
                return nodes[i];
            }
        }
    }
    
    function findNodeIndex(id) {

        var i;

        for (i = 0; i < nodes.length; i++) {
            if (nodes[i].id === id) {
                return i;
            }
        }
    }

    function removeDupls(arr) {
        return arr.filter(function (item, pos) {
            return arr.indexOf(item) === pos;
        });
    }

    function arrDiff(a, b) {

        return a.filter(function (x) {
            return b.indexOf(x) > -1;
        });
    }

    // создание графика 
    function update() {

        var link = vis.selectAll("line")
            .data(links, function (d) {
                return d.source.id + "-" + d.target.id;
            }),

            node = vis.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id;
            }),

            nodeEnter = node.enter()
            .append("g")
            .attr("class", "node")
            // первоначальная позиция точек определяется случайно
            // в пределах контейнера для графика,
            // чтобы сократить время на его прорисовку
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })
            // перетаскивание точек
            //.call(force.drag);        
            

        link.enter()
            // insert() вместо append() обеспечивает вставку линий за точками
            // при возврате из фильтра (при вставке ранее удаленных точек и связей)
            // разъяснения и пример в комментариях - см. здесь
            // http://stackoverflow.com/questions/19868645/d3-force-graph-rendering-nodes-and-links
            .insert("line", ":first-child")
            .attr("class", "link")
            // частота операций (количество) определяют ширину линии на графике
            .attr("stroke-width", function (d) {
                return Math.sqrt(d.count);
            });         

        // удаление отсутствующих связей при фильрации графика
        link.exit()
            .remove();        

        nodeEnter.append("svg:circle")
            .attr("r", radius)
            // предприятие или спд
            .attr("class", function (d) {
                return "node" + "-" + d.category;
            })
            // по id определяется, какие из точек подсвечивать в changeClass()
            .attr("id", function (d) {
                return d.mistrust;
            })
            // вызов тултипов
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);                

        // удаление отсутствующих точек при фильрации графика
        node.exit()
            .remove();

        // перетаскивание точек органичено пределами контейнера
        // [radius, width - radius] for x, [radius, height - radius] for y
        // http://bl.ocks.org/mbostock/1129492
        force.on("tick", function () {

            node.attr("transform", function (d) {
                return "translate(" + Math.max(radius, Math.min(w - radius, d.x)) + "," + Math.max(radius, Math.min(h - radius, d.y)) + ")";
            });

            link.attr("x1", function (d) {
                return Math.max(radius, Math.min(w - radius, d.source.x));
            })
                .attr("y1", function (d) {
                    return Math.max(radius, Math.min(h - radius, d.source.y));
                })
                .attr("x2", function (d) {
                    return Math.max(radius, Math.min(w - radius, d.target.x));
                })
                .attr("y2", function (d) {
                    return Math.max(radius, Math.min(h - radius, d.target.y));
                });
        });

        // Restart the force layout
        force.gravity(0.05)
            .linkDistance(function () {
                if (isFilterOn) {
                    return 35;
                } else {
                    return 27;
                }
            })
            .charge(function () {
                if (isFilterOn) {
                    return -15;
                } else {
                    return -8;
                }
            })
            .size([w, h])
            .start();
    }

    // подготовка данных для построения графики
    // отдельно создается файл с описанием точек и отдельно со связями мжду ними
    // случайным образом всем точкам присваиваются первоначальные
    // координаты в пределах контейнера для графики 
    this.setupData = function (data) {
        
        var newEdrpou,
            newSpd,
            newLink,
            ids = [],
            uniqueLinks = [],
            j,
            i,
            currentLink = null,
            cntLink = 0;

        // наполнение БД с точками
        data.forEach(function (d) {
            newEdrpou = d.payer_edrpou;
            newSpd = d.spd_id;
            // создание промежуточного массива с уникальными объектами
            for (j = 0; j < nodes.length; j++) {
                ids.push(nodes[j].id);
            }
            // проверка текущего элемента входного массива (объекта) на наличие
            // во вспомогательном массиве уникальных элементов ids;
            // если там нет текущего элемента - добавляем в БД точек,
            // из которой этот же элемент на следующей итерации переходит
            // в массив уникальных элементов и происходит новое сравнение
            if (ids.indexOf(newEdrpou) === -1) {
                nodes.push({
                    id: newEdrpou,
                    category: "dp",
                    total: +d.dp_total,
                    mistrust: d.mistrust
                });
            }
            // ДП и СПД вставляются в одну БД, но различаются по категориям
            // и по наполнению данными
            if (ids.indexOf(newSpd) === -1) {
                nodes.push({
                    id: newSpd,
                    category: "spd",
                    label: d.spd_label,
                    total: +d.spd_total,
                    mistrust: d.mistrust
                });
            }
        });

        // случайные координаты точек в предалах области графика
        // позволяют ускорить отрисовку графика
        // https://flowingdata.com/2012/08/02/how-to-make-an-interactive-network-visualization/
        nodes.forEach(function (n) {
            n.x = Math.floor(Math.random() * w);
            n.y = Math.floor(Math.random() * h);
        });

        // выборка уникальных связей и подсчет их количества
        // для каждой пары ДП-СПД
        // пример - http://stackoverflow.com/questions/19395257/how-to-count-duplicate-value-in-an-array-in-javascript
        for (i = 0; i < data.length; i++) {
            newLink = {
                source: data[i].payer_edrpou,
                target: data[i].spd_id
            };

            // простейший способ сравнение 2х объектов
            // разъяснения здесь - http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
            // еще один оригинальный способ с помощью рекурсии - http://eloquentjavascript.net/code/#4.4, но он здесь не применяется
            if (JSON.stringify(newLink) !== JSON.stringify(currentLink)) {
                if (cntLink > 0) {
                    // добавление к объекту (уникальноя связки ДП-СПД) нового свойства 
                    // - значения счетчика количества ее повторений
                    // (т.е. количества транзакций в исходной БД)
                    //для задания толщины линий связи 
                    currentLink.count = cntLink;
                    uniqueLinks.push(currentLink);
                }
                currentLink = {
                    source: data[i].payer_edrpou,
                    target: data[i].spd_id
                };
                cntLink = 1;
            } else {
                cntLink++;
            }
        }
        if (cntLink > 0) {
            currentLink.count = cntLink;
            uniqueLinks.push(currentLink);
        }

        // передаем в links в качестве source и target не просто id точек
        // а объекты, их описывающие, со всеми входящими в них данными
        uniqueLinks.forEach(function (l) {
            links.push({
                source: findNode(l.source),
                target: findNode(l.target),
                count: l.count
            });
        });

        // после наполнения nodes и links отображаем страницу 
        // удаляем спиннер
        $(".spinner").remove();

        // включаем скролл страницы
        $('html, body')
            .css({
                'overflow': 'auto'
            });
        
        // первый вызов функмм для отрисовки графика
        update();
    };

    this.filterNet = function () {

        var i,
            j,
            k,

            dps = [],
            sources = [],
            uniqueSources,
            dpsToRemove;

        // обнуление массива удаленных элементов
        // для нормальной работы вкл./выкл. фильтра  
        nodesRemoved = [];
        linksRemoved = [];

        // при удалении точек из БД ее длина уменьшается
        // и изменяются относительные позиции точек в массиве,
        // поэтому нужно итерировать в обратном порядке
        i = nodes.length;
        while (i--) {
            if (nodes[i].category === "spd" && nodes[i].total <= 50000) {

                j = links.length;
                while (j--) {

                    if (links[j].target.id === nodes[i].id) {
                        linksRemoved.push(links[j]);
                        links.splice(j, 1);
                    }
                }
                // удаленные точки сохраняем в отдельный массив
                // для последующего восстановления
                nodesRemoved.push(nodes[i]);
                // удаление точки
                nodes.splice(i, 1);
            }
        }

        // создаем массив точек-предприятий 
        nodes.forEach(function (d) {
            if (d.category === "dp") {
                dps.push(d.id);
            }
        });

        // массив связей "от предприятия"
        links.forEach(function (d) {
            sources.push(d.source.id);
        });

        // из массива связей выбираем уникальные предприятия,
        // от которых идут связи к СПД, оставшимся после фильтрации  
        uniqueSources = removeDupls(sources);

        // из массива всех предприятий вычитаем массив предприятий со связями,
        // т.к. остются только предприятия - "пустые точки"
        dpsToRemove = arrDiff(dps, uniqueSources);

        // удаляем из массива точек "пустые" предприятия
        k = nodes.length;
        while (k--) {

            if (nodes[k].category === "dp" && dpsToRemove.indexOf(nodes[k].id) === -1) {
                nodesRemoved.push(nodes[k]);
                nodes.splice(k, 1);
            }
        }

        //параметр, который задает новые настройки для force
        isFilterOn = true;

        update();
    };

    this.restoreNet = function () {

        // слияние двух массивов в один без cоздания нового массива,
        // т.е. присоединяем удаленные ранее при фильтрации элементы
        // к оставшимся в обоих массивах
        // http://stackoverflow.com/questions/1374126/how-to-extend-an-existing-javascript-array-with-another-array-without-creating
        links.push.apply(links, linksRemoved);

        nodes.push.apply(nodes, nodesRemoved);

        // возвращаем настройкм графика
        isFilterOn = false;

        update();

    };

    this.changeClass = function (name) {
        
        // выбираем только точки-СПД по свойству mistrust
        // свойство mistrust определяет id для класса node-spd 
        // http://stackoverflow.com/questions/30066259/d3-js-changing-opacity-of-element-on-mouseover-if-condition-false
        // http://jaketrent.com/post/d3-class-operations/
        d3.selectAll("#" + name + ".node-spd")
            .classed("node-spd", false) // удаляем класс по умолчанию
            .transition()
            .duration(1000)
            .each("start", function () {
                d3.select(this)
                    .attr("fill", "#CC6633") // цвет перехода
                    // пропорциональное увеличение размера и обводки                    
                    .attr("r", radius * 1.3)
                    .attr("stroke-width", 1.95);
            })
            .each("end", function () {
                d3.select(this)
                    .transition()
                    .duration(1500)
                    // новый класс точки, который остается после перерисовки графика
                    .attr("class", "picked")
                    .attr("r", radius)
                    .attr("stroke-width", 1.5);
            });

        update();
    };
}

// функция MyNet является замыканием
// общий принцип работы функции - вот здесь https://flowingdata.com/2012/08/02/how-to-make-an-interactive-network-visualization/
// работающий пример графика с свойствами добавления и удаления точек и связей здесь
// //stackoverflow.com/questions/11400241/updating-links-on-a-force-directed-graph-from-dynamic-json-data
function drawNet() {

    "use strict";

    graph = new MyNet("#netGraph");

    return d3.csv("data.csv", function (csv) {
        return graph.setupData(csv);
    });
}

// фиксируем контейнер для графика при скролле
function setLayout() {
    
    "use strict";
   

    // динамический расчет высоты для последнего элемента div,
    // считаем сколько полных высот контейнера для графика
    // помещается в одной высоте блока комментариев
    // и добавлем эту разницу к блоку комментариев
    var addedHeight = (Math.ceil($("#chart2_comments")
                .outerHeight() / $("#chart2")
                .outerHeight()) * $("#chart2")
            .outerHeight()) - $("#chart2_comments")
            .outerHeight(),
        
        // растояние от верхней границы окна
        // до верхней границы контейнера для графика 
        afTop = $("#chart2")
            .offset()
            .top,

        // расстояние от нижней границы элемента до конца документа
        // http://stackoverflow.com/questions/7656118/i-need-to-find-the-distance-between-the-element-and-the-bottom-of-the-browser-wi
        afBottom = $(document)
            .height() - $("#chart2_comments")
            .offset()
            .top - $("#chart2_comments")
            .outerHeight(),
        
        // добавляем к блоку комментарием разницу высоты
        adjustedDiv = document.getElementById("keepScrolling2");
    
    adjustedDiv.style.height = addedHeight + "px";

   

    // фиксация элемента при прокрутке с помощью affix.js
    // также нужны дополнительные классы в css
    // http://www.w3schools.com/bootstrap/bootstrap_ref_js_affix.asp
    $("#chart2")
        .affix({
            offset: {
                top: afTop,
                bottom: afBottom
            }
        });

}

// да будет network directed-firce graph!!!
drawNet();

setLayout();