d3.csv('data/table.csv', function (error, data) {

    "use strict";

    if (error) {
        throw error;
    }

    function makeTable(tfilter) {

        d3.selectAll(".table")
            .remove();

        // The table generation function
        var columns = ["#", "Дата", "Платник", "Одержувач", "Призначення", "Сума"],

            table = d3.select(".table-responsive")
            .append("table")
            .attr("class", "table table-striped table-condensed"),

            thead = table.append("thead"),
            tbody = table.append("tbody");

        // append the header row
        thead.append("tr")
            .selectAll("th")
            .data(columns)
            .enter()
            .append("th")
            .text(function (column) {
                return column;
            });

        // create a row for each object in the data
        var rows = tbody.selectAll("tr")
            .data(data)
            .enter()
            .append("tr")
            .filter(function (d) {
                return d.mistrust === tfilter;
            }),

            // create a cell in each row for each column
            cells = rows.selectAll("td")
            .data(function (row) {
                return columns.map(function (column) {
                    return {
                        column: column,
                        value: row[column]
                    };
                });
            })
            .enter()
            .append("td")
            .html(function (d) {
                return d.value;
            });
    }

    $(function () {

        // Enabling Popover Example 2 - JS (hidden content and title capturing)
        $("[data-toggle=popover]")
            .popover({

                html: true,
                container: "body",
                content: function () {
                    var tfilter = $(this)
                        .attr("id");
                    makeTable(tfilter);
                    return $('#myPopoverBody')
                        .html();
                },
                title: function () {
                    return $('#myPopoverTitle')
                        .html();
                }
            });
    });
});
