
//размеры графиков
/*var width = 150;

var height = 130;

var margin = {
    top: 15,
    right: 30,
    bottom: 40,
    left: 25
};*/


//исходный набр данных
var dataset;

//набор функций для получения доступа к отдельным элементам данных 
var getYear = function(d) {
    return d.year;
};

var getVal = function(d) {
    return d.val;
};


var parseDate = d3.time.format("%Y"); //формат даты

var xSecondPart = d3.time.scale()
    .range([0, width]);

var ySecondPart = d3.scale.linear()
    .range([height, 0])
    .domain([0, 21]);

//defined для линий с пробелами в данных http://bl.ocks.org/mbostock/3035090      
var lineSecondPart = d3.svg.line()
    .defined(function(d) {
        return d.val;
    })
    .x(function(d) {
        return xSecondPart(d.year);
    })
    .y(function(d) {
        return ySecondPart(d.val);
    });

var areaSecondPart = d3.svg.area()
    .defined(lineSecondPart.defined()) //area c пропусками
    .x(function(d) {
        return xSecondPart(d.year);
    })
    .y0(height)
    .y1(function(d) {
        return ySecondPart(d.val);
    });

var yAxisSecondPart = d3.svg.axis()
    .scale(ySecondPart)
    .orient("left")
    .ticks(4);

var xAxisSecondPart = d3.svg.axis()
    .scale(xSecondPart)
    .orient("bottom")
    .ticks(4)
    .outerTickSize(0)
    .tickPadding(7)
    .tickFormat(d3.time.format("'%y")); //формат отображения подписей на шкале


//загрузка исходных данных
d3.csv("secondpart.csv", type, function(d) { //type - предварительная обработка данных
    dataset = d; //присвоение имени
    redrawSecondPart(); //вызов основной функции
});

//функция обработки исходных данных
function type(d) {
    d.year = parseDate.parse(d.year); //преобразование года в формат даты
    d.val = +d.val; //преобразование значений в числовой формат
    return d;
}



//основная функция
//преобразование исходных данных в массив по типам расходов - option
//пример - http://bl.ocks.org/nsonnad/4175202            
function redrawSecondPart() {
    //пересортировка исходного набора по статьям затрат (option)
    var nested = d3.nest()
        .key(function(d) {
            return d.country;
        })
        .map(dataset);  
   
    //var series = "Україна"; //выбор набора данных в меню

    //создание массива по выбранной статье затрат для каждой страны 
    //пример - http://bl.ocks.org/natemiller/20f9bd99d1795e3a0b1c
    //ключ - страна
    var data = nested["Україна"];
         
    var array = d3.nest()
        .key(function(d) {
            return d.item;
        })
        .entries(data);

    //console.log(array); //вывод рабочего набора данных

    //определение диапазона    
    xSecondPart.domain([
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

   
    //обязательная очистка контейнеров от старых графиков
    d3.select("body")
        .selectAll(".item")
        .remove();

    //содздание div-контейнера для каждого графика
    var div = d3.select("#vizdivSecondPart") //vizdiv - общий контейнер для всех графиков, внутри которого происходит пересортировка
        .selectAll(".item")
        .data(array);

    //создание svg в каждом div
    div.enter()
        .append("div")
        .attr("class", "item")
        .attr("id", function(d) {
            return d.key;
        })
        .append("svg") //реальные размеры svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g") //группа со смещением для графиков, осей и пр.
        .attr("class", "vizSecondPart")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //переменная для линии, области и подписей
    var lines = svg.append("g")
        .attr("class", "chart");

    //область    
    lines.append("path")
        .attr("class", "areaSecondPart")
        .style("pointer-events", "none") //нечувствительна к движениям курсора
        .attr("d", function(d) {
            return areaSecondPart(d.values);
        });

    //линия
    lines.append("path")
        .attr("class", "lineAll")
        .style("pointer-events", "none")
        .attr("d", function(d) {
            return lineSecondPart(d.values);
        });

    //подпись
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
        .attr("class", "lastValueSecondPart")
        .attr("y", function(d) {
            return ySecondPart(d.value.val);
        })
        .attr("x", function(d) {
            return xSecondPart(d.value.year) + 12;//отступ, чтобы надпись читалаcь и при нисходящем тренде
        })
        .style("text-anchor", "middle")
        .attr("dy", -8)
        .text(function(d) {
            return d.value.val;
        });

    //ось у
    svg.append("g")
        .attr("class", "ySecondPart axis")
        .call(yAxisSecondPart);

    //ось х
    svg.append("g")
        .attr("class", "xSecondPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisSecondPart);
    
    
     //задание значения последнего года для каждого div-контейнера в качестве аттрибута для сортировки
    d3.selectAll(".item")
        .datum(function(d) { //не data!
            return {
                value: d.values[d.values.length - 1] 
            };
        })
        .attr("lastYearValue", (function(d) {
            return d.value.val;
        }))
        .attr("eu", function(d) { //для подстветки стран по признаку членства
            return d.value.eu
        })

   
    sort();
    
    function sort()
    {return tinysort("#vizdivSecondPart>div", {attr:"lastYearValue", order:"desc"})}

}

function getCountryName(x) {
    var countryName = x.getAttribute("country");
    drawSecondPart(countryName);
    
}

function drawSecondPart(newCountry) {
    
    var nested = d3.nest()
        .key(function(d) {
            return d.country;
        })
        .map(dataset);
        
    var series = newCountry; //выбор набора данных в меню

    //создание массива по выбранной статье затрат для каждой страны 
    //пример - http://bl.ocks.org/natemiller/20f9bd99d1795e3a0b1c
    //ключ - страна
    var data = nested[series];
      
    var array = d3.nest()
        .key(function(d) {
            return d.item;
        })
        .entries(data);

    console.log(array); //вывод рабочего набора данных
    
    var addNewCountry = d3.select("#vizdivSecondPart")
    .selectAll(".vizSecondPart")
    .data(array)
    
    
    addNewCountry.append("path")
        .attr("class", "lineEU")
        .style("pointer-events", "none")
        .attr("d", function(d) {
            return lineSecondPart(d.values);
        });    
}
