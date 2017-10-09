/*jslint plusplus: true*/

function Stepchart(data) {
    "use strict";

    // margins 
    var margin = {
            top: 15,
            right: 35,
            bottom: 40,
            left: 35
        },

        div_width = document.getElementById("my_scatterplot").offsetWidth,

        width = div_width - margin.left - margin.right,
        height = div_width - margin.top - margin.bottom,

        format_number = function (n) {
            return n * 100;
        },

        add_plus_sign = function (n) {
            return (n > 0) ? "+" + n : n;
        },

        colors = {
            country_EU: "#71A3A6",
            average_EU: "#91211E"
        },

        x_scale = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0),

        y_scale = d3.scaleLinear()
            .rangeRound([height, 0]),

        // axes and text labels        
        y_axis = d3.axisRight(y_scale)
                .tickFormat(function (d) {
                var s = add_plus_sign(format_number(d));
                return this.parentNode.nextSibling ?
                        s :
                        s + "%";
            })
                .ticks(5)
                .tickSize(width),

        x_axis = d3.axisBottom(x_scale)
            .tickFormat(function (d) {
                return Math.max(document.documentElement.clientWidth, window.innerWidth || 0) >= 992 ? d : d.split(" ")[0];
            }),

        svg = d3.select("#my_stepchart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    this.draw = function () {

        var eu = data.filter(function (d) {
                return d.partner === "EU28";
            })
                .sort(function (a, b) {
                    return d3.descending(a.growth, b.growth);
                }),

            types = d3.nest()
                .key(function (d) {
                    return d.type;
                })
                .entries(data);

        types[0].ukr = "країна";
        types[1].ukr = "ЄС-28";


        x_scale.domain(eu.map(function (d) {
            return d.group;
        }));

        y_scale.domain(d3.extent(data, function (d) {
            return d.growth;
        }))
            .nice();

        // https://bl.ocks.org/mbostock/7555321
        function wrap(text, width) {
            text.each(function () {
                var text = d3.select(this),
                    words = text.text()
                        .split(/\s+/)
                        .reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.25, // ems
                    y = text.attr("y"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null)
                        .append("tspan")
                        .attr("x", 0)
                        .attr("y", y)
                        .attr("dy", dy + "em");
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node()
                            .getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan")
                            .attr("x", 0)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
                    }
                }
            });
        }


        svg.append("g")
            .attr("class", "axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis)
            .selectAll(".tick text")
            .call(wrap, x_scale.bandwidth() * 0.9);

        // https://bl.ocks.org/mbostock/4323929
        function custom_y_axis(g) {
            var s = g.selection ? g.selection() : g;
            g.call(y_axis);
            s.select(".domain").remove();
            s.selectAll(".tick line").filter(function (d) {
                return d !== -1;
            }).attr("stroke-dasharray", "2,2");
            s.selectAll(".tick text").attr("x", 4).attr("dy", -4).attr("dx", -margin.right);
            if (s !== g) {
                g.selectAll(".tick text").attrTween("x", null).attrTween("dy", null);
            }
        }


        svg.append("g")
            .attr("class", "axis--y")
            .call(custom_y_axis);

        var bars = svg.append("g")
            .attr("class", "bars");

        bars.selectAll(".bar")
            .data(data)
            .enter()
            .append("line")
            .attr("class", "bar")
            .attr("id", function (d) {
                return d.partner;
            })
            .attr("x1", function (d) {

                return x_scale(d.group);

            })
            .attr("y1", function (d) {
                return y_scale(d.growth);
            })
            .attr("x2", function (d) {
                return x_scale(d.group) + x_scale.bandwidth();
            })
            .attr("y2", function (d) {
                return y_scale(d.growth);
            })
            .attr("stroke", function (d) {
                return colors[d.type];
            });

        svg.append("line")
            .attr("class", "zero_line")
            .attr("x1", 0)
            .attr("y1", y_scale(0))
            .attr("x2", width)
            .attr("y2", y_scale(0));

        var legend = svg.append("g")
            .attr("class", "legend_stepchart"),

            legend_item = legend.selectAll(".item")
            .data(types)
            .enter()
            .append("g")
            .attr("class", "item")
            .attr("transform", function (d, i) {
                return "translate(0," + (height * 0.05 + i * 15) + ")";
            });

        legend_item.append("rect")
            .attr("x", width - 12)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", function (d) {
                return colors[d.key];
            });

        legend_item.append("text")
            .attr("x", width - 18)
            .attr("y", 6)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) {
                return d.ukr;
            });
    };

    this.show_bars = function (element) {

        d3.selectAll(".bar")
            .filter(function (d) {
                return d.partner !== element.id && d.partner !== "EU28";
            })
            .classed("dim_bar", true);
    };

    this.hide_bars = function () {

        d3.selectAll(".bar")
            .classed("dim_bar", false);

    };
}

function draw_stepchart() {

    d3.csv("data/export_growth.csv", function (error, data) {

        if (error) {
            throw error;
        }

        data.forEach(function (d) {
            d.growth = +d.growth;
            d.type = d.partner !== "EU28" ? "country_EU" : "average_EU";
        });

        export_stepchart = new Stepchart(data);

        return export_stepchart.draw();
    });
}

draw_stepchart();