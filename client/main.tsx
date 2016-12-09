/*
 * Simple site that has a home page, a join page, and an about page using react-router for routing
 * The whole app floats on top of a full screen canvas
 * 
 */

import * as React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'

interface Player {
    id: number;
    x: number;
    y: number;
    color: string;
}

interface State {
    players: Player[];
}

let state: State = {
    players: [{
        id: 0,
        x: 40,
        y: 40,
        color: 'red',
    }]
};



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
    for (let player of state.players) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x - 20, player.y - 20, 40, 40);
    }
};



let main = () => {
    window.requestAnimationFrame(main);
    ctx.fillStyle = 'white';
    state.players[0].x += 1;
    state.players[0].y += 1;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    draw(state, ctx);
};
main();

const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
resize();
window.onresize = resize;
