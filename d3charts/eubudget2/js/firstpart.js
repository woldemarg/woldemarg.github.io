"use strict";

//размеры графиков
var width = 109;

var height = 105;

var margin = {
    top: 15,
    right: 28,
    bottom: 47,
    left: 39
};

//исходный набр данных
var datasetFirstPart;

//шкала категорий
var xFirstPart = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.1);

//линейная шкала
var yFirstPart = d3.scale.linear()
    .range([height, 0]);

var yAxisFirstPart = d3.svg.axis()
    .scale(yFirstPart)
    .orient("left")
    .ticks(4)
    .outerTickSize(0)
    .tickSubdivide(1);

var xAxisFirstPart = d3.svg.axis()
    .scale(xFirstPart)
    .orient("bottom")
    .outerTickSize(0)
    .tickPadding(7)
    .tickValues([2004, 2014]); //первая и последняя метки на шкале х

function sort() {
    return tinysort("#vizdivFirstPart>div", {
        attr: "lastYearValue",
        order: "desc"
    });
}

function typeFirstPart(d) {
    d.bul = +d.bul;
    d.cze = +d.cze;
    d.fin = +d.fin;
    d.fra = +d.fra;
    d.lit = +d.lit;
    d.pol = +d.pol;
    d.swe = +d.swe;
    d.ukr = +d.ukr;
    d.gre = +d.gre; //преобразование значений в числовой формат
    return d;
}


//основная функция
function redrawFirstPart() {

    //преобразование формата исходных данных по категориям расходов
    var array = d3.nest()
        .key(function (d) {
            return d.item;
        })
        .entries(datasetFirstPart);

    //массив по годам для задания автоматического колисества итераций в функции mousemove
    var yearNames = d3.nest()
        .key(function (d) {
            return d.year;
        })
        .map(datasetFirstPart);

    //фиксированный диапазон (количество) по шкале х
    xFirstPart.domain(datasetFirstPart.map(function (d) {
        return d.year;
    }));

    //определение диапазона для графика по умолчанию    
    yFirstPart.domain([0, d3.max(array, function (c) {
        return d3.max(c.values, function (v) {
            return v.ukr;
        });
    })]);

    //обязательная очистка контейнеров от старых графиков
    d3.select("body")
        .selectAll(".year")
        .remove();

    //содздание div-контейнера для каждого графика
    var div = d3.select("#vizdivFirstPart") //vizdivFirstPart - общий контейнер для всех графиков, внутри которого происходит пересортировка
        .selectAll(".year")
        .data(array);

    //создание svg в каждом div
    div.enter()
        .append("div")
        .attr("class", "year")
        .append("svg")
        //реальные размеры svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g") //группа со смещением для графиков, осей и пр.
        .attr("class", "viz")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //переменная для столбиков и подписей
    var bars = svg.append("g")
        .attr("class", "chart");

    bars.append("text")
        .attr("id", "label")
        .attr("class", "hidden")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", 20);

    function mousemove() {
        var xPos = d3.mouse(this)[0];
        var leftEdges = xFirstPart.range();
        var width = xFirstPart.rangeBand();
        var count = _.size(yearNames);
        var i;
        var years = {};
        //важно! количестов итераций - по количеству членов массива!
        _.each(_.range(count), function (i) {
            years[leftEdges[i]] = d3.keys(yearNames)[i];
        });

        d3.selectAll("#bar")
            .style('fill', "#FCB64C");
        d3.selectAll('#caption')
            .style('display', 'none');

        for (i = 0; xPos > (leftEdges[i] + width); i++) {}
        if (leftEdges[i] !== undefined) {
            var year = years[leftEdges[i]];
            d3.selectAll(".col-" + year)
                .style('fill', "#CE8A14"); //цвет выделения столбика
            d3.selectAll('.cap-' + year)
                .style('display', 'block');
            d3.selectAll('#label')
                .text(year);
        }
    }

    function mouseover() {

        d3.selectAll(".axis.xFirstPart text")
            .classed("hidden", true);
        d3.selectAll("#label")
            .classed("hidden", false);
        return mousemove.call(this);
    }

    function mouseout() {
        d3.selectAll(".xFirstPart.axis text")
            .classed("hidden", false); //возвращаем подпись шкалы времени
        d3.selectAll("#bar")
            .style('fill', "#FCB64C"); //возвращаем исходный цвет
        d3.selectAll("#label")
            .classed("hidden", true);
        d3.selectAll('#caption')
            .style('display', 'none');
    }

    bars.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    //столбцы  
    bars.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("rect")
        .attr("id", "bar")
        .attr("class", function (d) {
            return "col-" + d.year;
        })
        .style("pointer-events", "none") //нечувствительна к движениям курсора  
        .attr("x", function (d) {
            return xFirstPart(d.year);
        })
        .attr("y", function (d) {
            return yFirstPart(d.ukr);
        })
        .attr("width", xFirstPart.rangeBand())
        .attr("height", function (d) {
            return height - yFirstPart(d.ukr);
        });

    bars.selectAll("#caption")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append('text')
        .attr("text-anchor", "middle")
        .attr('x', function (d) {
            return xFirstPart(d.year) + xFirstPart.rangeBand() / 2;
        })
        .attr('y', function (d) {
            return yFirstPart(d.ukr) - 5;
        })
        .attr('display', 'none')
        .attr('class', function (d) {
            return 'cap-' + d.year;
        })
        .attr('id', 'caption')
        .text(function (d) {
            return d.ukr;
        });

    //подпись
    bars.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 20) //динамический отступ
        .text(function (d) {
            return d.key;
        });

    //ось у
    svg.append("g")
        .attr("class", "yFirstPart axis")
        .call(yAxisFirstPart);

    //ось х
    svg.append("g")
        .attr("class", "xFirstPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisFirstPart);

    //задание значения последнего года для каждого div-контейнера в качестве аттрибута для сортировки
    d3.selectAll(".year")
        .datum(function (d) { //не data!
            return {
                value: d.values[d.values.length - 1]
            };
        })
        .attr("lastYearValue", function (d) {
            return d.value.ukr;
        });

    sort();

}

