const userHtml = `<div class="object user user-discord" data-id="::id">
    <img src="::avatarUrl" alt="Avatar for ::username">
    <div class="info">
        <h3>
            ::username
        </h3>
        <div class="data">
            ::id
        </div>
    </div>
</div>`;

function getUserHtml(id, username, avatarUrl, location) {
    return userHtml
        .replace(/::id/g, id)
        .replace(/::username/g, username)
        .replace(/::avatarUrl/g, avatarUrl)
        .replace(/::location/g, location);
}

$(function () {
    const map = L.map('map').setView([30,0], 2);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    $.get("/map/json", function(data) {
        data.forEach(loc => {
            const marker = L.marker(loc.location.latlng).addTo(map);
            let html = `<h3 style="text-align:center;">${loc.location.name}</h3>`;
            loc.discordUsers.forEach(user => {
                html += getUserHtml(user.id, user.username, user.avatarUrl, loc.location.name);
            });
            marker.bindPopup(html);
        });
    });

});