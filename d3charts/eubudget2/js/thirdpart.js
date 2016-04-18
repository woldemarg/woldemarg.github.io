/*//размеры графиков
var width = 150;

var height = 130;

var margin = {
    top: 15,
    right: 30,
    bottom: 40,
    left: 25
};*/


//исходный набр данных
var datasetThirdPart;

//как работает http://stackoverflow.com/questions/26882631/d3-what-is-a-bisector  
var bisect = d3.bisector(function(d) {
        return d.year;
    })
    .left;


var xThirdPart = d3.time.scale()
    .range([0, width]);

var yThirdPart = d3.scale.linear()
    .range([height, 0]);

//defined для линий с пробелами в данных http://bl.ocks.org/mbostock/3035090      
var lineThirdPart = d3.svg.line()
    .defined(function(d) {
        return d.val;
    })
    .x(function(d) {
        return xThirdPart(d.year);
    })
    .y(function(d) {
        return yThirdPart(d.val);
    });

var area = d3.svg.area()
    .defined(lineThirdPart.defined()) //area c пропусками
    .x(function(d) {
        return xThirdPart(d.year);
    })
    .y0(height)
    .y1(function(d) {
        return yThirdPart(d.val);
    });

var yAxisThirdPart = d3.svg.axis()
    .scale(yThirdPart)
    .orient("left")
    .ticks(4);

var xAxisThirdPart = d3.svg.axis()
    .scale(xThirdPart)
    .orient("bottom")
    .tickValues([new Date(1995, 1, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0), new Date(2005, 1, 1, 0, 0, 0, 0), new Date(2010, 1, 1, 0, 0, 0, 0), new Date(2014, 1, 1, 0, 0, 0, 0)]) //на шкале только метки из массива - начало, конец, вступление в ЕС
    //.innerTickSize(-height) //линия сетки по высоте графика
    //.outerTickSize(0)
    //.tickPadding(7)
    .tickFormat(d3.time.format("'%y")); //формат отображения подписей на шкале

var menu = d3.select("#menu select")
    .on("change", change); //вызов функции при обновлении данных

//загрузка исходных данных
d3.csv("thirdpart.csv", type, function(d) { //type - предварительная обработка данных
    datasetThirdPart = d; //присвоение имени
    redrawThirdPart(); //вызов основной функции
});

//функция обработки исходных данных
/*function type(d) {
    d.year = parseDate.parse(d.year); //преобразование года в формат даты
    d.val = +d.val; //преобразование значений в числовой формат
    return d;
}*/

//перерисовка графиков при выборе значения из меню
function change() {
    d3.transition()
        .each(redrawThirdPart);
}

