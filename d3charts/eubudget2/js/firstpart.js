//размеры графиков
var width = 145;

var height = 120;

var margin = {
    top: 15,
    right: 30,
    bottom: 47,
    left: 25
};


//переменные для функций выбора старых и новых членов ЕС
var checkboxBulgaria = document.getElementById("Bulgaria");
var checkboxLithuania = document.getElementById("Lithuania");
var checkboxRomania = document.getElementById("Romania");
var checkboxFinland = document.getElementById("Finland");
var checkboxFrance = document.getElementById("France");
var checkboxSweden = document.getElementById("Sweden");

//исходный набр данных
var datasetFirstPart;

var xFirstPart = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.05);

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

//загрузка исходных данных
d3.csv("firstpart.csv", function (d) { //type - предварительная обработка данных
    datasetFirstPart = d; //присвоение имени
    redrawFirstPart(); //вызов основной функции
});


//основная функция
//преобразование исходных данных в массив по типам расходов - option
//пример - http://bl.ocks.org/nsonnad/4175202            
function redrawFirstPart() {
    
    datasetFirstPart.sort(function (a,b) {return d3.ascending (
        +a.val, +b.val)});
    //пересортировка исходного набора по статьям затрат (option)
    var array = d3.nest()
        .key(function (d) {
            return d.year;
        })
        .entries(datasetFirstPart);
    
        

    console.log(array)

    var countriesNames = d3.nest()
        .key(function (d) {
            return d.country
        })
        .map(datasetFirstPart);

    console.log(countriesNames)

    //определение диапазона    

    xFirstPart.domain(datasetFirstPart.map(function (d) {
        return d.abbr;
    }));
    //автоматический дипазон - каждый раз меняется при выбореновой статьи затрат, но один для всех стран. вводит в заблуждение при сравнении уровней по разным затратам, так как шкала каждый раз меняется   
    yFirstPart.domain([0, d3.max(array, function (c) {
        return d3.max(c.values, function (v) {
            return +v.val;
        });
    })]);

    //обязательная очистка контейнеров от старых графиков
    d3.select("body")
        .selectAll(".year")
        .remove();

    
    //содздание div-контейнера для каждого графика
    var div = d3.select("#vizdivFirstPart") //vizdiv - общий контейнер для всех графиков, внутри которого происходит пересортировка
        .selectAll(".year")
        .data(array);

    //создание svg в каждом div
    div.enter()
        .append("div")
        .attr("class", "year")
        .append("svg") //реальные размеры svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = div.select("svg")
        .append("g") //группа со смещением для графиков, осей и пр.
        .attr("class", "viz")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //переменная для линии, области и подписей
    var bars = svg.append("g")
        .attr("class", "chart")

    bars.append("text")
        .attr("id", "label")
        .attr("class", "hidden")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", 20)

    bars.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    function mouseover() {

        d3.selectAll(".axis.xFirstPart text")
            .classed("hidden", true);
        d3.selectAll("#label")
            .classed("hidden", false);

        //скрываем подпись оси

        return mousemove.call(this);
    }

    function mousemove() {
        var xPos = d3.mouse(this)[0];
        var leftEdges = xFirstPart.range();
        var width = xFirstPart.rangeBand();
        var count = _.size(countriesNames);
        var i;
        var countries = {};
        //важно! количестов итераций - по количеству членов массива!
        _.each(_.range(count), function (i) {
            countries[leftEdges[i]] = d3.keys(countriesNames)[i];
        });

        d3.selectAll("#bar")
            .style('fill', "#FAA61A");
        d3.selectAll('#caption')
            .style('display', 'none')

        for (i = 0; xPos > (leftEdges[i] + width); i++) {}
        if (leftEdges[i] !== undefined) {
            var country = countries[leftEdges[i]];
            d3.selectAll(".col-" + country)
                .style('fill', "#CE8A14");//цвет выделения столбика
            d3.selectAll('.cap-' + country)
                .style('display', 'block');
            d3.selectAll('#label')
                .text(country);
        }
    }

    function mouseout() {
        d3.selectAll(".xFirstPart.axis text")
            .classed("hidden", false); //возвращаем подпись шкалы времени
        d3.selectAll("#bar")
            .style('fill', "#FAA61A");//возвращаем исходный цвет
        d3.selectAll("#label")
            .classed("hidden", true);
        d3.selectAll('#caption')
            .style('display', 'none')

    }

    //столбцы  
    bars.selectAll(".bar")
        .data(function (d) {
            return d.values
        })
        .enter()
        .append("rect")
        .attr("id", "bar")
        .attr("class", function (d) {
            return "col-" + d.country + " " + d.eu
        })
        .style("pointer-events", "none") //нечувствительна к движениям курсора  
        .attr("x", function (d) {
            return xFirstPart(d.abbr)
        })
        .attr("y", function (d) {
            return yFirstPart(d.val)
        })
        .attr("width", xFirstPart.rangeBand())
        .attr("height", function (d) {
            return height - yFirstPart(d.val)
        })

    bars.selectAll("#caption")
        .data(function (d) {
            return d.values
        })
        .enter()
        .append('text')
        .attr("text-anchor", "start")
        .attr('x', function (d) {
            return xFirstPart(d.abbr);
        })
        .attr('y', function (d) {
            return yFirstPart(d.val) - 5;
        })
        .attr('display', 'none')
        .attr('class', function (d) {
            return 'cap-' + d.country
        })
        .attr('id', 'caption')
        .text(function (d) {
            return d.val;
        });

    //подпись
    bars.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 20) //динамический отступ
        .text(function (d) {
            return d.key
        });
   
    var lineFirstPart = d3.svg.line()
      .x(function(d){return xFirstPart(d.abbr) +xFirstPart.rangeBand()/2})
      .y(function(d){return yFirstPart(+d.avg)});
    
    bars.append("path")
        .datum(function (d) {
            return d.values
        })
       .attr("class", "lineEU")
        .attr("d", lineFirstPart);
     
        
    
    
    bars.append ("text")
     .datum(function (d) {
            return d.values[d.values.length-1]
        })
    .attr("x", width + 3)
    .attr("y", function(d) {return yFirstPart(+d.avg)})
    .text("ЄС")
    
    
    

    //ось у
    svg.append("g")
        .attr("class", "yFirstPart axis")
        .call(yAxisFirstPart);

    //ось х
    svg.append("g")
        .attr("class", "xFirstPart axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisFirstPart)
     .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.5em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-70)" );

}


