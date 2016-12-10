export const G = {
    UNIT_RADIUS: 10,
    UNIT_SPEED: 10,
    STARTING_RADIUS: 100,
};

export interface Vector2 {
    x: number;
    y: number;
}

export interface Flag extends Vector2 {
    id: string;
    x: number;
    y: number;
}

export interface Unit extends Vector2 {
    x: number;
    y: number;
    angle: number;
    hp: number;
}

export interface Player {
    id: string;
    color: string;
    units: Unit[];
    flags: Flag[];
}

export interface State {
    players: {[id: string]: Player};
}
