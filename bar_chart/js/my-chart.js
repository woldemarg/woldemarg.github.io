function type(d) {
    "use strict";
    Object.keys(d)
        .forEach(function (prop) {
            if (prop !== "reg") {
                d[prop] = +d[prop];
            }
        });
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
        .duration(time)
        .call(d3.axisRight(y)
            .ticks(5)
            .tickFormat(d3.format(".0d")))
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

function add_lines() {

    "use strict";

    var lines = g.selectAll(".exp_line")
        .data(exp),

        labels = g.selectAll(".label")
        .data(exp);

    lines.enter()
        .append("line")
        .attr("class", "exp_line")
        .attr("opacity", 0)
        .attr("x1", 0)
        .attr("y1", height)
        .attr("x2", width)
        .attr("y2", height)
        .merge(lines)
        .transition()
        .delay(function (d, i) {
            return i / exp.length * time / 2;
        })
        .duration(time)
        .attr("opacity", 1)
        .attr("x1", 0)
        .attr("y1", function (d) {
            return y(d.val);
        })
        .attr("x2", width)
        .attr("y2", function (d) {
            return y(d.val);
        });

    labels.enter()
        .append("text")
        .attr("class", "label")
        .attr("opacity", 0)
        .attr("x", 10)
        .attr("y", height)
        .attr("dy", ".95em")
        .merge(labels).transition()
        .delay(function (d, i) {
            return i / exp.length * time / 2;
        })
        .duration(time)
        .attr("opacity", 1)
        .attr("y", function (d) {
            return y(d.val);
        })
        .text(function (d) {
            return d.nam;
        });

    d3.selectAll("rect")
        .classed("opac", true);
}

function remove_lines() {

    "use strict";

    var lines = g.selectAll(".exp_line"),
        labels = g.selectAll(".label");

    lines.transition()
        .delay(function (d, i) {
            return i / exp.length * time / 2;
        })
        .duration(time)
        .attr("opacity", 0)
        .attr("x1", 0)
        .attr("y1", height)
        .attr("x2", width)
        .attr("y2", height);

    lines.exit()
        .remove();

    labels.transition()
        .delay(function (d, i) {
            return i / exp.length * time / 2;
        })
        .duration(time)
        .attr("opacity", 0)
        .attr("x", 10)
        .attr("y", height);

    labels.exit()
        .remove();

    d3.selectAll("rect")
        .classed("opac", false);
}

if ($(window)
    .width() >= 767) {

    var svg = d3.select("#my_chart")
        .append("svg")
        .attr("width", my_chart.offsetWidth)
        .attr("height", viewport_h * 0.7),

        margin = {
            top: 15,
            right: 40,
            bottom: 105,
            left: 25
        },

        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,

        x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1),
        y = d3.scaleLinear()
        .rangeRound([height, 0]),

        g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),

        yAxis = g.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + width + ", 0)"),

        xAxis = g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")"),

        time = 750,

        exp = [
            {
                nam: "ЖКГ",
                val: 403
    },
            {
                nam: "дороги",
                val: 719
    },
            {
                nam: "медицина",
                val: 2145
    }
],

        new_key,
        raw;

    d3.csv("data/data.csv", type, function (error, csv) {

        "use strict";

        if (error) {
            throw error;
        }

        raw = csv;

        raw.sort(function (a, b) {
            return a.sum - b.sum;
        });

        x.domain(raw.map(function (d) {
            return d.reg;
        }));

        xAxis.call(d3.axisBottom(x)
                .tickSizeOuter([0]))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.25em")
            .attr("transform", "rotate(-70)");

        new_key = "sum";

        update_yAxis(new_key);
        add_bars(new_key);
    });
}
