"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapObj = (object, cb) => {
    const newObj = {};
    let index = 0;
    for (const prop in object)
        newObj[prop] = cb(object[prop], prop, index++);
    return newObj;
};
exports.mapObjToArray = (object, cb) => {
    const arr = [];
    let index = 0;
    for (const prop in object)
        arr.push(cb(object[prop], prop, index++));
    return arr;
};
exports.makeFile = (name, data) => ({ name, data });
exports.fetchMakeFile = (ext) => (path, name) => fetch(path)
    .then((response) => response.text())
    .then((text) => exports.makeFile(`${name}.${ext}`, text));
exports.fetchFiles = (urlsObj, ext) => exports.mapObjToArray(urlsObj, exports.fetchMakeFile(ext));
exports.fetchFilesPromise = (filesUrls, ext) => {
    const promises = exports.fetchFiles(filesUrls, ext);
    return (callback) => promises.map((promise) => promise.then(callback));
};
//# sourceMappingURL=helpers.js.map