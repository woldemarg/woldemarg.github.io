/*jslint plusplus: true*/
/*jslint regexp: true*/

var q = d3.queue(),

    chart,

    barWidthToShift,

    ua_locale = d3.locale({
        "decimal": ",",
        "thousands": "\u00A0",
        "grouping": [3],
        "currency": ["", " грн"],
        "dateTime": "%A, %e %B %Y р. %X",
        "date": "%d.%m.%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["неділя", "понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота"],
        "shortDays": ["нд", "пн", "вт", "ср", "чт", "пт", "сб"],
        "months": ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"],
        "shortMonths": ["січ '16", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"]
    }),

    formatDate = ua_locale.timeFormat("%d.%m.%Y"),
    // formatDate = d3.time.format("%d.%m.%Y"),

    cumulMistrustData = [],

    mistrust = [];

function setLayout() {

    "use strict";

    // динамический расчет высоты для последнего элемента div,
    // считаем сколько полных высот контейнера для графика
    // помещается в одной высоте блока комментариев
    // и добавлем эту разницу к блоку комментариев
    var addedHeight = (Math.ceil($("#chart_comments")
                .outerHeight() / $("#chart")
                .outerHeight()) * $("#chart")
            .outerHeight()) - $("#chart_comments")
            .outerHeight(),

        // растояние от верхней границы окна
        // до верхней границы контейнера для графика 
        afTop = $("#chart")
            .offset()
            .top,

        // расстояние от нижней границы элемента до конца документа
        // http://stackoverflow.com/questions/7656118/i-need-to-find-the-distance-between-the-element-and-the-bottom-of-the-browser-wi
        afBottom = $(document)
            .height() - $("#chart_comments")
            .offset()
            .top - $("#chart_comments")
            .outerHeight(),

        // добавляем к блоку комментарием разницу высоты
        adjustedDiv = document.getElementById("keepScrolling2");

    adjustedDiv.style.height = addedHeight + "px";

    // фиксация элемента при прокрутке с помощью affix.js
    // также нужны дополнительные классы в css
    // http://www.w3schools.com/bootstrap/bootstrap_ref_js_affix.asp
    $("#chart")
        .affix({
            offset: {
                top: afTop,
                bottom: afBottom
            }
        });
}

function MyChart(div, spdNspdData, csv3) {

    "use strict";

    var svgMaxWidth = Math.min(Math.max(document.documentElement.clientHeight, window.innerHeight || 0), document.getElementById("chart")
            .offsetWidth),

        svgMaxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * 0.618,

        svg = d3.select(div)
            .append("svg")
            .attr("width", svgMaxWidth)
            .attr("height", svgMaxHeight),

        margin = {
            top: 10,
            right: 40,
            bottom: svgMaxHeight * 0.382,
            left: 40
        },

        margin2 = {
            top: svgMaxHeight * 0.618 + 65,
            right: 40,
            bottom: 20,
            left: 40
        },

        width = +svg.attr("width") - margin.left - margin.right,

        height = +svg.attr("height") - margin.top - margin.bottom,
        height2 = +svg.attr("height") - margin2.top - margin2.bottom,

        x = d3.time.scale()
            .range([0, width]),

        xScaleOrdinal = d3.scale.ordinal()
            .rangeRoundBands([0, width], 0.4),

        y = d3.scale.linear()
                .range([height, 0]),

        xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.time.month)
            .tickFormat(ua_locale.timeFormat("%b"))
            .tickSubdivide(1),

        yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(6),

        area = d3.svg.area()
            .interpolate("monotone")
            .x(function (d) {
                return x(d.dat);
            }),

        elements = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),

        dots = svg.append("g")
            .attr("class", "dotsG")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")"),

        xAxisDispl = svg.append("g")
                .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")"),

        yAxisShift = 4,

        yAxisDispl = svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (margin.left - yAxisShift) + "," + margin.top + ")"),

        legend = d3.select("#chartLegend")
            .append("svg")
            .attr("width", svgMaxWidth)
            .attr("height", 30),

        duration = 2000,

        radius = 3,

        barWidthToShift,

        sumSpd,
        sumAll,
        mistShare,
        numAnim,

       numAnimOptions = {  
            useEasing: true,
              useGrouping: false,
              separator: ",",
              decimal: ".",
              prefix: "",
              suffix: "%"
        },

        noDec = d3.format(",.0f"),
        oneDec = d3.format(",.1f");

    function formatNum(num) {
        if (num > 1000) {
            return oneDec(num / 1000) + " млн грн.";
        } else if (num < 1) {
            return noDec(num * 1000) + " грн.";
        } else {
            return noDec(num) + " тис. грн.";
        }
    }

    function changeTitle(chapter) {

        var header = d3.select("#chartTitle"),

            firstTitle,
            secondTitle;

        if (chapter === 1) {
            firstTitle = header.append("h4")
                .html("Динаміка бюджетних транзакцій ДП щодо закупівлі товарів і послуг</br><small>(крім банківських, комунально-побутових, монопольних і пов'язаних із обслуговування автодоріг)</small>");
        }

        if (chapter === 2) {

            header.select("h4")
                .transition()
                .duration(duration / 4)
                .style("opacity", 1e-6)
                .remove();

            secondTitle = header.append("h4")
                .style("opacity", 1e-6)
                .html("Динаміка бюджетних транзакції між ДП і ФОП")
                .transition()
                .duration(duration / 4)
                .delay(duration / 4)
                .style("opacity", 1);
        }
    }

    function drawLegend(chapter) {

        if (chapter === 1) {

            legend.append("rect")
                .attr("class", "spdBox")
                .attr("x", 5)
                .attr("y", 5)
                .attr("width", 10)
                .attr("height", 10);

            legend.append("text")
                .attr("id", "textToMeasure")
                .attr("x", 20)
                .attr("y", 15)
                .text("транзакції з ФОП");
        }

        if (chapter === 2) {

            // http://stackoverflow.com/questions/1636842/svg-get-text-element-width
            var textBbox = document.getElementById("textToMeasure")
                .getBBox(),
                widthT = textBbox.width,
                heightT = textBbox.height,

                footer = d3.select("#left")
                .append("p")
                .style("opacity", 1e-6)
                .html("*сумнівність транзакцій і контрагентів визначається</br>за критеріями, описаними в тексті статті")
                .transition()
                .duration(duration / 4)
                .style("opacity", 1);

            legend.append("rect")
                .attr("class", "mistrustBox")
                .attr("x", 5 + 10 + 5 + widthT + 25)
                .attr("y", 5)
                .attr("width", 10)
                .attr("height", 10)
                .style("opacity", 1e-6)
                .transition()
                .duration(duration / 4)
                .style("opacity", 1);

            legend.append("text")
                .attr("x", 5 + 10 + 5 + widthT + 25 + 15)
                .attr("y", 15)
                .text("сумнівні транзакції/контрагенти*")
                .style("opacity", 1e-6)
                .transition()
                .duration(duration / 4)
                .style("opacity", 1);

        }
    }

    // http://stackoverflow.com/questions/7176908/how-to-get-index-of-object-by-its-property-in-javascript
    function findWithAttr(array, attr, value) {
        var i;

        for (i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) {
                return i;
            }
        }
        return -1;
    }

    function getMonthsCombined(input, cumulative) {
        var i = input.length,
            j;

        while (i--) {

            for (j = 0; j < cumulative.length; j += 1) {

                if (input[i].dat.getTime() === cumulative[j].dat.getTime()) {
                    cumulative[j].val += input[i].val;
                    input.splice(i, 1);
                    break;
                }
            }
        }
        return cumulative;
    }

    function isInArray(el, arr) {
        var i;

        for (i = 0; i < arr.length; i += 1) {
            if (el === +arr[i].dat) {
                return true;
                //break;
            }
        }
        return false;
    }

    function reCummulate(insert, addon, cumulative) {
        var i;

        for (i = 0; i < insert.length; i += 1) {
            if (!isInArray(insert[i].dat.getTime(), addon)) {
                cumulative.push(insert[i]);
            }
        }

        return cumulative;
    }

    function updateMistBars(data) {

        var mistBars = elements.selectAll("#mistrust-bars")
            .data(data);

        mistBars.enter()
            .append("rect")
            .attr("id", "mistrust-bars")
            .attr("x", function (d) {
                return x(d.dat);
            })
            .attr("width", xScaleOrdinal.rangeBand())
            .attr("y", function (d) {
                return y(0);
            })
            .attr("height", 0);

        mistBars.transition()
            .duration(duration)
            .attr("y", function (d) {
                return y(d.val);
            })
            .attr("height", function (d) {
                return height - y(d.val);
            });
    }

    function transToBars() {

        y = d3.scale.linear()
            .range([height, 0]);

        elements.select("#spd.layer")
            .transition()
            .duration(duration)
            .style("fill-opacity", 1e-6)
            .remove();

        var spdDB = [];

        spdNspdData.filter(function (d) {
            if (d.key === "spd") {
                return d.values.forEach(function (e) {
                    spdDB.push(e);
                });
            }
        });

        sumAll = spdDB.reduce(function (total, month) {
            return total + month.val;
        }, 0);

        xScaleOrdinal.domain(spdDB.map(function (d) {
            return d.dat;
        }));

        y.domain([0, d3.max(spdDB, function (d) {
            return d.val;
        })]);

        // комбинированные оси для равномерного
        // распределения столбцов на графике
        // http://stackoverflow.com/questions/12186366/d3-js-evenly-spaced-bars-on-a-time-scale
        elements.selectAll("bar")
            .data(spdDB)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return x(d.dat);
            })
            .attr("width", xScaleOrdinal.rangeBand())
            .attr("y", function (d) {
                return y(d.val);
            })
            .attr("height", function (d) {
                return height - y(d.val);
            })
            .style("fill-opacity", 1e-6)
            .transition()
            .delay(function (d, i) {
                return i / spdDB.length * duration / 2;
            })
            .duration(duration / 2)
            .style("fill-opacity", 1);

        barWidthToShift = xScaleOrdinal.rangeBand();

    }

    function calculateGrid(csv3) {

        var xDots = d3.scale.ordinal(),
            yDots = d3.scale.ordinal(),
            
            // проверка: cols x rows >= nodes.length
            numColDots = 72,
            numRowDots = 10,
            placeHolders = [],
            i,
            j,
            c,
            r,
            n = 0;

        xDots.domain(d3.range(numColDots))
            .rangeBands([0, width]);

        yDots.domain(d3.range(numRowDots))
            .rangeBands([height2, 0]);

        for (i = 0; i < numColDots; i++) {
            placeHolders.push([]);
            for (j = 0; j < numRowDots; j++) {
                placeHolders[i].push({});
                placeHolders[i][j].x = xDots(i);
                placeHolders[i][j].y = yDots(j);
            }
        }

        for (c = 0; c < placeHolders.length; c++) {
            for (r = 0; r < placeHolders[c].length; r++) {
                if (n === csv3.length) {
                    break;
                } else {
                    csv3[n].x = placeHolders[c][r].x;
                    csv3[n].y = placeHolders[c][r].y;
                    n += 1;
                }
            }
        }

        return csv3;
    }

    function moveDots() {

        dots.selectAll(".dot-spd")
            .transition()
            .duration(duration)
            .attr("fill", "#bbb")
            .attr("transform", function (d) {
                return "translate(" + (d.x + barWidthToShift) + "," + d.y + ")";
            });

        dots.selectAll(".dot-dp")
            .transition()
            .duration(duration)
            .attr("fill", "#777");

        // определяем позицию первой точки .dot-spd
        // выбор элемента по классу - http://www.w3schools.com/jsref/met_element_getelementsbyclassname.asp
        // получение координат выбранного элемента - http://stackoverflow.com/questions/10349811/how-to-manipulate-translate-transforms-on-a-svg-element-with-javascript-in-chrom
        var firstSpdDot = document.getElementsByClassName("dot-spd")[0],
            translateAttr = firstSpdDot.getAttribute('transform'),
            coordinates = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(translateAttr),
            firstX = parseFloat(coordinates[1]),
            firstY = parseFloat(coordinates[2]);

        dots.append("text")
            .attr("y", height2 + 10)
            .attr("x", barWidthToShift + firstX)
            .style("text-anchor", "start")
            .style("opacity", 1e-6)
            .text("ФОП")
            .transition()
            .duration(duration)
            .style("opacity", 1);

        dots.append("text")
            .attr("y", height2 + 10)
            .style("text-anchor", "start")
            .style("opacity", 1e-6)
            .text("ДП")
            .transition()
            .duration(duration)
            .style("opacity", 1);

        setTimeout(enable_scroll, duration);
    }

    this.stream = function () {

        area.y0(function (d) {
            return y(d.y0);
        })
            .y1(function (d) {
                return y(d.y0 + d.y);
            });

        var stack = d3.layout.stack()
            .offset("wiggle")
            .values(function (d) {
                return d.values;
            })
            .x(function (d) {
                return d.dat;
            })
            .y(function (d) {
                return d.val;
            })
            .order("reverse"),

            layers = stack(spdNspdData),

            nspdArrIndex = findWithAttr(layers, "key", "nspd");

        x.domain(d3.extent(layers[nspdArrIndex].values, function (d) {
            return d.dat;
        }));

        y.domain([0, d3.max(layers[nspdArrIndex].values, function (d) {
            return d.y0 + d.y;
        })]);

        elements.selectAll(".layer")
            .data(layers)
            .enter()
            .append("path")
            .attr("class", "layer")
            .attr("id", function (d) {
                return d.key;
            })
            .attr("d", function (d) {
                return area(d.values);
            });

        // смещение подписей на графике вправо
        // http://bl.ocks.org/mbostock/6186172
        xAxisDispl.call(xAxis)
            .selectAll("text")
            .attr("y", 15)
            .style("text-anchor", "start");

        yAxisDispl.call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 5)
            .attr("dy", "0.8em")
            .style("text-anchor", "end")
            .text("млн. грн.");

        changeTitle(1);
        drawLegend(1);
        setLayout();
    };

    this.area = function () {

        area.y0(height)
            .y1(function (d) {
                return y(d.val);
            });

        var spdArrIndex = findWithAttr(spdNspdData, "key", "spd");

        y.domain([0, d3.max(spdNspdData[spdArrIndex].values, function (d) {
            return d.val;
        })]);

        elements.select("#spd.layer")
            .transition()
            .duration(duration)
            .attr("d", function (d) {
                return area(d.values);
            });

        area.y0(height)
            .y1(function (d) {
                return y(0);
            });

        elements.select("#nspd.layer")
            .transition()
            .duration(duration)
            .attr("d", function (d) {
                return area(d.values);
            })
            .remove();

        yAxisDispl.transition()
            .duration(duration)
            .call(yAxis);

        changeTitle(2);
        setTimeout(transToBars, duration);
    };

    this.stepByStep = function (name) {

        if (name === "last") {

            drawLegend(2);

            sumSpd = cumulMistrustData.reduce(function (total, month) {
                return total + month.val;
            }, 0);

            mistShare = sumSpd / sumAll * 100;

            elements.append("text")
                .attr("x", width * 0.85)
                .attr("y", height * 0.15)
                .attr("id", "counter")
                .style("opacity", 1e-6)
                .transition()
                .duration(duration / 2)
                .style("opacity", 1);

            elements.append("text")
                .attr("x", width * 0.85)
                .attr("y", height * 0.15 + 12)
                .style("font-size", "0.7em")
                .style("opacity", 1e-6)
                .text("суми транзакцій")
                .transition()
                .duration(duration / 2)
                .style("opacity", 1);

            numAnim = new CountUp("counter", 0, mistShare, 1, duration / 1000, numAnimOptions);

            updateMistBars(cumulMistrustData);

            numAnim.start();

        } else {

            var currentStepData = mistrust.filter(function (d) {
                    return d.cat === name;
                }),

                combinedMonths = getMonthsCombined(currentStepData, cumulMistrustData);

            reCummulate(currentStepData, combinedMonths, cumulMistrustData);

            sumSpd = cumulMistrustData.reduce(function (total, month) {
                return total + month.val;
            }, 0);

            mistShare = sumSpd / sumAll * 100;

            updateMistBars(cumulMistrustData);

            numAnim.update(mistShare);
        }
    };

    this.dots = function () {

        xAxisDispl.append("text")
            .attr("y", 50)
            .style("text-anchor", "start")
            .text("Учасники транзакцій (з 01.10.15 по 30.09.16):");

        var nodes = calculateGrid(csv3),

            circles = dots.selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("class", function (d) {
                    return "dot-" + d.cat;
                })
                .attr("id", function (d) {
                    return "id-" + d.mistrust;
                })
                .attr("r", radius)
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                })
                .attr("fill", "#ccc")
                .style("opacity", 1e-6);

        circles.transition()
            .delay(function (d, i) {
                return i / nodes.length * duration / 2;
            })
            .duration(duration / 2)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .style("opacity", 1);

        circles.on('mouseover', function (d) {

            var dotTransformAttr = this.getAttribute('transform'),
                coordArray = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(dotTransformAttr),
                dotX = parseFloat(coordArray[1]),
                dotY = parseFloat(coordArray[2]),
                
                tHeight = height2 * 0.49,
                tWidth = (width + barWidthToShift) * 0.49,

                tooltip = dots.append("g")
                    .attr("id", "myTooltip"),

                tool = tooltip.append("rect")
                    .attr("x", function () {
                        if (dotX + tWidth > width + barWidthToShift) {
                            return dotX - tWidth;
                        } else {
                            return dotX;
                        }
                    })
                    .attr("y", function () {
                        if (dotY + tHeight > height2) {
                            return dotY - tHeight;
                        } else {
                            return dotY;
                        }
                    })
                    .attr("height", tHeight)
                    .attr("width", tWidth)
                    .attr("rx", 5)
                    .attr("ry", 5)
                    .attr("fill", function () {
                        if (d.cat === "dp") {
                            return "#777";
                        } else {
                            return "#bbb";
                        }
                    })
                    .attr("stroke", "#fff")
                    .attr("stroke-width", "1px")
                    .style("opacity", 1e-6),

                text1 = tooltip.append("text")
                    .attr("x", function () {
                        if (dotX + tWidth > width + barWidthToShift) {
                            return dotX - tWidth + tWidth / 2;
                        } else {
                            return dotX + tWidth / 2;
                        }
                    })
                    .attr("y", function () {
                        if (dotY + tHeight > height2) {
                            return dotY - tHeight + ((tHeight * 0.1) + 12);
                        } else {
                            return dotY + ((tHeight * 0.1) + 12);
                        }
                    })
                    .attr("fill", function () {
                        if (d.cat === "dp") {
                            return "#fff";
                        } else {
                            return "#444";
                        }
                    })
                    .style("text-anchor", "middle")
                    .text(function () {
                        if (d.cat === "dp") {
                            return d.name;
                        } else {
                            return "ФОП " + d.name + " отримав(-ла)";
                        }
                    })
                    .style("opacity", 1e-6),

                text2 = tooltip.append("text")
                    .attr("x", function () {
                        if (dotX + tWidth > width + barWidthToShift) {
                            return dotX - tWidth + tWidth / 2;
                        } else {
                            return dotX + tWidth / 2;
                        }
                    })
                    .attr("y", function () {
                        if (dotY + tHeight > height2) {
                            return dotY - tHeight + ((tHeight * 0.85));
                        } else {
                            return dotY + ((tHeight * 0.85));
                        }
                    })
                    .attr("fill", function () {
                        if (d.cat === "dp") {
                            return "#fff";
                        } else {
                            return "#444";
                        }
                    })
                    .style("text-anchor", "middle")
                    .text(function () {
                        if (d.cat === "dp") {
                            return "заплатило ФОП з бюджету " + formatNum(+d.amount);
                        } else {
                            return "через ДП з бюджету " + formatNum(+d.amount);
                        }
                    })
                    .style("opacity", 1e-6);

            tool.transition()
                    .duration(duration / 4)
                    .style("opacity", 0.85);

            text1.transition()
                    .duration(duration / 4)
                    .style("opacity", 1);

            text2.transition()
                    .duration(duration / 4)
                    .style("opacity", 1);
        })
            .on('mouseout', function (d) {
                d3.select("#myTooltip")
                    .remove();
            });

        setTimeout(moveDots, duration);
    };

    this.highlightDots = function (name) {

        // выбираем только точки по свойству mistrust
        // свойство mistrust определяет id для класса node-spd 
        // http://stackoverflow.com/questions/30066259/d3-js-changing-opacity-of-element-on-mouseover-if-condition-false
        // http://jaketrent.com/post/d3-class-operations/
        dots.selectAll("circle#id-" + name)
            .transition()
            .duration(duration / 2)
            .attr("fill", "#A11")
            .attr("r", radius * 1.25)
            .each("end", function () {
                d3.select(this)
                    .transition()
                    .duration(duration / 2)
                    .attr("r", radius);
            });
    };

}

