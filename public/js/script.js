"use strict";
var socket = io.connect(window.location.hostname);
// var socket=io.connect('localhost:8080',{'forceNew':true});

socket.on('draw', function(data) {
	draw(data.pX,data.pY,data.cX,data.cY);
});

var canvas, ctx,
    flag = false,
    canDraw = true;

var prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0;

var color = "black",
	line = 1;


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
function draw(pX,pY,cX,cY) {
    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.lineTo(cX, cY);
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
	            let data = {pX:prevX,pY:prevY,cX:currX,cY:currY};
	            socket.emit('draw',data);
	            draw(prevX,prevY,currX,currY);
	        }
	    }
    }
}
function clear(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}