//основная функция
//преобразование исходных данных в массив по типам расходов - option
//пример - http://bl.ocks.org/nsonnad/4175202            
function redrawThirdPart() {
    //пересортировка исходного набора по статьям затрат (option)
    var nested = d3.nest()
        .key(function(d) {
            return d.option;
        })
        .map(datasetThirdPart);
    
    console.log(nested);

    var series = menu.property("value"); //выбор набора данных в меню

    //создание массива по выбранной статье затрат для каждой страны 
    //пример - http://bl.ocks.org/natemiller/20f9bd99d1795e3a0b1c
    //ключ - страна
    var data = nested[series];
    
    console.log(data);
    
    var array = d3.nest()
        .key(function(d) {
            return d.country;
        })
        .entries(data);

    console.log(array); //вывод рабочего набора данных

    //определение диапазона    
    xThirdPart.domain([
        d3.min(array, function(c) {
            return d3.min(c.values, function(v) {
                return v.year;
            });
        }), d3.max(array, function(c) {
            return d3.max(c.values, function(v) {
                return v.year;
            });
        })
    ]);

    //разные диапазоны для "всего" и прочих затрат
    if (series === "ttl") {
        yThirdPart.domain([0, 64]) //заданы вручную исходя из анализа данных
    } else {
        yThirdPart.domain([0, 17])
    }

    
    //обязательная очистка контейнеров от старых графиков
    d3.select("body")
        .selectAll(".country")
        .remove();

    //содздание div-контейнера для каждого графика
    var div = d3.select("#vizdivThirdPart") //vizdiv - общий контейнер для всех графиков, внутри которого происходит пересортировка
        .selectAll(".country")
        .data(array);

    //создание svg в каждом div
    div.enter()
        .append("div")       
        .attr("class", "country")
        .append("svg") //реальные размеры svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g") //группа со смещением для графиков, осей и пр.
        .attr("class", "viz")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //переменная для линии, области и подписей
    var lines = svg.append("g")
        .attr("class", "chart");

    //область    
    lines.append("path")
        .style("pointer-events", "none") //нечувствительна к движениям курсора
        .attr("d", function(d) {
            return area(d.values);
        })
        .attr("id", function(d) {
            return d.key;
        })
        .attr("class", "areaThirdPart")

    //линия
    lines.append("path")
        .attr("class", "lineAll")
        .style("pointer-events", "none")
        .attr("d", function(d) {
            return lineThirdPart(d.values);
        });

    //название страны
    lines.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 20) //динамический отступ
        .text(function(d) {
            return d.key;
        });

    //подпись последней точки на линии
    lines.append("text")
        .datum(function(d) {
            return {
                value: d.values[d.values.length - 1]
            };
        })
        .attr("class", "lastValue")
        .attr("y", function(d) {
            return yThirdPart(d.value.val);
        })
        .attr("x", function(d) {
            return xThirdPart(d.value.year) + 12;//отступ, чтобы надпись читалаь и при нисходящем тренде
        })
        .style("text-anchor", "middle")
        .attr("dy", -8)
        .text(function(d) {
            return d.value.val;
        });

    //ось у
    svg.append("g")
        .attr("class", "yThirdPart axis")
        .call(yAxisThirdPart);

    //ось х
    svg.append("g")
        .attr("class", "xThirdPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisThirdPart);

    //круг остается невидимым пока нет движенй курсора
    var circle = lines.append("circle")
        .attr("r", 2.5)
        .attr("opacity", 0)
        .attr("class", "circle");

    //невидимая подпись точки
    var caption = lines.append("text")
        .attr("class", "captionThirdPart")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("dy", -8);

    //невидимый год для точки
    var curYear = lines.append("text")
        .attr("class", "yearThirdPart")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("dy", 20) //динамический отступ
        .attr("y", height);

    //оверлей для отслеживания движений курсора на каждом графике
   lines.append("rect")
        .attr("class", "overlay")
        .attr("width", width) //строго по размеру графика без отступов
        .attr("height", height)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    function mouseover() {
        d3.selectAll("circle")
            .attr("opacity", 1);//делаем видимой точку
        
        d3.selectAll(".axis.xThirdPart text")
            .classed("hidden", true); //скрываем подпись оси
        
        d3.selectAll(".lastValue")
            .classed("hidden", true);
        
        return mousemove.call(this);
    }

    //подробное описание и пример здесь - https://flowingdata.com/2014/10/15/linked-small-multiples 
    function mousemove() {
        var year = xThirdPart.invert(d3.mouse(this)[0]);
        var fullYear = year.getFullYear(); //полный год нужен, т.к. данные - по годам
        var date = parseDate.parse("" + fullYear);
        var formatYear = d3.time.format("'%y");
        var dateToDisplay = formatYear(year);
        //для определения положения курсора нужен индекс
        //количество лет в исходных данных для каждой страны одинаковое
        //если нет данных, должен быть "пустой" год
        //для правильной отрисовки используется для линии и области функция defined
        var index = 0;
        //перемещаем точку за курсором
        circle.attr("cx", xThirdPart(date))
            .attr("cy", function(c) {
                index = bisect(c.values, date, 0, c.values.length - 1); // два последних значения - пределы диапазона вставки
                return yThirdPart(getVal(c.values[index]));
            })
            .attr("opacity", function(c) {
                index = bisect(c.values, date, 0, c.values.length - 1);
                //если точка за пределами рисованной линии - делаем невидимой
                var cheсk = getVal(c.values[index]);
                if (cheсk !== 0) {
                    return 1;
                } else {
                    return 0;
                }
            });

        //перемещаем подпись данных за курсором
        caption.attr("x", xThirdPart(date))
            .attr("y", function(c) {
                return yThirdPart(getVal(c.values[index]));
            })
            .text(function(c) {
                index = bisect(c.values, date, 0, c.values.length - 1); //пределы
                //если за пределами рисованной линии - делаем невидимым
                var cheсk = getVal(c.values[index]);
                if (cheсk !== 0) {
                    return cheсk;
                } else {
                    return ""; //пусто
                }
            });

        //перемещаем подпись года за курсором
        curYear.attr("x", xThirdPart(date))
            .text(function(c) {
                index = bisect(c.values, date, 0, c.values.length - 1); // пределы
                var chek = getVal(c.values[index]);
                if (chek !== 0) { //невидимій, если отсутствуют данные
                    return dateToDisplay;
                } else {
                    return ""; //пусто
                }
            });
    }

    function mouseout() {
        d3.selectAll(".xThirdPart.axis text")
            .classed("hidden", false); //возвращаем подпись шкалы времени
       
        d3.selectAll(".lastValue")
            .classed("hidden", false); //подпись данных крайней точки линии
       
        circle.attr("opacity", 0);
        
        caption.text("");
        
        return curYear.text("");
    }

    //задание значения последнего года для каждого div-контейнера в качестве аттрибута для сортировки
    d3.selectAll(".country")
        .datum(function(d) { //не data!
            return {
                value: d.values[d.values.length - 1] 
            };
        })
        .attr("lastYearValue", (function(d) {
            return d.value.val;
        }))
        
       
    //обновление линии и области при выборе из меню
    var linesUpdate = d3.transition(svg);

    linesUpdate.select(".area")
        .attr("d", function(d) {
            return area(d.values);
        });

    linesUpdate.select(".line")
        .attr("d", function(d) {
            return lineThirdPart(d.values);
        });

    //обновление оси при выборе из меню
    var axisUpdate = d3.transition(svg);

    axisUpdate.select(".yThirdPart.axis")
        .call(yAxisThirdPart);

    axisUpdate.select(".xThirdPart.axis")
        .call(xAxisThirdPart);
   
}


function sort09() {
    return tinysort("#vizdivThirdPart>div", {
        attr: "lastYearValue" //по значению последнего года
    });
    change()
}