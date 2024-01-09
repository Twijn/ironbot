$(function() {
    $("form").on("submit", function() {
        if ($(this).find("input[checked=checked]").length === 0) {
            alert("You must select at least one server!");
            return false;
        }
    });
});
