"use strict";
var canvas, ctx,
    flag = false,
    canDraw = true;

var prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0;

var color = "black",
	line = 2;


window.onload = function(){
   	canvas = document.getElementById('can'),
	ctx = canvas.getContext("2d"),
	canvas.width = $('#cont').width();
	canvas.height = $('#cont').height();
    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
    $('#clr').click(function(){
        clear();
    });
    $(window).resize(function() {
    	canDraw = false;
	    if(this.resizeTO) clearTimeout(this.resizeTO);
	    this.resizeTO = setTimeout(function() {
	        $(this).trigger('resizeEnd');
	    }, 500);
	});
    $(window).bind('resizeEnd', function() {
    	var oldCanvas = canvas.toDataURL("image/png");
		var img = new Image();
		img.src = oldCanvas;
		img.onload = function (){
			canvas.width = $('#cont').width();
			canvas.height = $('#cont').height();
		    ctx.drawImage(img, 0, 0);
		    setTimeout(function(){canDraw = true},500);;
		}

	});
}
function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = color;
    ctx.lineWidth = line;
    ctx.stroke();
    ctx.closePath();
}
function findxy(res, e) {
	if (canDraw){
	    if (res == 'down') {
	        prevX = currX;
	        prevY = currY;
	        currX = e.clientX - canvas.offsetLeft;
	        currY = e.clientY - canvas.offsetTop;
	        flag = true;
	    }
	    if (res == 'up' || res == "out") {
	        flag = false;
	    }
	    if (res == 'move') {
	        if (flag) {
	            prevX = currX;
	            prevY = currY;
	            currX = e.clientX - canvas.offsetLeft;
	            currY = e.clientY - canvas.offsetTop;
	            draw();
	        }
	    }
    }
}
function clear(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}