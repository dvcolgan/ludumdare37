export const forEachObj = (obj: any, callback: Function) => {
    for (let id in obj) {
        callback(obj[id]);
    }
};

