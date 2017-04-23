var fs = require("fs")
var url = require("url");
var request = require('request');

module.exports = function downloadImgs(PRODUCT_ID, imgs) {
    console.log("Fetching images for product: " + PRODUCT_ID);
    let dir = createDirForProduct(PRODUCT_ID, (dir) => {
        imgs.forEach((imgUrl)=> {
            downloadImgToDir(dir, imgUrl);
        })
        console.log("Done!")
    });
}

function createDirForProduct(PRODUCT_ID, callback) {
    let dir = "./" + PRODUCT_ID;
    fs.mkdir(dir, (err) => {
        if (err && err.errno != -17) {
            console.error(err)
            throw err;
        }
        callback(dir);
    })
}

function downloadImgToDir(dir, imgUrl) {
    let writePath = url.parse(imgUrl).pathname;
    writePath =  dir + "/" + writePath.slice(writePath.lastIndexOf("/")+1, writePath.length);
    
    request(imgUrl)
    .pipe(fs.createWriteStream(writePath).on('close', () => {
        console.log(writePath, "Saved")
    }));
    
}