var downloadImgs = require('./ImgDownloader')


var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

let baseUrl = "http://www.ekkia.co.uk";

let PRODUCT_ID = "";


app.get('/scrape/:product', function(req, res){
    PRODUCT_ID = req.params.product;
        
    request.post({
        url: baseUrl + "/products/",
        form: {
            pattern_cat_id: 0,
            pattern: PRODUCT_ID
        },
        callback: onProductsResponse
    });
    
})

function onProductsResponse (error, response, html) {
    if (error) {
        console.error(error)
    }
    else {
        let $ = cheerio.load(html)
        let products = $('.produits').html();
        let numProducts = products.slice(products.indexOf("(")+1, products.indexOf(")"));
        console.log("Found", numProducts, "Products")
        
        if (numProducts > 1) {
            console.error("Too many products:", numProducts);
            return;
        }
        if (numProducts < 1) {
            console.error("Couldn't find product", PRODUCT_ID)
            return;
        }
        
        let productItem = $('.product_list_item').find('.product-over');
        let url = productItem.attr('onclick');
        
        
        
        //console.log(url);
        
        let first = url.indexOf("'/products/");
        let last = url.lastIndexOf("'); return false;");
        
        url = url.slice(first+1, last)
        let productUrl = url
        console.log("Product URL:");
        console.log(url)
        getProductPagePhotos(url)
    }
    
    
    // console.log(response)
    //   console.log(html)
}

function getProductPagePhotos(url) {
    request.post({
        url: baseUrl + url,
        form: {
            pattern_cat_id: 0,
            pattern: PRODUCT_ID
        },
        callback: onProductPageResponse
    });
    
    function onProductPageResponse(error, response, html) {
        if (error) {
            console.error(error)
        }
        else {
            const start = `display_popup("main_popup_container","display_image_galerie",`
            const end = `);`
            
            
            let $ = cheerio.load(html)
            //console.log(html)
            let imgs = Object.values($(".products_details").find(".img_viewer").children());
            imgs = imgs.filter((e) => {
                return e.attribs !== undefined && e.attribs.onclick !== undefined
            })
            
            imgs = imgs.map((e)=>{
                let onclick = e.attribs.onclick
                // console.log(onclick);
                let startIndex = onclick.indexOf(start) + start.length
                let endIndex = onclick.lastIndexOf(end)
                // console.log(startIndex)
                // console.log(endIndex)
                let img = onclick.slice(startIndex, endIndex);
                return baseUrl + JSON.parse(JSON.parse(img)).src;
            })
            
            downloadImgs(PRODUCT_ID, imgs);
        }
    }
}

app.listen('8082')

console.log('Starting on port 8082');

exports = module.exports = app;