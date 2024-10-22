let pillContainer = null;

let to = null;

/**
 *
 * @param {string} text
 * @param {"info"|"success"|"danger"} style
 * @param {*} timeout
 */
function pill(text, style = "info", timeout = null) {
    const pill = $(`<div class="pill alert"></div>`);
    const waitToShow = pillContainer.html() !== "";

    pill.addClass("alert-" + style);
    pill.text(text);

    pillContainer.addClass("out");

    clearTimeout(to);

    const hide = function() {
        clearTimeout(to);

        pillContainer.addClass("out");
        setTimeout(function() {
            pillContainer.html("");
        }, 250);
    }

    setTimeout(function() {
        pillContainer.html(pill);
        pillContainer.removeClass("out");

        if (timeout) {
            to = setTimeout(hide, timeout);
        }
    }, waitToShow ? 250 : 50);

    return hide;
}

$(function() {
    pillContainer = $(`<div class="pill-container"></div>`);
    $("body").append(pillContainer);
});
