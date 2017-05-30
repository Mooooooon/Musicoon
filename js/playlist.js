html = '';
$.get("playlist.php?_=" + (new Date()).getTime(), function(pdata) {
    playlist_info = eval(pdata);
    var playList = playlist_info.playlist.tracks,
        songNum = playList.length,
        modeStatus = mde.attr('src');
        console.log(modeStatus);
    $(document).ready(function() {
        for (var i = 0, pLen = songNum; i < pLen; i++) {
            html += '<li data-index=' + i + '>' + playList[i].name + ' - ' + playList[i].ar[0].name + '</li>';
        }
        $('#playList').append(html);
    });
    $('ul').mouseover(function(){
	$('li').css("cursor", "pointer");});
    $('ul').on('click', 'li', function(e) {
	if ($('li').css("background-color","#efefef")) {
	    $('li').css("background-color","");
	    $(this).css("background-color","#efefef");}
	    var playingIndex = $(this).data('index');
	    console.log(playingIndex);
        if (e.button == 0) {
            var id = playList[$(this).data('index')].id;
            //alert(id);
            load_music(id);
        }
    });
    //function songPlayMode(direction,mode)
    //    if (mode === "images/listloop.png"){
    //        if(direction === "next"){
    //            
    console.log("列表共有" + songNum + "首歌曲,目前功能仍然在完善中>_<\nTODO List: 播放功能完善、界面人性化");
     
});
