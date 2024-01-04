$(function() {
    $(".add").on("click", function() {
        $("#add-map").fadeToggle(200);
        return false;
    });

    $("#add-map").on("click", function(e) {
        const target = $(e.target);
        if (target.closest("form").length === 0) {
            $("#add-map").fadeOut(200);
            return false;
        }
    });

    $(".alert").on("click", function() {
        $(this).fadeOut(200);
        window.history.pushState(null, null, "/map");
    });
});
