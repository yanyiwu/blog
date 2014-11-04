function BackFullScreen(BigImgUrl) {
    var ShowBigImgDiv = document.getElementById("ShowBigImgDiv");
    ShowBigImgDiv.style.display = "block";
    //ShowBigImgDiv.innerHTML = "<img src=\"" + BigImgUrl + "\" width=\"800\" height=\"600\"  border=\"0\" />";
    ShowBigImgDiv.innerHTML = "<img src=\"" + BigImgUrl + "\" border=\"0\" />";
    var ShowBigImgDivPosition = document.documentElement.scrollTop;
    if (ShowBigImgDivPosition == 0 || ShowBigImgDivPosition == "") {
        ShowBigImgDivPosition = document.body.scrollTop;
    }
    ShowBigImgDiv.style.top = ShowBigImgDivPosition + ((window.screen.height - ShowBigImgDiv.clientHeight) / 2 ) + "px";
    ShowBigImgDiv.style.left = (window.screen.width - ShowBigImgDiv.clientWidth) / 2 + "px";
    ShowBigImgDiv.style.right = (window.screen.width - ShowBigImgDiv.clientWidth) / 2 + "px";
}
function BackFullScreenHide() {
    document.getElementById("ShowBigImgDiv").style.display = "none";
}