//загрузка исходных данных
d3.csv("secondpart.csv", typeFirstPart, function (d) {
    datasetFirstPart = d;
    redrawFirstPart(); //вызов основной функции
});

function drawBul() {

    var array = d3.nest()
        .key(function (d) {
            return d.item;
        })
        .entries(datasetFirstPart);

    xFirstPart.domain(datasetFirstPart.map(function (d) {
        return d.year;
    }));

    //диапазон по максимальному значению    
    yFirstPart.domain([0, d3.max(array, function (c) {
        return d3.max(c.values, function (v) {
            return Math.max(v.ukr, v.bul);
        });
    })]);

    d3.select("body")
        .selectAll(".year")
        .remove();

    var div = d3.select("#vizdivFirstPart")
        .selectAll(".year")
        .data(array);

    div.enter()
        .append("div")
        .attr("class", "year")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g")
        .attr("class", "viz")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bars = svg.append("g")
        .attr("class", "chart");

    //столбцы  
    bars.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("rect")
        .attr("id", "bar")
        .style("pointer-events", "none") //нечувствительна к движениям курсора  
        .attr("x", function (d) {
            return xFirstPart(d.year);
        })
        .attr("y", function (d) {
            return yFirstPart(d.ukr);
        })
        .attr("width", xFirstPart.rangeBand())
        .attr("height", function (d) {
            return height - yFirstPart(d.ukr);
        });

    //подпись
    bars.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 20)
        .text(function (d) {
            return d.key;
        });

    var lineFirstPart = d3.svg.line()
        .defined(function (d) {
            return d.bul;
        })
        .x(function (d) {
            return xFirstPart(d.year) + xFirstPart.rangeBand() / 2;
        })
        .y(function (d) {
            return yFirstPart(d.bul);
        });

    bars.append("path")
        .datum(function (d) {
            return d.values;
        })
        .attr("class", "lineEU")
        .attr("d", lineFirstPart);

    bars.append("text")
        .datum(function (d) {
            return d.values[d.values.length - 1];
        })
        .attr("x", width + 3)
        .attr("y", function (d) {
            return yFirstPart(d.bul);
        })
        .text(function (d) {
            return d.bul;
        });

    //ось у
    svg.append("g")
        .attr("class", "yFirstPart axis")
        .call(yAxisFirstPart);

    //ось х
    svg.append("g")
        .attr("class", "xFirstPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisFirstPart);

    //задание значения последнего года для каждого div-контейнера в качестве аттрибута для сортировки
    d3.selectAll(".year")
        .datum(function (d) { //не data!
            return {
                value: d.values[d.values.length - 1]
            };
        })
        .attr("lastYearValue", function (d) {
            return d.value.ukr;
        });

    sort();

}

