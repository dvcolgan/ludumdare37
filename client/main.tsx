import { forEachObj } from '../shared/functions';
import * as uuid from 'node-uuid';
import * as React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'
import * as io from 'socket.io-client';
import {
    G, Vector2, Flag, Unit, Player, State,
    JoinPayload,
} from '../shared/types';

const socket: SocketIOClient.Socket = io.connect();

let myUuid;
interface Camera extends Vector2 {
}
interface Mouse extends Vector2 {
    pressed: boolean;
}
interface Dragging {
    cameraStart: Vector2;
    mouseStart: Vector2;
}
let camera: Camera = {
    x: 0,
    y: 0,
};
let dragging: Dragging = {
    cameraStart: {x: 0, y: 0},
    mouseStart: {x: 0, y: 0},
};
let mouse: Mouse = {
    x: 0,
    y: 0,
    pressed: false,
};
let state: State = {
    players: {},
};

socket.on('connect', () => {
    myUuid = localStorage.getItem('uuid');
    if (!myUuid) {
        myUuid = uuid.v4();
        localStorage.setItem('uuid', myUuid);
    }
    let payload: JoinPayload = {
        id: myUuid,
        color: '#' + Math.random().toString(16).substr(-6),
    };
    try {
        let lastCamera = localStorage.getItem('camera');
        if (lastCamera) {
            let parsed: any = JSON.parse(lastCamera);
            camera.x = parsed.x || 0;
            camera.y = parsed.y || 0;
        }
    }
    catch (exception) {
        camera.x = 0;
        camera.y = 0;
    }
    socket.emit('join', payload);
});

socket.on('update', (update: State) => {
    state.players = update.players;
});

const About = (props: any) => (
    <div>
        <h1>Ludum Dare 37</h1>
        <p>Hello and welcome to my Ludum Dare 37 entry.</p>
    </div>
);

const Route404 = (props: any) => (
    <div>
        <h1>404'd</h1>
        <p>I don't know what you did, but you definitely broke something.</p>
    </div>
);

class Join extends React.Component<{}, {username: string}> {
    state = {
        username: '',
    }
    render() {
        return (
            <div className="row">
                <div className="col-xs-6 col-xs-offset-3">
                    <form>
                        <label className="form-label">
                            <input className="form-control" type="text" name="username" />
                        </label>
                    </form>
                </div>
            </div>
        );
    }
}

const Navbar = (props: {username?: string}) => (
    <nav className="navbar navbar-light bg-faded">
        <ul className="nav navbar-nav">
            <li className="nav-item"><Link className="nav-link" to={'/'}>Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to={'/about'}>About</Link></li>
        </ul>
        <ul className="nav navbar-nav float-xs-right">
            <li className="nav-item">
                <span className="navbar-text">
                    Hello {props.username || ''}!
                </span>
            </li>
            <li className="nav-item"><Link className="nav-link" to={'/join'}>Join</Link></li>
            <li className="nav-item"><Link className="nav-link" to={'/join'}>Login</Link></li>
        </ul>
    </nav>
);

const Chatbar = (props: any) => (
    <div>
        {props.messages.map((message: any) =>
            <p><span>{message.player.username}</span>: {message.body}</p>
        )}
    </div>
);

class App extends React.Component<any, any> {
    render() {
        return (
            <div>
                <Navbar username='anonymous' />
                {this.props.children}
            </div>
        );
    }
}

render((
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <Route path="about" component={About}/>
            <Route path="join" component={Join}/>
        </Route>
        <Route path="*" component={Route404}/>
    </Router>
), document.getElementById('ui'))

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let _ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
let ctx: CanvasRenderingContext2D;
if (_ctx !== null) {
    ctx = _ctx;
}
else {
    throw new Error('Couldn\'t initialize context');
}

function shadeColor(color: string, percent: number) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

const draw = (state: State, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    forEachObj(state.players, (player: Player) => {
        ctx.fillStyle = player.color;
        ctx.strokeStyle = shadeColor(player.color, -0.3);
        ctx.lineWidth = 2;
        for (let unit of player.units) {
            ctx.beginPath();
            ctx.arc(
                unit.x - camera.x,
                unit.y - camera.y,
                G.UNIT_RADIUS,
                0, Math.PI * 2,
            );
            ctx.fill();
            ctx.stroke();
        }
    });
};

window.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button === 0) {
        mouse.pressed = true;
        dragging.cameraStart.x = camera.x;
        dragging.cameraStart.y = camera.y;
        dragging.mouseStart.x = mouse.x;
        dragging.mouseStart.y = mouse.y;
    }
});
window.addEventListener('mouseup', (e: MouseEvent) => {
    if (e.button === 0) {
        mouse.pressed = false;
    }
});
window.addEventListener('mousemove', (e: MouseEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (mouse.pressed) {
        camera.x = dragging.mouseStart.x - (mouse.x - dragging.cameraStart.x)
        camera.y = dragging.mouseStart.y - (mouse.y - dragging.cameraStart.y)
        localStorage.setItem('camera', JSON.stringify(camera));
    }
});


let main = () => {
    window.requestAnimationFrame(main);
    draw(state, ctx);
};
main();

const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
resize();
window.onresize = resize;