function cleanData(d) {
    "use strict";
    d.forEach(function (s) {
        s.dat = formatDate.parse(s.dat);
        s.val = +s.val;
    });
}

function getData(error, csv1, csv2, csv3) {

    "use strict";

    if (error) {
        throw error;
    }

    cleanData(csv1);
    cleanData(csv2);

    mistrust = csv2;

    var nested = d3.nest()
        .key(function (d) {
            return d.cat;
        })
        .entries(csv1),

        spdNspdData = nested.filter(function (d) {
            return d.key === "spd" || d.key === "nspd";
        }),

        lastMonthData = mistrust.filter(function (d) {
            return d.cat === "last";
        });

    chart = new MyChart("#chartBody", spdNspdData, csv3);

    // начало наполнения кумулятивной БД
    cumulMistrustData = lastMonthData;

    return chart.stream();
}

if ($(window)
        .width() >= 992) {   
        
    q.defer(d3.csv, "data/stream.csv")
        .defer(d3.csv, "data/mistrust.csv")
        .defer(d3.csv, "data/nodes.csv")
        .await(getData);

} else {

    d3.select("#chartBody")
        .append("img")
        .attr("src", "pics/chart.png")
        .attr("class", "img-responsive")
        .attr("alt", "Динаміка бюджетних транзакції між ДП і ФОП");
}