import { forEachObj } from '../shared/functions';
import * as uuid from 'node-uuid';
import * as React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'
import * as io from 'socket.io-client';
import { G, Vector2, Flag, Unit, Player, State } from '../shared/types';

const socket: SocketIOClient.Socket = io.connect();

let myUuid;
let state: State = {
    players: {},
};

socket.on('connect', () => {
    myUuid = localStorage.getItem('uuid');
    if (!myUuid) {
        myUuid = uuid.v4();
        localStorage.setItem('uuid', myUuid);
    }
    socket.emit('join', myUuid);

});

socket.on('update', (state: State) => {
    
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


const draw = (state: State, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    forEachObj(state.players, (player: Player) => {
        ctx.fillStyle = player.color;
        for (let unit of player.units) {
            ctx.fillRect(
                unit.x - G.UNIT_RADIUS,
                unit.y - G.UNIT_RADIUS,
                G.UNIT_RADIUS * 2,
                G.UNIT_RADIUS * 2,
            );
        }
    });
};



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
