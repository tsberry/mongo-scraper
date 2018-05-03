$(function () {
    $("#comment-form").submit(function (event) {
        event.preventDefault();
        var comment = $("textarea#comment-text").val().trim();
        var id = $(this).data("id");
        var body = {
            comment: comment,
            id: id
        };
        $.ajax("/api/comments", {type: "POST", data: body}).then(function (data) {
            console.log("HIHIHI");
            location.reload();
        });
    });
});