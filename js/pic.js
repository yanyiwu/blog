function BackFullScreen(BigImgUrl) {
    var ShowBigImgDiv = document.getElementById("ShowBigImgDiv");
    //alert(ShowBigImgDiv.clientWidth)
    //alert(ShowBigImgDiv.clientWidth)
    ShowBigImgDiv.style.display = "block";
    //ShowBigImgDiv.innerHTML = "<img src=\"" + BigImgUrl + "\" width=\"800\" height=\"600\"  border=\"0\" />";
    var imagestr = "<img src=\"" + BigImgUrl + "\" border=\"0\" />";
    //if (globalImagstr == imagestr) {
    //    alert(22)
    //    return;
    //}

    //function () {
    //    alert(11);
    //}()
    ////alert(ShowBigImgDiv.innerHTML == imagestr);
    ////alert(imagestr)
    ////alert(ShowBigImgDiv.innerHTML)
    //if(ShowBigImgDiv.innerHTML.Text == imagestr) {
    //    alert("11");
    //    return;
    //}
    ShowBigImgDiv.innerHTML = imagestr;
    var ShowBigImgDivPosition = document.documentElement.scrollTop;
    if (ShowBigImgDivPosition == 0 || ShowBigImgDivPosition == "") {
        ShowBigImgDivPosition = document.body.scrollTop;
    }
    //var w = window.innerWidth
    //    || document.documentElement.clientWidth
    //    || document.body.clientWidth;

    //var h = window.innerHeight
    //    || document.documentElement.clientHeight
    //    || document.body.clientHeight;
    //ShowBigImgDiv.style.top =  ((window.screen.height - h) / 2 ) + "px";
    //ShowBigImgDiv.style.left = (window.screen.width - w) / 2 + "px";
    //ShowBigImgDiv.style.right = (window.screen.width - w) / 2 + "px";
    //alert(ShowBigImgDiv.clientWidth)
    //if(ShowBigImgDiv.style.top == "" || ShowBigImgDiv.style.top == 0) {
        ShowBigImgDiv.style.top = ShowBigImgDivPosition + ((window.screen.height - ShowBigImgDiv.clientHeight) / 2 ) + "px";
    //}
    //ShowBigImgDiv.style.bottom = ShowBigImgDiv.style.top
    //if(ShowBigImgDiv.style.left == "" || ShowBigImgDiv.style.left == 0) {
        ShowBigImgDiv.style.left = (window.screen.width - ShowBigImgDiv.clientWidth) / 2 + "px";
    //}
    ShowBigImgDiv.style.right = ShowBigImgDiv.style.left
    //ShowBigImgDiv.style.right = (window.screen.width - ShowBigImgDiv.clientWidth) / 2 + "px";
    //alert(ShowBigImgDiv.clientWidth)
    //ShowBigImgDiv.style.top = ShowBigImgDivPosition + ((window.screen.height - ShowBigImgDiv.clientHeight) / 2 ) + "px";
    //ShowBigImgDiv.style.left = (window.screen.width - ShowBigImgDiv.clientWidth) / 2 + "px";
    //ShowBigImgDiv.style.right = (window.screen.width - ShowBigImgDiv.clientWidth) / 2 + "px";
    //alert(w + "," +  h)
    //alert("1:" + window.screen.width + " 2:" + ShowBigImgDiv.clientWidth + " 3:" + ShowBigImgDivPosition);
    //alert(ShowBigImgDiv.style.top + "," + ShowBigImgDiv.style.left + "," + ShowBigImgDiv.style.right)
}
function BackFullScreenHide() {
    document.getElementById("ShowBigImgDiv").style.display = "none";
}
