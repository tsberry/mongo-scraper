$(function () {
    $("#scraper").on("click", function (event) {
        $.post("/api/scrape").then(function (data) {
            location.reload();
        });
    });
});