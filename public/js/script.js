"use strict";
var socket = io.connect(window.location.hostname);
// var socket=io.connect('localhost:8080',{'forceNew':true});
// var socket=io.connect('192.168.0.11:8080',{'forceNew':true});

var canvas, ctx,
    flag = false,
    canDraw = true;

var prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0;

var color = "black",
	line = 1,
	ers = false;



window.onload = function(){
   	canvas = document.getElementById('can'),
	ctx = canvas.getContext("2d"),
	canvas.width = $('#cont').width();
	canvas.height = $('#cont').height();

	socket.on('draw', function(data) {
		draw(data.pX,data.pY,data.cX,data.cY,data.cl,data.lin);
	});
	socket.on('clearAll', function(data) {
		clear();
	});

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
    canvas.addEventListener('touchstart', function(e){
    	findxy('down', e)
    });
    canvas.addEventListener('touchend', function(e){
    	findxy('up', e)
    });
    canvas.addEventListener('touchmove', function(e){
    	findxy('move', e)
    });
    canvas.addEventListener('touchcancel', function(e){
    	findxy('out', e)
    });

    $('#clr').click(function(){
    	socket.emit('clearAll',true);
        clear();
    });
    $('#ers').click(function(){
    	if (ers){
    		 $('#ers').val("Erase")
    		ers=false;
    		color="black";
    		line = 1;
    	} else {
    		 $('#ers').val("Draw")
    		ers=true;
    		color = "white";
    		line = 17;
    	}
    	
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

function draw(pX,pY,cX,cY,cl,lin) {
    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.lineTo(cX, cY);
    ctx.strokeStyle = cl;
    ctx.lineWidth = lin;
    ctx.stroke();
    ctx.closePath();
}

function findxy(res, e) {
	if (canDraw){
	    if (res == 'down') {
	        prevX = currX;
	        prevY = currY;
	        currX = (e.clientX || e.touches[0].clientX) - canvas.offsetLeft;
	        currY = (e.clientY || e.touches[0].clientY) - canvas.offsetTop;
	        flag = true;
	    }
	    if (res == 'up' || res == "out") {
	        flag = false;
	    }
	    if (res == 'move') {
	        if (flag) {
	            prevX = currX;
	            prevY = currY;
	            currX = (e.clientX || e.touches[0].clientX) - canvas.offsetLeft;
	            currY = (e.clientY || e.touches[0].clientY) - canvas.offsetTop;
	            let data = {pX:prevX,pY:prevY,cX:currX,cY:currY,cl:color,lin:line};
	            socket.emit('draw',data);
	            draw(prevX,prevY,currX,currY,color,line);
	        }
	    }
    }
}
function clear(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}