'use strict';

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const https = require('https')
const request = require('request');

app.get('/', (req, res)  => {
  res.send('Hello, World!')
  res.end()
});

// app.use(express.static("static"));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/ebayapi', (req,res) => {
  var form = req.query
  var url = formURL(form)
  console.log('URL - '+url)
  
  https.get(url, (resp) => {
    let data = ''
    resp.on('data', (chunk) =>{
      data+=chunk
    })
    resp.on('end', () => {
      res.json(JSON.parse(data))
      // console.log(JSON.parse(data).findItemsAdvancedResponse[0].paginationOutput[0].totalEntries[0])
    })
  })
});



function formURL(form){
  var entriesPerPage = 1000
  var url = "https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=RishabhB-csci571-PRD-92eb6be68-f2def3d6&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords="+form.key+"&paginationInput.entriesPerPage="+entriesPerPage

  if (Object.keys(form).includes('sort')){
    var val = form.sort
    if (val=='best'){
        url+='&sortOrder=BestMatch'
    } else if(val=='phigh'){
        url+='&sortOrder=CurrentPriceHighest'
    }else if (val=='pshigh'){
        url+='&sortOrder=PricePlusShippingHighest'
    }else if(val=='pslow'){
        url+='&sortOrder=PricePlusShippingLowest'
    }
  }

  var i=0  
  var flag=true
  var j=0
  var condRef = {"new":1000, "used":3000, "vgood":4000, "good":5000, "acceptable":6000,"unspecified":"Unspecified"}
  var arr = ["new","used","vgood","good","acceptable","unspecified"]

  for (var cond=0;cond<arr.length;cond++){
    if (Object.keys(form).includes(arr[cond])){
        if (flag){
            i+=1
            flag=false
            url+='&itemFilter(0).name=Condition' 
        }
        url+='&itemFilter(0).value('+j+')='+condRef[arr[cond]]
        j+=1
    }
  }

  for (let [key, val] of Object.entries(form)) {
    if (!val || key=='key' || key=='sort'){
        continue
    }else if (key=='price1'){
      if (!val){
          val=0
          continue
      }
      url+='&itemFilter('+i+').name=MinPrice&itemFilter('+i+').value='+val
      url+='&itemFilter('+i+').paramName=Currency&itemFilter('+i+').paramValue=USD'
      i+=1
    }else if (key=='price2'){
      if (!val){
          val=0
          continue
      }
      url+='&itemFilter('+i+').name=MaxPrice&itemFilter('+i+').value='+val
      url+='&itemFilter('+i+').paramName=Currency&itemFilter('+i+').paramValue=USD'
      i+=1
    }else if (key=='seller'){
      url+='&itemFilter('+i+').name=ReturnsAcceptedOnly&itemFilter('+i+').value=true'
      i+=1
    }else if (key=='free'){
      url+='&itemFilter('+i+').name=FreeShippingOnly&itemFilter('+i+').value=true'
      i+=1
    }else if (key=='expedited'){
      url+='&itemFilter('+i+').name=ExpeditedShippingType&itemFilter('+i+').value=Expedited'
      i+=1
    }
  }
  return url
}

function parseAPIReponse(raw){
  // console.log(raw, 'GOT A PROPER RAW DATA')
    var data = raw
    var items = []
    var count=0
    var total = data.findItemsAdvancedResponse[0].paginationOutput[0].totalEntries[0]
    
    if (!parseInt(total)){
        return {'items':items, 'total':total}
    }

    for (var i=0; i<data.findItemsAdvancedResponse[0].searchResult[0].item.length; i++){
        try{
            parsed = {}
            item = data.findItemsAdvancedResponse[0].searchResult[0].item[i]
            parsed['url'] = item.galleryURL[0]
            parsed['title'] = item.title[0]
            parsed['categ'] = item.primaryCategory[0].categoryName[0]
            parsed['prod_link'] = item.viewItemURL[0]
            parsed['condition'] = item.condition[0].conditionDisplayName[0]
            parsed['top_rated'] = item.topRatedListing[0]
            parsed['returns'] = item.returnsAccepted[0]
            parsed['shipping'] = item.shippingInfo[0].shippingServiceCost[0].__value__
            parsed['exp_ship'] = item.shippingInfo[0].expeditedShipping[0]
            parsed['price'] = item.sellingStatus[0].convertedCurrentPrice[0].__value__
            parsed['ships_from'] = item.location[0]
            items.push(parsed)
            count+=1
            if(count==10){
              break
            }
        } catch(err){
            continue
        }
    } 
    return {'items':items, 'total':total}
}


// Start the server
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});