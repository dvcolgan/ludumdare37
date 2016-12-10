import * as _io from 'socket.io';
import { forEachObj } from '../shared/functions';
import { G, Vector2, Flag, Unit, Player, State } from '../shared/types';

const distanceBetween = (v1: Vector2, v2: Vector2): number => (
    Math.sqrt(
        (v2.x - v1.x) * (v2.x - v1.x) +
        (v2.y - v1.y) * (v2.y - v1.y)
    )
);

const closest = (vector: Vector2, others: Vector2[]): Vector2 => {
    let closestOther = others[0];
    let closestDistance = 0;
    for (let other of others) {
        let dist = distanceBetween(other, vector);
        if (dist < closestDistance) {
            closestOther = other;
            closestDistance = dist;
        }
    }
    return closestOther;
};

const angleTo = (vector: Vector2, destination: Vector2): number => {
    return Math.atan2(
        destination.y - vector.y,
        destination.x - vector.x
    );
};

const moveForward = (unit: Unit, speed: number): void => {
    unit.x = Math.cos(unit.angle) * speed;
    unit.y = Math.sin(unit.angle) * speed;
};

const updateUnit = (flags: Flag[], unit: Unit): void => {
    if (flags.length === 0) {
        return;
    }
    const closestFlag = closest(unit, flags);
    unit.angle = angleTo(unit, closestFlag);
    moveForward(unit, G.UNIT_SPEED);
};

const resolveDamage = (unit: Unit, otherUnit: Unit): void => {

// attack vector = Math.cos(unit1.angle), Math.sin(unit1.angle)
// difference vector = (unit2.x - unit1.x, unit2.y - unit2.y)
// dot product of the two vectors = damage / gains

    
};

const update = (state: State) => {
    // For every unit
    forEachObj(state.players, (player: Player) => {
        for (let unit of player.units) {
            updateUnit(player.flags, unit);
        }
    });

    // For every unit
    forEachObj(state.players, (player: Player) => {
        for (let unit of player.units) {

            // For every other unit
            forEachObj(state.players, (otherPlayer: Player) => {
                if (player.id === otherPlayer.id) return;

                for (let otherUnit of otherPlayer.units) {
                    resolveDamage(unit, otherUnit);
                }
            });
        }
    });
};


const socketIdToPlayerId: {[id: string]: string} = {};

const state: State = {
    players: {},
};

const shapedLike = (obj: any, spec: any) => {
    return true;
    //let validated: any = {};
    //for (let key in spec) {
    //    let type = spec[key];
    //    let value = obj[key];

    //}
    //return true;
};

const io = _io(8000);
io.on('connect', (socket: SocketIO.Socket) => {
    socket.on('disconnect', () => {
        delete socketIdToPlayerId[socket.id];
    });
    socket.on('join', (payload: {id: string, color: string}) => {
        console.log('join', payload);
        if (shapedLike(payload, {id: 'string', color: 'string'})) {
            // TODO if id is null or empty string, this could be a problem
            let player: Player;
            if (state.players[payload.id]) {
                console.log('found existing player');
                player = state.players[socketIdToPlayerId[socket.id]]
            }
            else {
                console.log('creating new player');
                player = { id: payload.id, color: payload.color, units: [], flags: [] };
                state.players[player.id] = player;
            }

            socketIdToPlayerId[socket.id] = player.id;

            for (let i = 0; i < 10; i++) {
                let x = Math.random() * G.STARTING_RADIUS * 2 - G.STARTING_RADIUS;
                let y = Math.random() * G.STARTING_RADIUS * 2 - G.STARTING_RADIUS;
                player.units.push({
                    x: x * Math.random() * 20 - 10,
                    y: y * Math.random() * 20 - 10,
                    angle: 0,
                    hp: 100,
                });
            }
        }
    });
    socket.on('placeFlag', (flag: {id: string, x: number, y: number}) => {
        if (shapedLike(flag, {id: 'string', x: 'number', y: 'number'})) {
            const player = state.players[socketIdToPlayerId[socket.id]];
            player.flags.push({
                id: flag.id,
                x: flag.x,
                y: flag.y
            });
        }
    });
    socket.on('removeFlag', (id: string) => {
        if (typeof id === 'string') {
            const player = state.players[socketIdToPlayerId[socket.id]];
            player.flags = player.flags.filter((flag: Flag) => flag.id === id);
        }
    });
});


setInterval(() => {
    update(state);
    // send updates to players
    io.sockets.emit('update', state);
}, 1000 * 10)
