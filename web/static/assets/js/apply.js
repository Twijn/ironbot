$(function() {
    $("select.user-select").on("change", function() {
        $(`.${$(this).attr("data-class")}`).hide();
        $(`.${$(this).attr("data-class")}[data-id=${$(this).val()}]`).show();
    });

    $("select.user-select").each(function(i,ele) {
        ele = $(ele);
        $(`.${ele.attr("data-class")}[data-id=${ele.val()}]`).show();
    });

    $("#rules-accept").on("change", function() {
        if (this.checked) {
            $("input[type=submit]").attr("disabled", null);
        } else {
            $("input[type=submit]").attr("disabled", "disabled");
        }
    })
});