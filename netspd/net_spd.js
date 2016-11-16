/*jslint plusplus: true */
var graph;

function MyGraph(el) {

    "use strict";

    var w = 650,
        h = 650,
        radius = 6,
        
        linksRemoved,
        nodesRemoved,
        isFilterOn,
        
       // color = d3.scale.category10(),

        vis = d3.select(el)
                .append("svg:svg")
                .attr("width", w)
                .attr("height", h)
                .attr("id", "svg")
                .attr("pointer-events", "all")
                .attr("viewBox", "0 0 " + w + " " + h)
                .attr("perserveAspectRatio", "xMinYMid")
                .append('svg:g'),

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

    function update() {
        
       
        
        console.log(nodes);
        console.log(links);        

        var link = vis.selectAll("line")
            .data(links, function (d) {
                return d.source.id + "-" + d.target.id;
            });

        link.enter()
            // insert() обеспечивает вставку линий за точками
            // при возврате из фильтра (при вставке ранее удаленных точек и связей)
            // http://stackoverflow.com/questions/19868645/d3-force-graph-rendering-nodes-and-links
            .insert("line", ":first-child")
            /*.attr("id", function (d) {
                return d.source.id + "-" + d.target.id;
            })*/
            .attr("class", "link")
            .attr("stroke-width", function (d) {
                return Math.sqrt(d.count);
            });;
        
       
        link.exit()
            .remove();

        var node = vis.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id;
            });

        var nodeEnter = node.enter()
            .append("g")
            .attr("class", "node")
         .attr("cx", function(d) {
      return d.x;
    })
        .attr("cy", function(d) {
      return d.y;
    })
            .call(force.drag);;
            

        nodeEnter.append("svg:circle")
            .attr("r", radius)
            /*.attr("fill", function(d) {
            return color(d.category);
        })*/
            .attr("class", function(d) {
                return "node" + "-" + d.category;
            })
        .attr("id", function(d) {
            return d.mistrust;
        } )     
        
            

        node.exit()
            .remove();
        

        
        // перемещение точек органичено пределами контейнера
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
        
        
        // Restart the force layout.
        force.gravity(0.05)
             .linkDistance( function() {
            if (isFilterOn) {
                return 30;
            } else {
                return 25;
            }
        })
             .charge( function() {
            if (isFilterOn) {
                return -11;
            } else {
                return -8;
            }
        })
             .size([w, h])
             .start();
    }

    this.setupData = function (data) {

        // подготовка данных для построения графики
        // структура данных для force_layout
        // в соответствии с примером https://bl.ocks.org/mbostock/4062045
        var newEdrpou,
            newSpd,
            newLink,
            ids = [],
            uniqueLinks = [],
            j,
            i,
            currentLink = null,
            cntLink = 0;

        // наполнение dataJSON
        data.forEach(function (d) {
            newEdrpou = d.payer_edrpou;
            newSpd = d.spd_id;
            // создание промежуточного массива с уникальными объектами
            // из dataJSON
            for (j = 0; j < nodes.length; j++) {
                ids.push(nodes[j].id);
            }
            // проверка текущего элемента входного массива (объекта) на наличие
            // во вспомогательном массиве уникальных элементов
            // если там нет текущего элемента - добавляем в dataJSON,
            // из уоторого этот же элемент на следующей итерации переходит
            // в массив уникальных элементов и происходит новое сравнение
            if (ids.indexOf(newEdrpou) === -1) {
                nodes.push({
                    id: newEdrpou,
                    category: "dp",
                    total: +d.dp_total,
                    mistrust: d.mistrust
                });
            }
            // ДП и СПД всnавляются в один и тот же объект dataJSON.nodes,
            // но каждая категория - со своими свойствами
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
        // доля ускорения создания графика
        // https://flowingdata.com/2012/08/02/how-to-make-an-interactive-network-visualization/
        nodes.forEach(function(n) {  
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
            // разъяснения - http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
            // еще один оригинальный способ с помощью рекурсии - http://eloquentjavascript.net/code/#4.4
            if (JSON.stringify(newLink) !== JSON.stringify(currentLink)) {
                if (cntLink > 0) {
                    // добавление к объекту (уникальноя связки ДП-СПД) нового свойства - 
                    // значения счетчика количества ее повторений (т.е. количества трансакция
                    // в исходной БД) для задания толщины линий связи 
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

        uniqueLinks.forEach(function (l) {
            links.push({
                source: findNode(l.source),
                target: findNode(l.target),
                count: l.count
            });
        });

        update();
    };

    // Add and remove elements on the graph object
    this.addNode = function (id) {
        nodes.push({
            "id": id
        });

        update();
    };
    
    function removeDupls(arr) {
            return arr.filter(function(item, pos) {
    return arr.indexOf(item) == pos;
})
        }
    
    function arrDiff(a, b) {
            
            return a.filter(function(x) { return b.indexOf(x) > -1 })
        }
    
    this.filterNet = function() {
        
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
    
        i = nodes.length;
        while (i--) {
                if (nodes[i].category === "spd" && nodes[i].total <= 50000) {                                        
                   
                    j = links.length;
                    while (j--){
                         
                            if (links[j].target.id === nodes[i].id) {                                
                                linksRemoved.push(links[j]);
                                links.splice(j, 1);
                            }                          
                        }
                    nodesRemoved.push(nodes[i]);    
                    nodes.splice(i, 1);                   
                }
            }       
        
        nodes.forEach(function(d){
            if (d.category === "dp") {
                dps.push(d.id) 
        }});
        
        links.forEach(function(d) {
            sources.push(d.source.id)
        });
        
        uniqueSources = removeDupls(sources);
        
        dpsToRemove = arrDiff(dps, uniqueSources);
        
        k = nodes.length
        
        while (k--) {           
                        
            if (nodes[k].category === "dp" && dpsToRemove.indexOf(nodes[k].id) === -1) {
                nodesRemoved.push(nodes[k]);   
                nodes.splice(k, 1)
            }
        }
        
        isFilterOn = true;
        
        console.log(linksRemoved);
        console.log(nodesRemoved);
        update();
    }
    
    this.restoreNet = function() {
        
        // слияние двух массивов в один без моздания нового массива
        // http://stackoverflow.com/questions/1374126/how-to-extend-an-existing-javascript-array-with-another-array-without-creating
        links.push.apply(links, linksRemoved);
        
        nodes.push.apply(nodes, nodesRemoved);
        
        
        isFilterOn = false;
        
        update();
        
    }

    this.removeNode = function (id) {

        var i = 0,

            n = findNode(id);

        while (i < links.length) {
            
            
            if ((JSON.stringify(links[i].source) === JSON.stringify(n)) || (links[i].target == n)) {
                links.splice(i, 1);
            } else {
                i++;
            }
        }
        nodes.splice(findNodeIndex(id), 1);

        update();
    };

    this.removeLink = function (source, target) {

        var i;

        for (i = 0; i < links.length; i++) {
            if (links[i].source.id === source && links[i].target.id === target) {
                links.splice(i, 1);
                break;
            }
        }
        update();
    };

    this.removeallLinks = function () {

        links.splice(0, links.length);

        update();
    };

    this.removeAllNodes = function () {
        nodes.splice(0, links.length);

        update();
    };
    
    this.changeClass = function(name) {        
        // http://stackoverflow.com/questions/30066259/d3-js-changing-opacity-of-element-on-mouseover-if-condition-false
        // http://jaketrent.com/post/d3-class-operations/
        d3.selectAll("#"+name+".node-spd")
          .classed ("newClass", function(d) {
            return (this.id === name)
        })
        .classed("node-spd", false)
        .transition()
        .duration(1000)
        .each("start", function() {
            d3.select(this)
            .attr("r", radius * 1.3);
        })
       
        .each("end", function() {
            d3.select(this)
            .transition()
            .duration(1000)
            .attr("r", radius);
        });
        
        update();
    } 

    this.addLink = function (source, target, value) {

        links.push({
            "source": findNode(source),
            "target": findNode(target),
            "value": value
        });

        update();
    };

    // Make it all go
    update();
}

//http://stackoverflow.com/questions/11400241/updating-links-on-a-force-directed-graph-from-dynamic-json-data
function drawGraph() {

    "use strict";

    graph = new MyGraph("#netGraph");

    
    var afTop = $("#chart2").offset().top,
    
    // расстояние от нижней границы элемента до конца документа
    // http://stackoverflow.com/questions/7656118/i-need-to-find-the-distance-between-the-element-and-the-bottom-of-the-browser-wi
    afBottom = $(document).height() - $("#chart2_comments").offset().top - $("#chart2_comments").outerHeight();


// фиксация элемента при прокрутке с помощью affix.js
// также нужны дополнительные классы в css
// http://www.w3schools.com/bootstrap/bootstrap_ref_js_affix.asp
$("#chart2")
.affix({offset:{top:afTop, bottom:afBottom}});
    
    return d3.csv("data.csv", function (csv) {
        return graph.setupData(csv);
    });
}

drawGraph();