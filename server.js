

//declaration variable pour web socket

var web_socket = null;
var web_socket_host;
var web_socket_port;
var socket_interval;

// creation de flag
var flag_focus;
var flag_tuio;

//dessines dans l'ecran, variables
var t_frame_rate;
var t_render_interval;
var t_get_context;
var canvas;


// array pour tenir toutes les touches
var t_cursors = new Array();

//creation une fonction pour tenir les t_cursors
var canvas = document.getElementById('canvas');

function cursors(id,ix,iy)
{

  this.myX = ix;
  this.myY = iy;
  this.myId = id;
}

cursors.prototype.render = function()
{
	  g_context.strokeStyle = "white";
      g_context.strokeRect( this.myX - 20, this.myY - 20, 40, 40 );
}

//load la page index html

document.addEventListener ("DOMContentLoaded", function(){
	document.body.onload = loadEvent;
})
document.addEventListener("touchstart",()=>{
	dbg("touchstart");
})
document.addEventListener("touchmove",()=>{
	dbg("touchmove");
})
document.addEventListener("touchend",()=>{
	dbg("touchend");
})

document.addEventListener("click",()=>{
	dbg("click");
})

//creation d'une fonction pour load les evenements de la page index.html
function loadEvent()
{
	web_socket_host = "localhost";
    web_socket_port = "3334";
	flag_focus = true;
	flag_tuio = false;

     canvas = document.getElementById('canvas');
	//window.onresize = resizeCanvas;
	//resizeCanvas();
	
	setTimeout(main,100);
}

//creation la fonction main pour controler les evenements

function main()
{

	
	socket_interval = setInterval(socketCheck,1000);
	t_render_interval = setInterval(detect,16)
}

//fonction pour detecter la connexion tuio

function detect()
{
	
	if(flag_tuio)
	{
		dbg("connected");
	}

	dbg("il y'a " +t_cursors.length);

	for ( var i = 0; i < t_cursors.length; ++i )
   {
      

       dbg(t_cursors[i].myId)

      // draw box around each touch
      //g_cursors[i].render();
   }
}


function touchAdd(id, x, y)
{
   t_cursors.push( new cursors(id,x,y) );
}

function touchUpdate(id, x, y)
{
   for ( var i = 0; i < t_cursors.length; ++i )
   {
      if ( t_cursors[i].myId == id )
      {
         t_cursors[i].myX = x;
         t_cursors[i].myY = y;
      }
   }
}

function touchRemove(id)
{
   var freshCursors = new Array();
   for ( var i = 0; i < t_cursors.length; ++i )
   {
      if ( t_cursors[i].myId != id )
      {
         freshCursors.push( t_cursors[i] );
      }
   }
   t_cursors = null;
   t_cursors = freshCursors;
}


// creation de la fonction pour voir l'etat de la connection socket

function socketCheck()
{
	if((web_socket == null) && flag_focus)
	{
		  var wsloc = "ws://" + web_socket_host + ":" + web_socket_port;
          web_socket = new WebSocket(wsloc);
		  
		  // etat de la connexion
		  web_socket.onopen = sockonpen;
		  web_socket.onclose= sockclose;
		  web_socket.onmessage = sockmsg;
		  web_socket.onerror = sockerr;
	}
}




// fonction onpen

function sockonpen(evt)
{
	flag_tuio = true;
	dbg("web socket connected");
}

// fonction close
function sockclose(evt)
{
	dbg("web socket disconnected",1);
	web_socket = null;
	flag_tuio = false;
}
function sockerr(evt)
{
	dbg("web socket error",2);
	web_socket = null;
	flag_tuio = false;
}

function sockmsg(evt)
{
   // incoming message is ID,OPERATION,X,Y
   // where operation is A,R,U  for add,remove,update
   var xyarr = evt.data.split(",");

   var id = xyarr[0];
   var op = xyarr[1];

   var x = parseFloat(xyarr[2]);
   var y = parseFloat(xyarr[3]);

   x *= canvas.width;
   y *= canvas.height;

   if ( op == "A" )
      touchAdd(id, Math.round(x), Math.round(y));
   else if ( op == "R" )
      touchRemove(id);
   else if ( op == "U" )
      touchUpdate(id, Math.round(x), Math.round(y));
}
// creation de la fonction pour les messages console log

function dbg (msg,level)
{
	if(level == undefined || level == null)
		console.log(msg);
	else if(level == 1)
		console.warn(msg);
	else 
		console.error(msg);
	
}