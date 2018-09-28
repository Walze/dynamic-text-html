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
exports.makeFile = (fileName, fileData) => ({
    name: fileName,
    data: fileData,
});
const fetchMakeFile = (ext) => async (path, name) => ({
    name: `${name}.${ext}`,
    data: await fetch(path)
        .then((response) => response.text()),
});
exports.fetchFiles = (urlsObj, ext) => exports.mapObjToArray(urlsObj, fetchMakeFile(ext));
exports.renderParcelFiles = (filesUrls, renderer) => {
    const newObj = filesUrls;
    delete newObj.default;
    return exports.fetchFiles(newObj, renderer.ext)
        .map((filePromise) => filePromise.then((file) => renderer.render(file)));
};
//# sourceMappingURL=helpers.js.map