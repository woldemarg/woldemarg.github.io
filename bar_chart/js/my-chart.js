var svg = d3.select("svg"),
    margin = {
        top: 20,
        right: 40,
        bottom: 90,
        left: 40
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.1),
    y = d3.scaleLinear()
    .rangeRound([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var yAxis = g.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(" + width + ", 0)");

var xAxis = g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")");

var time = 1000;

var new_key,
    raw;

function type(d) {
    "use strict";
    d.dead = +d.dead;
    d.full = +d.full;
    return d;
}

function filter_by_key(obj, key) {
    "use strict";
    var arr = [];
    obj.forEach(function (el) {
        var item = {};
        Object.keys(el)
            .forEach(function (prop) {
                if (prop === key) {
                    item.value = el[prop];
                    item.reg = el.reg;
                    arr.push(item);
                }
            });
    });
    return arr;
}

function update_yAxis(key) {
    "use strict";
    var data = filter_by_key(raw, key);
    y.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);
    yAxis.transition()
        .call(d3.axisRight(y)
            .ticks(4))
        .selectAll(".tick")
        .each(function (d, i) {
            if (d === 0) {
                this.remove();
            }
        });
}

function add_bars(key) {
    
    "use strict";
    
    var data = filter_by_key(raw, key),
        
        bars = g.selectAll("." + key)
            .data(data);

    bars.enter()
        .append("rect")
        .attr("class", key)
        .attr("x", function (d) {
            return x(d.reg);
        })
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .merge(bars)
        .transition()
        .delay(function (d, i) {
            return i / data.length * time / 2;
        })
        .duration(time)
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value);
        });
}

function remove_bars(key) {

    "use strict";
    
    var data = filter_by_key(raw, key),
        
        bars = g.selectAll("." + key);

    bars.transition()
        .delay(function (d, i) {
            return i / data.length * time / 2;
        })
        .duration(time)
        .attr("y", height)
        .attr("height", 0);

    bars.exit()
        .remove();
}

d3.csv("data/data.csv", type, function (error, csv) {

    "use strict";

    if (error) {
        throw error;
    }

    raw = csv;

    raw.sort(function (a, b) {
        return a.full - b.full;
    });
    
    x.domain(raw.map(function (d) {
        return d.reg;
    }));
    
    xAxis.call(d3.axisBottom(x)
        .tickSizeOuter([0]))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    
    new_key = "full";

    update_yAxis(new_key);
    add_bars(new_key);
});

/*d3.select("#add_dead")
    .on("click", function () {
        "use strict";
        new_key = "dead";
        add_bars(new_key);
    });
d3.select("#add_full")
    .on("click", function () {
        "use strict";
        new_key = "full";
        add_bars(new_key);
    });

d3.select("#remove_dead")
    .on("click", function () {
        "use strict";
        new_key = "dead";
        remove_bars(new_key);
    });

d3.select("#remove_full")
    .on("click", function () {
        "use strict";
        new_key = "full";
        remove_bars(new_key);
    });*/