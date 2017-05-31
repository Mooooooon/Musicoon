/**
 * Created by Moon on 2014/12/4 0004.
 * Modified by D-Bood on 2017/05/25 1947.
 */
html = '';
oAudio = document.getElementById('player');
btn = $("#m_play");
volimg = $("#vol");
mde = $("#mode");
nxtmsc = $("#next_music");
album = $("#album");
inn = $("#in");
music_name = $("#music_name");
artist = $("#artist");
cd = $("#cd");
lrc_row = $("#lrc");
tlrc_row = $("#tlrc");
var plymde;
var playingIndex;
var songNum;
var playList = new Array();
$(document).ready(function () {
	//播放列表//
	$.get("src/playlist.php?_=" + (new Date()).getTime(), function (pdata) {
		var playListInfo = eval(pdata),
		playList = playListInfo; //.playlist.tracks,
		songNum = playList.length,
		playingIndex = 0;
		for (var i = 0, pLen = songNum; i < pLen; i++) {
			html += '<li data-index=' + i + '>' + playList[i].name + ' - ' + playList[i].artist[0] + '</li>';
		}
		$('#playList').append(html);

		$('ul').mouseover(function () {
			$('li').css("cursor", "pointer");
		});

		$('ul').on('click', 'li', function (e) {
			pause();;
			if ($('li').css("background-color", "#bfbfbf")) {
				$('li').css(
					{"background-color": "","font-weight": "","color": "#000"});
				$(this).css(
                                        {"background-color": "#bfbfbf","font-weight": "bold","color": "#fff"});
			}
			playingIndex = $(this).data('index');
			console.log("正在播放的歌曲序号：" + playingIndex);
			if (e.button == 0) {
				load_music(playList[playingIndex].id,playingIndex);
			}
                        $('ul').scrollTop(41 * playingIndex);
		});
		//播放模式//
		plymde = function songPlayMode(direction, mode) {
			if (mde.attr("class") === "fa fa-random fa-lg") {
				var randomId = parseInt(songNum * Math.random());
				load_music(playList[randomId].id,randomId);
				playingIndex = randomId;
				$('ul').scrollTop(41 * playingIndex);
				console.log("正在播放的歌曲序号：" + playingIndex);
			} else {
				if (direction === "next") {
					if (playingIndex + 1 === songNum) {
						playingIndex = 0;
						load_music(playList[playingIndex].id,0);
						$('ul').scrollTop(41 * playingIndex);
						console.log("正在播放的歌曲序号：" + playingIndex);
					} else {
						playingIndex = playingIndex + 1;
						load_music(playList[playingIndex].id,playingIndex);
						$('ul').scrollTop(41 * playingIndex);
						console.log("正在播放的歌曲序号：" + playingIndex);
					}
				if (direction === "prev") {
					if (playingIndex === 0) {
                                                playingIndex = songNum - 1;
						load_music(playList[playingIndex].id,playingIndex);
						$('ul').scrollTop(41 * playingIndex);
						console.log("正在播放的歌曲序号：" + playingIndex);
					} else {
                                                playingIndex = playingIndex - 1;
						load_music(playList[playingIndex].id,playingIndex);
						$('ul').scrollTop(41 * playingIndex);
						console.log("正在播放的歌曲序号：" + playingIndex);
						}
					}
				}
			}

		}
		//播放模式//
		console.log("Musicoon - 基于养猪场音乐api的php私人电台\nFrom Musicoon Modified by D-Bood\n列表共有" + songNum + "首歌曲,目前功能仍然在完善中>_<\nTODO List: 播放功能完善、界面人性化\nI'm sorry however, I cannot guarantee the QoS if you aren't in China about this app.");
		//播放列表//
		//播放器//
		cd_size();
		$.get("src/player.php?id=" + playList[0].id + "&fxxk=" + (new Date()).getTime(), function (data) {
			console.log("正在播放的歌曲序号：" + playingIndex);
			mp3_info = eval(data);
			$("#player").attr("src", mp3_info.mp3);
			$("li[data-index = '0']").css({"background-color": "#bfbfbf","font-weight": "bold","color": "#fff"});
			album.css("background-image", "url('" + mp3_info.cover + "')");
			music_name.html(mp3_info.music_name);
			artist.html(mp3_info.artists);
			if (mp3_info.lrc != "no") {
				lrc = mp3_info.lrc;
				tlrc = mp3_info.tlrc;
			} else {
				lrc = "no";
				tlrc = "";
			}
		});
		oAudio.volume = 0.5;
		//播放器//
	});
});

