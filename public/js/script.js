"use strict";
const socket = io.connect(window.location.host, { path: window.location.pathname + "socket.io" });

let user = null;

let canvas, ctx,
    flag = false,
    canDraw = false;

let prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0;

let color = "black",
    line = 1,
    ers = false;

socket.on('draw', function (data) {
    draw(data.pX, data.pY, data.cX, data.cY, data.cl, data.lin);
});
socket.on('clearAll', function (data) {
    clear();
});
socket.on('chat', function (data) {
    writeChat(data);
});
socket.on('users', function (data) {
    writeUsers(data);
});
socket.on('whoDraw', function (data) {
    whoDraw(data);
});
socket.on('count', function (data) {
    count(data);
});

window.onload = function () {
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    canvas.width = $('#can').width();
    canvas.height = $('#can').height();


    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e);
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e);
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e);
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e);
    }, false);
    canvas.addEventListener('touchstart', function (e) {
        findxy('down', e);
    });
    canvas.addEventListener('touchend', function (e) {
        findxy('up', e);
    });
    canvas.addEventListener('touchmove', function (e) {
        findxy('move', e);
    });
    canvas.addEventListener('touchcancel', function (e) {
        findxy('out', e);
    });


    $('#talk').keydown(function (e) {
        if (e.keyCode == 13 && user && $('#talk').val()) {
            if ($('#talk').val().length > 50) {
                alert('Text too long');
            } else {
                socket.emit('chat', { data: $('#talk').val(), name: user });
                $('#talk').val('');
            }
        }
    })
    if (localStorage.name && localStorage.id) {
        $.ajax({
            url: './oldLogin',
            data: { name: localStorage.name, id: localStorage.id },
            method: 'POST',
            success: function (res) {
                if (res.error) {
                    localStorage.setItem('name', res.data.name);
                    localStorage.setItem('id', res.data.id);
                }
                socket.emit('login', res.data);
                socket.emit('users', null);
                user = res.data.name;
                $("#login").css("display", "none");
                $("#all").css("display", "flex");
            }
        });
    } else {
        $("#login").css("display", "flex");
    }

    $('#login>input').keydown(function (e) {
        if (e.keyCode == 13 && $('#login>input').val()) {
            if ($('#login>input').val().length > 10) {
                alert('Name too long');
            } else {
                $.ajax({
                    url: './login',
                    data: { name: $('#login>input').val() },
                    method: 'POST',
                    success: function (res) {
                        if (res.error) {
                            console.log(res.data);
                        } else {
                            localStorage.setItem('name', res.data.name);
                            localStorage.setItem('id', res.data.id);
                            $("#login").css("display", "none");
                            $("#all").css("display", "flex");
                            socket.emit('login', res.data);
                            socket.emit('users', null);
                            user = res.data.name;
                        }
                    }
                });
            }
        }
    })
    $('#clr').click(function () {
        if (canDraw) {
            socket.emit('clearAll', true);
            clear();
        }
    });
    $('#ers').click(function () {
        if (ers) {
            $('#ers').val("Erase");
            ers = false;
            color = "black";
            line = 1;
        } else {
            $('#ers').val("Draw");
            ers = true;
            color = "white";
            line = 17;
        }

    });
};
function count(data) {
    $('#count').html(data);
}
function whoDraw(data) {
    if (data.drawing.name == user && data.drawing.id == localStorage.id) {
        $("#talk").prop("disabled", true);
        $("#clr").prop("disabled", false);
        $("#ers").prop("disabled", false);
        canDraw = true;
        $("#canDraw").html("You have to draw: " + data.word);
    } else {
        $("#talk").prop("disabled", false);
        $("#clr").prop("disabled", true);
        $("#ers").prop("disabled", true);
        canDraw = false;
        $("#canDraw").html(data.drawing.name + " is drawing");
    }


}
function writeChat(data) {
    let html = "";
    for (let index of data) {
        if (index.name) {
            html += "<div class='chatext'><div class='name'>" + index.name + ": </div> <div class='text'> " + index.data + "</div></div>";
        } else {
            html += "<div class='chatext'><div class='cool'> " + index.data + "</div></div>";
        }
    }

    $('#chat').html(html);
    let elem = document.getElementById('chat');
    elem.scrollTop = elem.scrollHeight;
}
function writeUsers(data) {
    let html = "";
    for (let index of data) {
        html += "<div class='chatext'><div class='name'>" + index.name + " - </div> " + index.points + "</div>";
    }
    $('#users').html(html);
}
function draw(pX, pY, cX, cY, cl, lin) {
    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.lineTo(cX, cY);
    ctx.strokeStyle = cl;
    ctx.lineWidth = lin;
    ctx.stroke();
    ctx.closePath();
}

function findxy(res, e) {
    if (canDraw) {
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
                let data = { pX: prevX, pY: prevY, cX: currX, cY: currY, cl: color, lin: line };
                socket.emit('draw', data);
                draw(prevX, prevY, currX, currY, color, line);
            }
        }
    }
}
function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}