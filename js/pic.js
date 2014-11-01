function BackFullScreen(BigImgUrl) {
    //var FullScreenDiv = document.getElementById("FullScreenDiv");
    //FullScreenDiv.style.width = document.body.clientWidth + "px";
    //FullScreenDiv.style.height = document.body.clientHeight + "px";
    //FullScreenDiv.style.display = "block";
    var ShowBigImgDiv = document.getElementById("ShowBigImgDiv");
    var ShowBigImgDivPosition;
    ShowBigImgDiv.style.display = "block";
    //ShowBigImgDiv.innerHTML = "<img src=\"" + BigImgUrl + "\" width=\"800\" height=\"600\"  border=\"0\" />";
    ShowBigImgDiv.innerHTML = "<img src=\"" + BigImgUrl + "\" border=\"0\" />";
    ShowBigImgDivPosition = document.documentElement.scrollTop;
    if (ShowBigImgDivPosition == 0 || ShowBigImgDivPosition == "") {
        ShowBigImgDivPosition = document.body.scrollTop;
    }
    ShowBigImgDiv.style.top = ShowBigImgDivPosition + ((window.screen.height - ShowBigImgDiv.clientHeight) / 2 - 170) + "px";
    ShowBigImgDiv.style.left = (window.screen.width - ShowBigImgDiv.clientWidth) / 2 - 90 + "px";
}
function BackFullScreenHide() {
    document.getElementById("ShowBigImgDiv").style.display = "none";
    //document.getElementById("FullScreenDiv").style.display = "none";
}