function drawCze() {

    var array = d3.nest()
        .key(function (d) {
            return d.item;
        })
        .entries(datasetFirstPart);

    xFirstPart.domain(datasetFirstPart.map(function (d) {
        return d.year;
    }));

    //диапазон по максимальному значению    
    yFirstPart.domain([0, d3.max(array, function (c) {
        return d3.max(c.values, function (v) {
            return Math.max(v.ukr, v.cze);
        });
    })]);

    d3.select("body")
        .selectAll(".year")
        .remove();

    var div = d3.select("#vizdivFirstPart")
        .selectAll(".year")
        .data(array);

    div.enter()
        .append("div")
        .attr("class", "year")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g")
        .attr("class", "viz")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bars = svg.append("g")
        .attr("class", "chart");

    //столбцы  
    bars.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("rect")
        .attr("id", "bar")
        .style("pointer-events", "none") //нечувствительна к движениям курсора  
        .attr("x", function (d) {
            return xFirstPart(d.year);
        })
        .attr("y", function (d) {
            return yFirstPart(d.ukr);
        })
        .attr("width", xFirstPart.rangeBand())
        .attr("height", function (d) {
            return height - yFirstPart(d.ukr);
        });

    //подпись
    bars.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 20)
        .text(function (d) {
            return d.key;
        });

    var lineFirstPart = d3.svg.line()
        .defined(function (d) {
            return d.cze;
        })
        .x(function (d) {
            return xFirstPart(d.year) + xFirstPart.rangeBand() / 2;
        })
        .y(function (d) {
            return yFirstPart(d.cze);
        });

    bars.append("path")
        .datum(function (d) {
            return d.values;
        })
        .attr("class", "lineEU")
        .attr("d", lineFirstPart);

    bars.append("text")
        .datum(function (d) {
            return d.values[d.values.length - 1];
        })
        .attr("x", width + 3)
        .attr("y", function (d) {
            return yFirstPart(d.cze);
        })
        .text(function (d) {
            return d.cze;
        });

    //ось у
    svg.append("g")
        .attr("class", "yFirstPart axis")
        .call(yAxisFirstPart);

    //ось х
    svg.append("g")
        .attr("class", "xFirstPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisFirstPart);

    //задание значения последнего года для каждого div-контейнера в качестве аттрибута для сортировки
    d3.selectAll(".year")
        .datum(function (d) { //не data!
            return {
                value: d.values[d.values.length - 1]
            };
        })
        .attr("lastYearValue", function (d) {
            return d.value.ukr;
        });

    sort();

}

function drawFin() {

    var array = d3.nest()
        .key(function (d) {
            return d.item;
        })
        .entries(datasetFirstPart);

    xFirstPart.domain(datasetFirstPart.map(function (d) {
        return d.year;
    }));

    //диапазон по максимальному значению    
    yFirstPart.domain([0, d3.max(array, function (c) {
        return d3.max(c.values, function (v) {
            return Math.max(v.ukr, v.fin);
        });
    })]);

    d3.select("body")
        .selectAll(".year")
        .remove();

    var div = d3.select("#vizdivFirstPart")
        .selectAll(".year")
        .data(array);

    div.enter()
        .append("div")
        .attr("class", "year")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g")
        .attr("class", "viz")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bars = svg.append("g")
        .attr("class", "chart");

    //столбцы  
    bars.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("rect")
        .attr("id", "bar")
        .style("pointer-events", "none") //нечувствительна к движениям курсора  
        .attr("x", function (d) {
            return xFirstPart(d.year);
        })
        .attr("y", function (d) {
            return yFirstPart(d.ukr);
        })
        .attr("width", xFirstPart.rangeBand())
        .attr("height", function (d) {
            return height - yFirstPart(d.ukr);
        });

    //подпись
    bars.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 20)
        .text(function (d) {
            return d.key;
        });

    var lineFirstPart = d3.svg.line()
        .defined(function (d) {
            return d.fin;
        })
        .x(function (d) {
            return xFirstPart(d.year) + xFirstPart.rangeBand() / 2;
        })
        .y(function (d) {
            return yFirstPart(d.fin);
        });

    bars.append("path")
        .datum(function (d) {
            return d.values;
        })
        .attr("class", "lineEU")
        .attr("d", lineFirstPart);

    bars.append("text")
        .datum(function (d) {
            return d.values[d.values.length - 1];
        })
        .attr("x", width + 3)
        .attr("y", function (d) {
            return yFirstPart(d.fin);
        })
        .text(function (d) {
            return d.fin;
        });

    //ось у
    svg.append("g")
        .attr("class", "yFirstPart axis")
        .call(yAxisFirstPart);

    //ось х
    svg.append("g")
        .attr("class", "xFirstPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisFirstPart);

    //задание значения последнего года для каждого div-контейнера в качестве аттрибута для сортировки
    d3.selectAll(".year")
        .datum(function (d) { //не data!
            return {
                value: d.values[d.values.length - 1]
            };
        })
        .attr("lastYearValue", function (d) {
            return d.value.ukr;
        });

    sort();

}

