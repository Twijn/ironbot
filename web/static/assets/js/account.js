$(function() {
    const latitude = $("#latitude");
    const longitude = $("#longitude");

    const map = L.map('map').setView([30,0], 1);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    function showLocation(data) {
        map.setView([data.latlng.latitude, data.latlng.longitude], 12);

        $("#search-location").val(data.formattedAddress);
        $("#save-location").attr("disabled", false);

        latitude.val(data.latlng.latitude);
        longitude.val(data.latlng.longitude);

        const popup = L.popup()
            .setLatLng([data.latlng.latitude, data.latlng.longitude])
            .setContent(data.formattedAddress)
            .openOn(map);
    }

    $("#search-location-form").on("submit", function() {
        pill("Searching for location...");
        $.get("/map/lookup/" + encodeURI($("#search-location").val()), function(result) {
            if (result?.ok) {
                pill("Location found!", "success", 3000);
                showLocation(result.data);
            } else {
                pill("Error: " + result.error, "danger", 5000);
            }
        });
        return false;
    });

    $("#save-location").on("click", function() {
        pill("Saving location...");
        $.ajax("map/save", {
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                latitude: $("#latitude").val(),
                longitude: $("#longitude").val(),
                name: $("#search-location").val(),
            }),
            dataType: "json",
            success: function(result) {
                if (result?.ok) {
                    pill("Location saved!", "success", 3000);
                    $("#delete-location").fadeIn(250);
                    showLocation(result.data);
                } else {
                    pill("Error: " + result.error, "danger", 5000);
                }
            }
        });
    });

    $("#delete-location").on("click", function () {
        $.ajax("map/delete", {
            type: "DELETE",
            dataType: "json",
            success: function(result) {
                if (result?.ok) {
                    pill("Location deleted!", "success", 3000);
                    latitude.val("");
                    longitude.val("");
                    $("#search-location").val("");
                    $("#delete-location").fadeOut(250);
                } else {
                    pill("Error: " + result.error, "danger", 5000);
                }
            }
        })
    });

    if (latitude.val() !== "" && longitude.val() !== "") {
        const lat = Number(latitude.val());
        const lng = Number(longitude.val());

        $("#save-location").attr("disabled", null);
        $("#delete-location").show();

        const point = L.marker([lat, lng]).addTo(map);
        point.bindPopup(`<strong>${$("#search-location").val()}</strong>`).openPopup();

        map.setView([lat, lng], 3);
    }

});