function addFrance() {
    
    if (checkboxFrance.checked) {
    
    
    datasetFirstPart.push ({year:"2004", country:"Франція", abbr:"Фра", eu: "old", order: "18", val: "9.1", avg: "8.3"})
    datasetFirstPart.push ({year:"2014", country:"Франція", abbr:"Фра", eu: "old", order: "18", val: "11.3", avg: "10.2"})
    
    }
    
    else {
        datasetFirstPart = _.reject(datasetFirstPart, function(el) { return el.country === "Франція"; });      
    
    }    
    redrawFirstPart ()
}

function addFinland() {
    
    if (checkboxFinland.checked) {
    
    
    datasetFirstPart.push ({year:"2004", country:"Фінляндія", abbr:"Фін", eu: "old", order: "17", val: "13", avg: "8.3"})
    datasetFirstPart.push ({year:"2014", country:"Фінляндія", abbr:"Фін", eu: "old", order: "17", val: "19.7", avg: "10.2"})
   
    
    }
    
    else {
        datasetFirstPart = _.reject(datasetFirstPart, function(el) { return el.country === "Фінляндія"; });      
    
    }    
    redrawFirstPart ()
}

function addSweden() {
    
    if (checkboxSweden.checked) {
    
   datasetFirstPart.push ({year:"2004", country:"Швеція", abbr:"Шве", eu: "old", order: "20", val: "17.6", avg: "8.3"})
   datasetFirstPart.push ({year:"2014", country:"Швеція", abbr:"Шве", eu: "old", order: "20", val: "25", avg: "10.2"})
    
    }
    
    else {
        datasetFirstPart = _.reject(datasetFirstPart, function(el) { return el.country === "Швеція"; });      
    
    }    
    redrawFirstPart ()
}

function addBulgaria() {
    
    if (checkboxBulgaria.checked) {
    
    datasetFirstPart.push ({year:"2004", country:"Болгарія", abbr:"Бол", eu: "new", order: "2", val: "0.9", avg: "8.3"})
   datasetFirstPart.push ({year:"2014", country:"Болгарія", abbr:"Бол", eu: "new", order: "2", val: "2.3", avg: "10.2"})
    
    }
    
    else {
        datasetFirstPart = _.reject(datasetFirstPart, function(el) { return el.country === "Болгарія"; });      
    
    }    
    redrawFirstPart ()
}

function addLithuania() {
    
    if (checkboxLithuania.checked) {
    
    
   datasetFirstPart.push ({year:"2004", country:"Литва", abbr:"Лит", eu: "new", order: "9", val: "1.8", avg: "8.3"})
   datasetFirstPart.push ({year:"2014", country:"Литва", abbr:"Лит", eu: "new", order: "9", val: "3.8", avg: "10.2"})
    
    }
    
    else {
        datasetFirstPart = _.reject(datasetFirstPart, function(el) { return el.country === "Литва"; });      
    
    }    
    redrawFirstPart ()
}

function addRomania() {
    
    if (checkboxRomania.checked) {
    
    
   datasetFirstPart.push ({year:"2004", country:"Румунія", abbr:"Рум", eu: "new", order: "13", val: "0.9", avg: "8.3"})
   datasetFirstPart.push ({year:"2014", country:"Румунія", abbr:"Рум", eu: "new", order: "13", val: "2.6", avg: "10.2"})
    
    }
    
    else {
        datasetFirstPart = _.reject(datasetFirstPart, function(el) { return el.country === "Румунія"; });      
    
    }    
    redrawFirstPart ()
}