function drawFra() {

    var array = d3.nest()
        .key(function (d) {
            return d.item;
        })
        .entries(datasetFirstPart);

    xFirstPart.domain(datasetFirstPart.map(function (d) {
        return d.year;
    }));

    //диапазон по максимальному значению    
    yFirstPart.domain([0, d3.max(array, function (c) {
        return d3.max(c.values, function (v) {
            return Math.max(v.ukr, v.fra);
        });
    })]);

    d3.select("body")
        .selectAll(".year")
        .remove();

    var div = d3.select("#vizdivFirstPart")
        .selectAll(".year")
        .data(array);

    div.enter()
        .append("div")
        .attr("class", "year")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g")
        .attr("class", "viz")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bars = svg.append("g")
        .attr("class", "chart");

    //столбцы  
    bars.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("rect")
        .attr("id", "bar")
        .style("pointer-events", "none") //нечувствительна к движениям курсора  
        .attr("x", function (d) {
            return xFirstPart(d.year);
        })
        .attr("y", function (d) {
            return yFirstPart(d.ukr);
        })
        .attr("width", xFirstPart.rangeBand())
        .attr("height", function (d) {
            return height - yFirstPart(d.ukr);
        });

    //подпись
    bars.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 20)
        .text(function (d) {
            return d.key;
        });

    var lineFirstPart = d3.svg.line()
        .defined(function (d) {
            return d.fra;
        })
        .x(function (d) {
            return xFirstPart(d.year) + xFirstPart.rangeBand() / 2;
        })
        .y(function (d) {
            return yFirstPart(d.fra);
        });

    bars.append("path")
        .datum(function (d) {
            return d.values;
        })
        .attr("class", "lineEU")
        .attr("d", lineFirstPart);

    bars.append("text")
        .datum(function (d) {
            return d.values[d.values.length - 1];
        })
        .attr("x", width + 3)
        .attr("y", function (d) {
            return yFirstPart(d.fra);
        })
        .text(function (d) {
            return d.fra;
        });

    //ось у
    svg.append("g")
        .attr("class", "yFirstPart axis")
        .call(yAxisFirstPart);

    //ось х
    svg.append("g")
        .attr("class", "xFirstPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisFirstPart);

    //задание значения последнего года для каждого div-контейнера в качестве аттрибута для сортировки
    d3.selectAll(".year")
        .datum(function (d) { //не data!
            return {
                value: d.values[d.values.length - 1]
            };
        })
        .attr("lastYearValue", function (d) {
            return d.value.ukr;
        });

    sort();

}

function drawLit() {

    var array = d3.nest()
        .key(function (d) {
            return d.item;
        })
        .entries(datasetFirstPart);

    xFirstPart.domain(datasetFirstPart.map(function (d) {
        return d.year;
    }));

    //диапазон по максимальному значению    
    yFirstPart.domain([0, d3.max(array, function (c) {
        return d3.max(c.values, function (v) {
            return Math.max(v.ukr, v.lit);
        });
    })]);

    d3.select("body")
        .selectAll(".year")
        .remove();

    var div = d3.select("#vizdivFirstPart")
        .selectAll(".year")
        .data(array);

    div.enter()
        .append("div")
        .attr("class", "year")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g")
        .attr("class", "viz")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bars = svg.append("g")
        .attr("class", "chart");

    //столбцы  
    bars.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("rect")
        .attr("id", "bar")
        .style("pointer-events", "none") //нечувствительна к движениям курсора  
        .attr("x", function (d) {
            return xFirstPart(d.year);
        })
        .attr("y", function (d) {
            return yFirstPart(d.ukr);
        })
        .attr("width", xFirstPart.rangeBand())
        .attr("height", function (d) {
            return height - yFirstPart(d.ukr);
        });

    //подпись
    bars.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 20)
        .text(function (d) {
            return d.key;
        });

    var lineFirstPart = d3.svg.line()
        .defined(function (d) {
            return d.lit;
        })
        .x(function (d) {
            return xFirstPart(d.year) + xFirstPart.rangeBand() / 2;
        })
        .y(function (d) {
            return yFirstPart(d.lit);
        });

    bars.append("path")
        .datum(function (d) {
            return d.values;
        })
        .attr("class", "lineEU")
        .attr("d", lineFirstPart);

    bars.append("text")
        .datum(function (d) {
            return d.values[d.values.length - 1];
        })
        .attr("x", width + 3)
        .attr("y", function (d) {
            return yFirstPart(d.lit);
        })
        .text(function (d) {
            return d.lit;
        });

    //ось у
    svg.append("g")
        .attr("class", "yFirstPart axis")
        .call(yAxisFirstPart);

    //ось х
    svg.append("g")
        .attr("class", "xFirstPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisFirstPart);

    //задание значения последнего года для каждого div-контейнера в качестве аттрибута для сортировки
    d3.selectAll(".year")
        .datum(function (d) { //не data!
            return {
                value: d.values[d.values.length - 1]
            };
        })
        .attr("lastYearValue", function (d) {
            return d.value.ukr;
        });

    sort();

}

