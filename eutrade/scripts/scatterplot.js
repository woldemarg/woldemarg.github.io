/*jslint plusplus:true*/

function Scatterplot(data) {
    "use strict";

    // margins 
    var margin = {
            top: 15,
            right: 35,
            bottom: 15,
            left: 35
        },

        div_width = document.getElementById("my_scatterplot")
        .offsetWidth,

        width = div_width - margin.left - margin.right,
        height = div_width - margin.top - margin.bottom,

        // variables    
        anim_duration = 1000,

        format_number1 = d3.format(".1f"),

        format_number2 = d3.format(".2f"),

        add_plus_sign = function (n) {
            return (n > 0) ? "+" + n + "&nbsp;&nearr;" : n + "&nbsp;&searr;";
        },

        calc_grid_ticks = function (spaces, ticks) {
            var new_ticks = [],
                i,
                g;
            for (i = 0; i < ticks.length - 1; i++) {
                g = (ticks[i + 1] - ticks[i]) / spaces;
                new_ticks.push(ticks[i] + g, ticks[i] + 2 * g, ticks[i] + 3 * g);
            }
            return new_ticks;
        },

        axis_ticks = [0.05, 0.1, 0.2, 0.4, 0.8, 1.6, 3.2, 6.4],

        grid_ticks = calc_grid_ticks(4, axis_ticks),

        colors = {
            imp: "#2A6D70",
            exp: "#B97A44" 
        },

        // log scales
        x_scale = d3.scaleLog()
            .base(2)
            .range([0, width]),

        y_scale = d3.scaleLog()
            .base(2)
            .range([height, 0]),

        // axes and text labels        
        y_axis = d3.axisLeft(y_scale)
            .tickValues(axis_ticks)
            .tickFormat(function (d) {
                return format_number2(d);
            })
            .tickSize(-width)
            .tickSizeOuter(0)
            .tickPadding(5),

        x_axis = d3.axisBottom(x_scale)
            .tickValues(axis_ticks)
            .tickFormat(function (d) {
                return format_number2(d);
            })
            .tickSize(-height)
            .tickSizeOuter(0),

        y_gridlines = d3.axisLeft(y_scale)
            .tickValues(grid_ticks)
            .tickFormat("")
            .tickSize(-6),

        x_gridlines = d3.axisBottom(x_scale)
            .tickValues(grid_ticks)
            .tickFormat("")
            .tickSize(-6),

        // d3's line generator
        line = d3.line()
            .curve(d3.curveBasis)
            .x(function (d) {
                return x_scale(d.exp);
            })
            .y(function (d) {
                return y_scale(d.imp);
            }),

        // https://github.com/Caged/d3-tip 
        tip = d3.tip()
            .attr("class", "d3-tip")
            .direction("se")
            .attr("id", "country_tip")
            .html(function (d) {
                return "<span style='float:left;'><strong>" + d.values[0].ukr + "</strong> (млн USD)</span><br><br><span style='float:left;'>&#160;експорт&#160;&#160;</span><span style='float:right;'>" + add_plus_sign(format_number1((d.values[1].exp - d.values[0].exp) * 1000)) + "</span><br><span style='float:left;'>&#160;імпорт&#160;&#160;</span><span style='float:right;'>" + add_plus_sign(format_number1((d.values[1].imp - d.values[0].imp) * 1000)) + "</span>";                
            }),

        // add SVG to the page
        svg = d3.select("#my_scatterplot")
            .append("svg")
            .attr("id", "my_svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),

        // gradients        
        defs = svg.append("defs"),

        // group for tooltip and droplines 
        tooltip_group = svg.append("g")
            .attr("class", "my_tips");

    svg.call(tip);

    defs.append("linearGradient")
        .attr("id", "svgGradient_country_exp")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad")
        .selectAll("stop")
        .data([{
            offset: "0%",
            color: d3.rgb(colors.exp)
                    .brighter(1),
            opacity: 0.05
        },
            {
                offset: "100%",
                color: d3.rgb(colors.exp)
                    .darker(1),
                opacity: 1
            }])
        .enter()
        .append("stop")
        .attr("offset", function (d) {
            return d.offset;
        })
        .attr("stop-color", function (d) {
            return d.color;
        })
        .attr("stop-opacity", function (d) {
            return d.opacity;
        });

    defs.append("linearGradient")
        .attr("id", "svgGradient_country_imp")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad")
        .selectAll("stop")
        .data([{
            offset: "0%",
            color: d3.rgb(colors.imp)
                    .brighter(1),
            opacity: 0.05
        },
            {
                offset: "100%",
                color: d3.rgb(colors.imp)
                    .darker(1),
                opacity: 1
            }])
        .enter()
        .append("stop")
        .attr("offset", function (d) {
            return d.offset;
        })
        .attr("stop-color", function (d) {
            return d.color;
        })
        .attr("stop-opacity", function (d) {
            return d.opacity;
        });

    defs.append("linearGradient")
        .attr("id", "svgGradient_legend")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad")
        .selectAll("stop")
        .data([{
            offset: "0%",
            color: "#7F8590",
            opacity: 0.05
        },
            {
                offset: "100%",
                color: "#3A3F4A",
                opacity: 1
            }])
        .enter()
        .append("stop")
        .attr("offset", function (d) {
            return d.offset;
        })
        .attr("stop-color", function (d) {
            return d.color;
        })
        .attr("stop-opacity", function (d) {
            return d.opacity;
        });

    this.draw = function () {

        var countries = d3.nest()
            .key(function (d) {
                return d.partner;
            })
            .entries(data),

            // calculating limits to get equal axes (1:1)  
            imp_lims = d3.extent(data, function (d) {
                return d.imp;
            }),

            exp_lims = d3.extent(data, function (d) {
                return d.exp;
            }),

            limits = imp_lims.concat(exp_lims);

        countries.forEach(function (obj) {
            return obj.values[1].exp - obj.values[1].imp > 0 ?
                    obj.status = "exp" :
                    obj.status = "imp";
        });

        var country_status = d3.nest()
            .key(function (d) {
                return d.status;
            })
            .entries(countries);

        country_status[0].ukr = "негативне сальдо";
        country_status[1].ukr = "позитивне сальдо";

        x_scale.domain([d3.min(limits), d3.max(limits)])
            .nice();
        y_scale.domain([d3.min(limits), d3.max(limits)])
            .nice();

        // calling x axis in a group tag
        svg.append("g")
            .attr("class", "axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis)
            .append("text")
            .attr("class", "label-x")
            .attr("x", width)
            .attr("y", -15)
            .style("text-anchor", "end")
            .text("Експорт в ЄС");

        svg.append("g")
            .attr("class", "grid-x")
            .attr("transform", "translate(0," + height + ")")
            .call(x_gridlines);

        // calling y axis in a group tag
        svg.append("g")
            .attr("class", "axis-y")
            .call(y_axis)
            .append("text")
            .attr("class", "label-y")
            .attr("transform", "rotate(-90)")
            .attr("y", 15)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Імпорт з ЄС");

        svg.append("g")
            .attr("class", "grid-y")
            .call(y_gridlines);

        tooltip_group.append("line")
            .attr("class", "sep_line")
            .attr("x1", x_scale(d3.min(limits)))
            .attr("y1", y_scale(d3.min(limits)))
            .attr("x2", x_scale(d3.max(limits)))
            .attr("y2", y_scale(d3.max(limits)));

        tooltip_group.append("text")
            .attr("id", "label")
            .attr("x", x_scale(d3.max(limits)))
            .attr("y", y_scale(d3.max(limits)))
            .attr("dx", -10)
            .attr("dy", 10)
            .html("експорт = імпорт")
            .attr("transform", function () {
                return "rotate(-47 " + (Math.round(x_scale(d3.max(limits)) + this.getComputedTextLength() / 2)) + "," + (Math.round(y_scale(d3.max(limits)) + this.getComputedTextLength())) + ")";
            });

        tooltip_group.append("circle")
            .attr("id", "tip_point")
            .attr("cx", x_scale(d3.min(limits)))
            .attr("cy", y_scale(d3.max(limits)));

        var nodes = svg.append("g")
            .attr("class", "nodes");

        nodes.selectAll("country_line")
            .data(countries)
            .enter()
            .append("path")
            .attr("class", "country_line")
            .attr("d", function (d) {
                return line(d.values);
            })
            .attr("stroke", function (d) {
                return "url(#svgGradient_country_" + d.status + ")";
            })
            .attr("id", function (d) {
                return d.key;
            });

        var legend = svg.append("g")
            .attr("class", "legend_scatterplot");

        legend.append("line")
            .attr("class", "legend_line")
            .attr("x1", x_scale(2.4))
            .attr("y1", y_scale(0.1))
            .attr("x2", x_scale(4.8))
            .attr("y2", y_scale(0.101)) // для использования градиента линия не должна быть идеально ровной           
            .attr("stroke", "url(#svgGradient_legend)");

        legend.append("text")
            .attr("x", x_scale(2.4))
            .attr("y", y_scale(0.1))
            .attr("dx", -3)
            .attr("dy", 5)
            .style("text-anchor", "end")
            .text("2013");

        legend.append("text")
            .attr("x", x_scale(4.8))
            .attr("y", y_scale(0.101))
            .attr("dx", 3)
            .attr("dy", 5)
            .style("text-anchor", "start")
            .text("2016");

        var legend_item = legend.selectAll(".item")
            .data(country_status)
            .enter()
            .append("g")
            .attr("class", "item")
            .attr("transform", function (d, i) {
                return "translate(0," + (height * 0.65 + i * 15) + ")";
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

    this.show_tips = function (element) {

        var country_data = d3.select("path#" + element.id)
            .datum(),

            y2013_data = country_data.values[0],
            y2016_data = country_data.values[1],

            // https://stackoverflow.com/questions/17781472/how-to-get-a-subset-of-a-javascript-objects-properties
            values_2013_2013 = (({
                exp,
                imp
            }) => ({
                exp,
                imp
            }))(y2013_data),
            values_2016_2016 = (({
                exp,
                imp
            }) => ({
                exp,
                imp
            }))(y2016_data),

            values_2016_null = {
                exp: values_2016_2016.exp,
                imp: d3.min(y_scale.domain())
            },
            values_2013_null = {
                exp: values_2013_2013.exp,
                imp: d3.min(y_scale.domain())
            },
            values_null_2016 = {
                exp: d3.min(x_scale.domain()),
                imp: values_2016_2016.imp
            },
            values_null_2013 = {
                exp: d3.min(x_scale.domain()),
                imp: values_2013_2013.imp
            },

            v_poly_values = [],
            h_poly_values = [];

        v_poly_values.push(values_2013_2013);
        v_poly_values.push(values_2016_2016);
        v_poly_values.push(values_2016_null);
        v_poly_values.push(values_2013_null);

        h_poly_values.push(values_2013_2013);
        h_poly_values.push(values_2016_2016);
        h_poly_values.push(values_null_2016);
        h_poly_values.push(values_null_2013);

        // https://stackoverflow.com/questions/13204562/proper-format-for-drawing-polygon-data-in-d3
        function make_poly(d) {
            return d.map(function (d) {
                return [x_scale(d.exp), y_scale(d.imp)].join(",");
            })
                .join(" ");
        }

        var v_poly_points = make_poly(v_poly_values),
            h_poly_points = make_poly(h_poly_values);

        defs.append("linearGradient")
                .attr("id", "svgGradient_h_dropline")
                .attr("x1", "125%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "0%")
                .attr("spreadMethod", "pad")
                .selectAll("stop")
                .data([{
                offset: "0%",
                color: colors[country_data.status],
                opacity: 0.15
            },
                    {
                    offset: "100%",
                    color: "#FFB0AE",
                    opacity: 0.15
                }])
                .enter()
                .append("stop")
                .attr("offset", function (d) {
                return d.offset;
            })
                .attr("stop-color", function (d) {
                return d.color;
            })
                .attr("stop-opacity", function (d) {
                return d.opacity;
            });

        defs.append("linearGradient")
                .attr("id", "svgGradient_v_dropline")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "75%")
                .attr("spreadMethod", "pad")
                .selectAll("stop")
                .data([{
                offset: "0%",
                color: colors[country_data.status],
                opacity: 0.15
            },
                    {
                    offset: "100%",
                    color: "#FFB0AE",
                    opacity: 0.15
                }])
                .enter()
                .append("stop")
                .attr("offset", function (d) {
                return d.offset;
            })
                .attr("stop-color", function (d) {
                return d.color;
            })
                .attr("stop-opacity", function (d) {
                return d.opacity;
            });

        tooltip_group.append("polygon")
            .attr("class", "v_dropline")
            .attr("points", v_poly_points)
            .attr("fill", "url(#svgGradient_v_dropline)")
            .attr("opacity", 0)
            .transition()
            .duration(anim_duration / 4)
            .attr("opacity", 1);

        tooltip_group.append("polygon")
            .attr("class", "h_dropline")
            .attr("points", h_poly_points)
            .attr("fill", "url(#svgGradient_h_dropline)")
            .attr("opacity", 0)
            .transition()
            .duration(anim_duration / 4)
            .attr("opacity", 1);

        d3.selectAll(".country_line")
            .filter(function (d) {
                return d.key !== element.id;
            })
            .classed("dim_line", true);

        var rgba = d3.rgb(colors[country_data.status]);
        
        rgba.opacity = 0.7;

        document.getElementById("country_tip")
            .style.background = rgba;
        //console.log (rgba)

        // http://bl.ocks.org/rpgove/f2abb9b4acaec88f099b
        tip.show(country_data, document.getElementById("tip_point"));
    };

    this.hide_tips = function () {

        d3.selectAll(".v_dropline")
            .remove();

        d3.selectAll(".h_dropline")
            .remove();

        d3.selectAll("#svgGradient_h_dropline")
            .remove();

        d3.selectAll("#svgGradient_v_dropline")
            .remove();

        d3.selectAll(".country_line")
            .classed("dim_line", false);

        tip.hide();
    };
}

function draw_scatterplot() {

    d3.csv("data/exim_absolute.csv", function (error, data) {

        if (error) {
            throw error;
        }

        data.forEach(function (d) {
            d.exp = +d.exp;
            d.imp = +d.imp;

        });

        exim_scatterplot = new Scatterplot(data);

        return exim_scatterplot.draw();
    });
}

draw_scatterplot();
