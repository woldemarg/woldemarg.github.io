// https://pages.lip6.fr/Jean-Francois.Perrot/Constantine/Client/Fisheye/Fisheye.html

function make_big(d) {
    "use strict";
    return to_rem(d * 1.15);
}

function make_large(d) {
    "use strict";
    return to_rem(d * 1.3);
}

function bigger(thing) {
    "use strict";
    //D'abord l'objet lui-me^me
    thing.style.fontSize = make_large(panel_font);

    //Ensuite son plus proche pre'de'cesseur <span>
    var siblingElement = thing.previousSibling;
    while (siblingElement) {
        if (siblingElement.tagName === "LI") {
            siblingElement.style.fontSize = make_big(panel_font);
            break;
        }
        siblingElement = siblingElement.previousSibling;
    }

    //Ensuite son plus proche successeur <span>
    siblingElement = thing.nextSibling;
    while (siblingElement) {
        if (siblingElement.tagName === "LI") {
            siblingElement.style.fontSize = make_big(panel_font);
            break;
        }
        siblingElement = siblingElement.nextSibling;
    }
}

function normal(thing) { //me^me jeu
    "use strict";
    thing.style.fontSize = to_rem(panel_font);

    var siblingElement = thing.previousSibling;
    while (siblingElement) {
        if (siblingElement.tagName === "LI") {
            siblingElement.style.fontSize = to_rem(panel_font);
            break;
        }
        siblingElement = siblingElement.previousSibling;
    }

    siblingElement = thing.nextSibling;
    while (siblingElement) {
        if (siblingElement.tagName === "LI") {
            siblingElement.style.fontSize = to_rem(panel_font);
            break;
        }
        siblingElement = siblingElement.nextSibling;
    }
}