function drawPol() {

    var array = d3.nest()
        .key(function (d) {
            return d.item;
        })
        .entries(datasetFirstPart);

    xFirstPart.domain(datasetFirstPart.map(function (d) {
        return d.year;
    }));

    //диапазон по максимальному значению    
    yFirstPart.domain([0, d3.max(array, function (c) {
        return d3.max(c.values, function (v) {
            return Math.max(v.ukr, v.pol);
        });
    })]);

    d3.select("body")
        .selectAll(".year")
        .remove();

    var div = d3.select("#vizdivFirstPart")
        .selectAll(".year")
        .data(array);

    div.enter()
        .append("div")
        .attr("class", "year")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g")
        .attr("class", "viz")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bars = svg.append("g")
        .attr("class", "chart");

    //столбцы  
    bars.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("rect")
        .attr("id", "bar")
        .style("pointer-events", "none") //нечувствительна к движениям курсора  
        .attr("x", function (d) {
            return xFirstPart(d.year);
        })
        .attr("y", function (d) {
            return yFirstPart(d.ukr);
        })
        .attr("width", xFirstPart.rangeBand())
        .attr("height", function (d) {
            return height - yFirstPart(d.ukr);
        });

    //подпись
    bars.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 20)
        .text(function (d) {
            return d.key;
        });

    var lineFirstPart = d3.svg.line()
        .defined(function (d) {
            return d.pol;
        })
        .x(function (d) {
            return xFirstPart(d.year) + xFirstPart.rangeBand() / 2;
        })
        .y(function (d) {
            return yFirstPart(d.pol);
        });

    bars.append("path")
        .datum(function (d) {
            return d.values;
        })
        .attr("class", "lineEU")
        .attr("d", lineFirstPart);

    bars.append("text")
        .datum(function (d) {
            return d.values[d.values.length - 1];
        })
        .attr("x", width + 3)
        .attr("y", function (d) {
            return yFirstPart(d.pol);
        })
        .text(function (d) {
            return d.pol;
        });

    //ось у
    svg.append("g")
        .attr("class", "yFirstPart axis")
        .call(yAxisFirstPart);

    //ось х
    svg.append("g")
        .attr("class", "xFirstPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisFirstPart);

    //задание значения последнего года для каждого div-контейнера в качестве аттрибута для сортировки
    d3.selectAll(".year")
        .datum(function (d) { //не data!
            return {
                value: d.values[d.values.length - 1]
            };
        })
        .attr("lastYearValue", function (d) {
            return d.value.ukr;
        });

    sort();

}

