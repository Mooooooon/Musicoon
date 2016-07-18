/**
 * rev-2.0.0
 * require jQuery.
 */
$(document).ready(function () {

    var tried = 0, jqXHRs = [];
    var audio = document.createElement("audio");
    var controller = document.querySelector("#controller");
    var topic = document.querySelector("#topic");
    var cover = document.querySelector("#cover");
    var upper = document.querySelector("#cover .upper");
    var elapsed = document.querySelector("#progress .elapsed");
    var detail = document.querySelector("#detail");
    var home = controller.querySelector(".home");
    var next = controller.querySelector(".next");
    var img = cover.querySelector(".lower img");
    var fa = upper.querySelector(".fa");
    var title = detail.querySelector(".title");
    var artist = detail.querySelector(".artist");
    var preset = {
        trial: 3,
        cache: 3,
        volume: 0.5,
        url: "search.php",
        size: "?param=360y360",
        source: "https://github.com/Aqours/ZzzFM",
        load: function () {
            this._ajax(true).done(this._init);
            this._fill();
        },
        next: function () {
            audio.pause();
            if (!jqXHRs.length) this._fill();
            jqXHRs.shift().done(function follow(data) {
                if (!this._check(data)) {
                    if (jqXHRs.length) jqXHRs.shift().done(follow);
                    return;
                }
                this._render(data);
                audio.play();
            });
            this._fill();
        },
        _ajax: function (isInit) {
            var jqXHR = $.ajax({
                url: this.url,
                context: this,
                cache: false,
                dataType: "json"
            });
            if (!isInit) jqXHRs.push(jqXHR);
            return jqXHR;
        },
        _init: function (data) {
            if (!this._check(data)) {
                if (jqXHRs.length) jqXHRs.shift().done(this._init);
                return;
            }
            this._render(data);
            $(audio).on({
                "playing": function () {
                    $(cover).attr("data-running", true);
                    $(fa).removeClass("fa-play").addClass("fa-pause");
                },
                "pause": function () {
                    $(cover).attr("data-running", false);
                    $(fa).removeClass("fa-pause").addClass("fa-play");
                },
                "ended": function () {
                    preset.next();
                },
                "timeupdate": function () {
                    $(elapsed).css("width", audio.currentTime * 100 / audio.duration + "%");
                },
                "error": function () {
                    console.log("Catch an ERROR!");
                }
            });
            $(upper).click(function () {
                audio.paused ? audio.play() : audio.pause();
            });
            topic.appendChild(audio);
            audio.play();
        },
        _fill: function () {
            while (jqXHRs.length < this.cache) this._ajax();
        },
        _check: function (data) {
            if (!data["mp3"]) {
                if (tried++ < this.trial) this._ajax();
                console.log("Continuity Count Error:", tried);
                return false;
            } else {
                tried = 0;
                return true;
            }
        },
        _render: function (data) {
            img.src = data["cover"] + this.size;
            title.textContent = data["title"];
            artist.textContent = data["artist"];
            audio.src = data["mp3"];
            audio.volume = this.volume;
        }
    };

    $(document).on("keydown", function (e) {
        // CTRL + Right
        if (e.ctrlKey && e.which === 39) {
            e.preventDefault();
            preset.next();
        }
    });
    $(home).click(function () {
        window.open(preset.source);
    });
    $(next).click(function () {
        preset.next();
    });
    preset.load();

});
