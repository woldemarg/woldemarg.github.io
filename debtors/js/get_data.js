var opts = {
        lines: 12, // The number of lines to draw
        length: 25, // The length of each line
        width: 12, // The line thickness
        radius: 42, // The radius of the inner circle
        scale: 0.25, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        color: "#000", // #rgb or #rrggbb or array of colors
        opacity: 0.25, // Opacity of the lines
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        className: "spinner", // The CSS class to assign to the spinner
        top: "50%", // Top position relative to parent
        left: "50%", // Left position relative to parent
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        position: "absolute" // Element positioning
    },

    target = document.getElementById("my_table_div"),

    spinner = new Spinner(opts)
        .spin(target),

    min_width = $("#my_toolbar")
        .width() * 0.55,
    
    max_width = $(window)
        .innerWidth() - $("#my_input")
        .offset()
        .left - $("#my_toolbar")
        .offset()
        .left;

function checkScroll() {
    "use strict";
    
    var startY = $(".navbar")
        .height(); //The point where the navbar changes in px
    
    if ($(window)
            .scrollTop() > startY) {
        $(".navbar")
            .css("background", "rgba(51,51,50,0)");
        $("#logo_pic")
            .addClass("scrolled");
    
    } else {
        
        $(".navbar")
            .css("background", "rgb(51,51,50)");
        $("#logo_pic")
            .removeClass("scrolled");
    }
}

if ($(".navbar")
        .length > 0) {
    $(window)
        .on("scroll load resize", function () {
            "use strict";
            checkScroll();
        });
}

$(window)
    .resize(function () {
        "use strict";
        max_width = $(window)
            .innerWidth() - $("#my_input")
            .offset()
            .left - $("#my_toolbar")
            .offset()
            .left;
        min_width = $("#my_toolbar")
            .width() * 0.55;
        $("#my_input")
            .animate({
                width: min_width
            }, 200);
    });


$("#my_input")
    .css("width", min_width);

$("#my_table")
    .append("<tfoot><tr><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></tfoot>");

/* Formatting function for row details - modify as you need */
function format(d) {
    "use strict";
    return "<table cellpadding='5' cellspacing='0' border='0' style='padding-left:50px;'>" +
        "<tr>" +
        "<td><strong>Назва:</strong></td>" +
        "<td>" + d.name_fl + "</td>" +
        "</tr>" +
        "<tr>" +
        "<td><strong>Адреса:</strong></td>" +
        "<td>" + d.addr + "</td>" +
        "</tr>" +
        "<tr>" +
        "<td><strong>КВЕД:</strong></td>" +
        "<td>" + d.kved + "</td>" +
        "</tr>" +
        "</table>";
}

$(document)
    .ready(function () {
        "use strict";
        var table = $("#my_table")
            .DataTable({

                "sDom": "<'top'l>rt<'bottom'ip><'clear'>",

                "ajax": "data/data.json",

                "columnDefs": [
                    {
                        "targets": 0,
                        "data": null,
                        "class": "details-control",
                        "orderable": false,
                        "searchable": false,
                        "defaultContent": ""
                    },
                    {
                        "title": "ЄДРПОУ",
                        "targets": 1,
                        "data": "edrpou",
                        "orderable": false
                    },
                    {
                        "title": "Назва",
                        "targets": 2,
                        "data": "name",
                        "orderable": false
                    },
                    {
                        "title": "Керівник",
                        "targets": 3,
                        "data": "head",
                        "orderable": false
                    },
                    {
                        "targets": 4,
                        "data": "name_fl",
                        "visible": false
                    },
                    {
                        "targets": 5,
                        "data": "name_sh",
                        "visible": false
                    },
                    {
                        "title": "Регіон",
                        "targets": 6,
                        "data": "reg",
                        "orderable": false
                    },
                    {
                        "title": "Борг,&nbsp;тис.&nbsp;грн",
                        "targets": 7,
                        "data": "debt",
                        "render": $.fn.dataTable.render.number("&nbsp;"),
                        "className": "dt-right",
                        "searchable": false
                    }
                ],

                "order": [],

                "language": {
                    "lengthMenu": "Показати _MENU_ записів",
                    "zeroRecords": "записів не знайдено",
                    "info": "Записи з _START_ по _END_ із _TOTAL_",
                    "infoEmpty": "0 записів",
                    "infoFiltered": "(всього _MAX_ записів)",
                    "thousands": " ",
                    "paginate": {
                        "next": ">",
                        "previous": "<"
                    }
                },

                "lengthMenu": [10, 25, 50],

                "initComplete": function () {
                    this.api()
                        .columns([6])
                        .every(function () {
                            var column = this,
                                select = $("<select><option value=''></option></select>")
                                    .appendTo($(column.footer())
                                        .empty())
                                    .on("change", function () {
                                        var val = $.fn.dataTable.util.escapeRegex(
                                                $(this)
                                                        .val()
                                            );

                                        column
                                            .search(val ? "^" + val + "$" : "", true, false)
                                            .draw();
                                    });

                            column.data()
                                .unique()
                                .sort()
                                .each(function (d, j) {
                                    select.append("<option value='" + d + "'>" + d + "</option>");
                                });
                        });

                    spinner.stop();

                    $("#my_table")
                        .show();
                }
            });

        // Add event listener for opening and closing details
        $("#my_table tbody")
            .on("click", "td.details-control", function () {
                var tr = $(this)
                    .parents("tr"),
                    row = table.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass("shown");
                } else {
                    // Open this row
                    row.child(format(row.data()))
                        .show();
                    tr.addClass("shown");
                }
            });

        $("#my_input")
            .on("keyup", function () {
                table.search(this.value)
                    .draw();
            })
            .focus(function () {
                $(this)
                    .animate({
                        width: max_width
                    }, 500);
            })
            .focusout(function () {
                $(this)
                    .animate({
                        width: min_width
                    }, 500);
            });

        $(function () {
            $("#clear_btn")
                .click(function () {
                    $("#my_input")
                        .val("");
                    table.search("")
                        .draw();
                });
        });
    });