$(window).resize(function () {
	cd_size();
});

$("#player").bind("ended", function () {
	if (lrc != "") {
		clearInterval(lrc_interval);
	}
	if (tlrc != "") {
		clearInterval(tlrc_interval);
	}
	next_music();
});
function pause() {
        oAudio.pause();
        btn.attr({"class": "fa fa-play fa-lg","title": "播放"});
        album.removeClass("roll");
        inn.removeClass("roll");
}

function m_play() {
	if (oAudio.paused) {
		oAudio.play();
		btn.attr({"class": "fa fa-pause fa-lg","title": "暂停"});
		album.addClass("roll");
		inn.addClass("roll");
		if (lrc != "") {
			lrc_interval = setInterval("display_lrc()", 500);
		}
		if (tlrc != "") {
			tlrc_interval = setInterval("display_tlrc()", 500);
		}
	} else if (oAudio.play) {
		pause();
        	if (lrc != "") {
                	clearInterval(lrc_interval);
        	}
        	if (tlrc != "") {
                	clearInterval(tlrc_interval);
        	}
	}
}

function next_music() {
	oAudio.pause();
	album.removeClass("roll");
	inn.removeClass("roll");
	if (!oAudio.paused && lrc != "") {
		clearInterval(lrc_interval);
		clearInterval(tlrc_interval);
	}
	plymde("next", mode);
	btn.attr({"class": "fa fa-play fa-lg","title": "播放"});
}

function load_music(id,ikite) {
	$.get("src/player.php?id=" + id + "&fxxk=" + (new Date()).getTime(), function (data) {
		mp3_info = eval(data);
		$("#player").attr("src", mp3_info.mp3);
		album.css("background-image", "url('" + mp3_info.cover + "')");
		music_name.html(mp3_info.music_name);
		artist.html(mp3_info.artists);
		$('li').css({"background-color": "","font-weight": "","color": "#000"});
		$("li[data-index = " + ikite + "]").css({"background-color": "#bfbfbf","font-weight": "bold","color": "#fff"});
		oAudio.play();
		btn.attr({"class": "fa fa-pause fa-lg","title": "暂停"});
		album.addClass("roll");
		inn.addClass("roll");
		lrc_row.html("");
		if (mp3_info.lrc != "no") {
			lrc = mp3_info.lrc;
			lrc_interval = setInterval("display_lrc()", 500);
		} else {
			lrc = "no";
		}
		tlrc_row.html("");
		if (mp3_info.tlrc != "no") {
			tlrc = mp3_info.tlrc;
			tlrc_interval = setInterval("display_tlrc()", 500);
		} else {
			tlrc = "";
		}
	});
}

function volume(vol) {
	oAudio.volume = vol / 100;
	if (oAudio.volume <= 0) {
		volimg.attr({"class": "fa fa-volume-off fa-lg","title": "点击即可开启声音"});
	} else {
		volimg.attr({"class": "fa fa-volume-up fa-lg","title": "点击即可静音"});
	}
}
function mute() {
	if (!oAudio.muted) {
		oAudio.muted = true;
		volimg.attr({"class": "fa fa-volume-off fa-lg","title": "点击即可开启声音"});
	} else {
		oAudio.muted = false;
		volimg.attr({"class": "fa fa-volume-up fa-lg","title": "点击即可静音"});
	}
}

function playMode() {
	switch (mde.attr("class")) {
	case "fa fa-align-justify fa-lg":
		oAudio.loop = true;
		mde.attr({"class": "fa fa-repeat fa-lg","title": "单曲循环"});
		break;
	case "fa fa-repeat fa-lg":
		oAudio.loop = false;
		mde.attr({"class": "fa fa-random fa-lg","title": "随机播放"});
		break;
	case "fa fa-random fa-lg":
		oAudio.loop = false;
		mde.attr({"class": "fa fa-align-justify fa-lg","title": "列表循环"});
		break;
	}
}

function rewindAudio() {
	oAudio.currentTime -= 10.0;
}

function forwardAudio() {
	oAudio.currentTime += 10.0;
}

function cd_size() {
	cd_height = cd.height();
	cd.css("width", cd_height);
}

function display_lrc() {
	play_time = Math.floor(oAudio.currentTime).toString();
	lrc_row.html(lrc[play_time]);
}

function display_tlrc() {
	play_time = Math.floor(oAudio.currentTime).toString();
	tlrc_row.html(tlrc[play_time]);
}
