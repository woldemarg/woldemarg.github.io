d3.csv("data/portfolio.csv", function (error, data) {
    "use strict";

    if (error) {
        throw error;
    }

    data.sort(function (a, b) {
        return d3.descending(a.date, b.date);
    });


    var section = d3.select(".projects"),

        items = section.selectAll(".item")
            .data(data)
            .enter()
            .append("div")
            .attr("class", "item"),

        figures = items.append("figure")
            .attr("class", "project");

    figures.append("img")
        .attr("src", function (d) {
            return "img/" + d.id + ".png";
        })
        .attr("class", "img-fluid");

    var figcaptions = figures.append("figcaption");

    figcaptions.append("h2")
        .html(function (d) {
            return d.header;
        });

    figcaptions.append("p")
        .html(function (d) {
            return d.description;
        });

    figcaptions.append("a")
        .attr("href", function (d) {
            return d.link;
        })
        .attr("target", "_blank");



    items.append("div")
        .attr("class", "project_title")
        .html(function (d) {return d.date + " <i aria-hidden='true' class='fa fa-calendar'></i>" + " | " + d.title;
        });


});