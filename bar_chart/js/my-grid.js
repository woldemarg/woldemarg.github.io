var min_width = 767;

if ($(window)
        .width() >= min_width) {

    var stickyElements = document.getElementsByClassName("sticky"),

        my_navbar = document.getElementById("my_navbar"),
        my_title = document.getElementById("my_title"),
        my_chart = document.getElementById("my_chart"),
        nav_items = document.getElementById("nav_items"),
        my_footer = document.getElementById("my_footer"),

        viewport_h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - (my_navbar.offsetHeight),

        i;


    for (i = stickyElements.length - 1; i >= 0; i--) {
        Stickyfill.add(stickyElements[i]);
    }

    $("#my_chart").height(viewport_h * 0.85).css(
        "paddingTop",
        viewport_h * 0.15
    );

    var added_h = (Math.ceil($("#slides").height() / $("#my_chart").height()) * $("#my_chart").height()) - $("#slides").height();

    $("#empty").height(added_h + my_navbar.offsetHeight);
} else {
    alert("На жаль, на цьому пристрої Ви не побачите наш інтерактивний контент :(\nБудь ласка, спробуйте переглянути сторінку на комп'ютері!");
    $("#main_content").remove();
}
