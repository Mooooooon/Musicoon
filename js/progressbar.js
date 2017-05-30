(function (window, document) {
	var audio = document.getElementById("player");
	var scroolBar = document.getElementById("scrollBar");
	var thumb = document.getElementById("scroll_Thumb");
	var pastime = document.getElementById("scroll_Track");
	var buffered = document.getElementById("scroll_Buffered");
	var crtime = document.getElementById("scrollBarTxt");
	var buffer;
	var progressFlag;
	var bufInt;
	var time;
	var dit;
	var parentOffset;
	var length;
	var percent;


	bufInt = audio.addEventListener("progress", function () {
			if (oAudio.buffered.length > 0) {
				buffer = Math.round(oAudio.buffered.end(0)) / Math.round(oAudio.duration) * 100;
			}
			buffered.style.width = buffer + "%";
		});

	setInterval(bufInt, 60);

	progressFlag = setInterval(getProgress, 100);

	function getProgress() {
		var percentage = Math.round(audio.currentTime) / Math.round(audio.duration) * 100;

		pastime.style.width = percentage + "%";
		thumb.style.left = percentage  - 3.9 + "%";
		var crtsecond = parseInt(audio.currentTime) % 60;
		var crtminute = parseInt(audio.currentTime / 60);
		var dursecond = parseInt(audio.duration) % 60;
		var durminute = parseInt(audio.duration / 60);
		if (crtsecond < 10) {
			crtsecond = "0" + crtsecond;
		}
		if (crtminute < 10) {
			crtminute = "0" + crtminute;
		}
		if (dursecond < 10) {
			dursecond = "0" + dursecond;
		}
		if (durminute < 10) {
			durminute = "0" + durminute;
		}
		if (!isNaN(dursecond)) {
			crtime.innerHTML = crtminute + ":" + crtsecond + " / " + durminute + ":" + dursecond;
		}
	}

	function enhanceAudioSeek(e) {
		if (e.button == 0) {
			clearInterval(progressFlag);
			var parentOffset = $('.player').offset();
			var length = e.pageX - parentOffset.left - scroolBar.offsetLeft;
			var percent = length / scroolBar.offsetWidth * 100;
			if (percent >= 100) {
				percent = 100;
			}
			if (percent <= 0) {
				percent = 0;
			}
			pastime.style.width = percent + "%";
			thumb.style.left = percent - 3.9 + "%";
			audio.currentTime = (percent - (2 / scroolBar.offsetWidth * 100)) / 100 * audio.duration;
			progressFlag = setInterval(getProgress, 100);
		}
	}
	thumb.addEventListener("drag", function (e) {
		if (e.button == 0) {
			clearInterval(progressFlag);
			var parentOffset = $('.player').offset();
			var length = e.pageX - parentOffset.left - scroolBar.offsetLeft;
			var percent = length / scroolBar.offsetWidth * 100;
			if (percent >= 100) {
				percent = 100;
			}
			if (percent <= 0) {
				percent = 0;
			}
			pastime.style.width = percent + "%";
			e.target.style.left = percent - 3.9 + "%";
		}
	}, false);
	thumb.addEventListener("dragstart", function (e) {
		thumb = e.target;
	}, false);
	thumb.addEventListener("dragend", function (e) {
		enhanceAudioSeek(e);
	}, false);
	scroolBar.addEventListener("click", function (e) {
		enhanceAudioSeek(e);
	}, false);
}
	(this, document))