function drawSwe() {

    var array = d3.nest()
        .key(function (d) {
            return d.item;
        })
        .entries(datasetFirstPart);

    xFirstPart.domain(datasetFirstPart.map(function (d) {
        return d.year;
    }));

    //диапазон по максимальному значению    
    yFirstPart.domain([0, d3.max(array, function (c) {
        return d3.max(c.values, function (v) {
            return Math.max(v.ukr, v.swe);
        });
    })]);

    d3.select("body")
        .selectAll(".year")
        .remove();

    var div = d3.select("#vizdivFirstPart")
        .selectAll(".year")
        .data(array);

    div.enter()
        .append("div")
        .attr("class", "year")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g")
        .attr("class", "viz")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bars = svg.append("g")
        .attr("class", "chart");

    //столбцы  
    bars.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("rect")
        .attr("id", "bar")
        .style("pointer-events", "none") //нечувствительна к движениям курсора  
        .attr("x", function (d) {
            return xFirstPart(d.year);
        })
        .attr("y", function (d) {
            return yFirstPart(d.ukr);
        })
        .attr("width", xFirstPart.rangeBand())
        .attr("height", function (d) {
            return height - yFirstPart(d.ukr);
        });

    //подпись
    bars.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 20)
        .text(function (d) {
            return d.key;
        });

    var lineFirstPart = d3.svg.line()
        .defined(function (d) {
            return d.swe;
        })
        .x(function (d) {
            return xFirstPart(d.year) + xFirstPart.rangeBand() / 2;
        })
        .y(function (d) {
            return yFirstPart(d.swe);
        });

    bars.append("path")
        .datum(function (d) {
            return d.values;
        })
        .attr("class", "lineEU")
        .attr("d", lineFirstPart);

    bars.append("text")
        .datum(function (d) {
            return d.values[d.values.length - 1];
        })
        .attr("x", width + 3)
        .attr("y", function (d) {
            return yFirstPart(d.swe);
        })
        .text(function (d) {
            return d.swe;
        });

    //ось у
    svg.append("g")
        .attr("class", "yFirstPart axis")
        .call(yAxisFirstPart);

    //ось х
    svg.append("g")
        .attr("class", "xFirstPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisFirstPart);

    //задание значения последнего года для каждого div-контейнера в качестве аттрибута для сортировки
    d3.selectAll(".year")
        .datum(function (d) { //не data!
            return {
                value: d.values[d.values.length - 1]
            };
        })
        .attr("lastYearValue", function (d) {
            return d.value.ukr;
        });

    sort();

}

function drawGre() {

    var array = d3.nest()
        .key(function (d) {
            return d.item;
        })
        .entries(datasetFirstPart);

    xFirstPart.domain(datasetFirstPart.map(function (d) {
        return d.year;
    }));

    //диапазон по максимальному значению    
    yFirstPart.domain([0, d3.max(array, function (c) {
        return d3.max(c.values, function (v) {
            return Math.max(v.ukr, v.gre);
        });
    })]);

    d3.select("body")
        .selectAll(".year")
        .remove();

    var div = d3.select("#vizdivFirstPart")
        .selectAll(".year")
        .data(array);

    div.enter()
        .append("div")
        .attr("class", "year")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g")
        .attr("class", "viz")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bars = svg.append("g")
        .attr("class", "chart");

    //столбцы  
    bars.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("rect")
        .attr("id", "bar")
        .style("pointer-events", "none") //нечувствительна к движениям курсора  
        .attr("x", function (d) {
            return xFirstPart(d.year);
        })
        .attr("y", function (d) {
            return yFirstPart(d.ukr);
        })
        .attr("width", xFirstPart.rangeBand())
        .attr("height", function (d) {
            return height - yFirstPart(d.ukr);
        });

    //подпись
    bars.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 20)
        .text(function (d) {
            return d.key;
        });

    var lineFirstPart = d3.svg.line()
        .defined(function (d) {
            return d.gre;
        })
        .x(function (d) {
            return xFirstPart(d.year) + xFirstPart.rangeBand() / 2;
        })
        .y(function (d) {
            return yFirstPart(d.gre);
        });

    bars.append("path")
        .datum(function (d) {
            return d.values;
        })
        .attr("class", "lineEU")
        .attr("d", lineFirstPart);

    bars.append("text")
        .datum(function (d) {
            return d.values[d.values.length - 1];
        })
        .attr("x", width + 3)
        .attr("y", function (d) {
            return yFirstPart(d.gre);
        })
        .text(function (d) {
            return d.gre;
        });

    //ось у
    svg.append("g")
        .attr("class", "yFirstPart axis")
        .call(yAxisFirstPart);

    //ось х
    svg.append("g")
        .attr("class", "xFirstPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisFirstPart);

    //задание значения последнего года для каждого div-контейнера в качестве аттрибута для сортировки
    d3.selectAll(".year")
        .datum(function (d) { //не data!
            return {
                value: d.values[d.values.length - 1]
            };
        })
        .attr("lastYearValue", function (d) {
            return d.value.ukr;
        });

    sort();

}
