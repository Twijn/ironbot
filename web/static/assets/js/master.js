$(function() {
    document.cookie = `return_uri=${window.location.pathname + window.location.search};path=/;`;

    $(".join-discord").on("click", function() {
        const alert = $(this).closest(".alert");
        $.post("/account/join", null, function(result) {
            if (result.ok) {
                alert.slideUp(200);
                const ele = $(`<div class="alert alert-success alert-fixed" style="display:none;"><strong>Success!</strong><br>We've successfully added you to The Illumindal Guild! Check Discord!</div>`);
                $("body").append(ele);
                ele.fadeIn(200);
                setTimeout(() => {
                    ele.fadeOut(200);
                }, 5000);
            } else {
                const ele = $(`<div class="alert alert-error alert-fixed" style="display:none;"><strong>Error!</strong><br>${result.error}</div>`);
                $("body").append(ele);
                ele.fadeIn(200);
                setTimeout(() => {
                    ele.fadeOut(200);
                }, 5000);
            }
        });
        return false;
    })

    $(".object h3[title]").click(function() {
        $(this).toggleClass("full-name");
    });
});
