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
// const fetchMakeFile = (ext: string) =>
//   async (path: string, name: string): Promise<IFileType> => ({
//     name: `${name}.${ext}`,
//     data: await fetch(path)
//       .then((response) => response.text()),
//   })
exports.fetchMakeFile = (ext) => async (path, name) => exports.makeFile(`${name}.${ext}`, await fetch(path)
    .then((response) => response.text()));
exports.fetchFiles = (urlsObj, ext) => exports.mapObjToArray(urlsObj, exports.fetchMakeFile(ext));
exports.fetchFilesPromise = (filesUrls, ext) => {
    const newObj = filesUrls;
    delete newObj.default;
    const promises = exports.fetchFiles(newObj, ext);
    return (callback) => promises.map((promise) => promise.then(callback));
};
//# sourceMappingURL=helpers.js.map