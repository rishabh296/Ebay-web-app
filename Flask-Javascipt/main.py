from flask import Flask, request, send_from_directory
import requests
import json
import os
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__,static_url_path="",static_folder='static')

@app.route("/")
def home():
    return "No Results to Show Yet!"

@app.route("/index.html")
def index():
    return send_from_directory(r"./static/", 'form.html')

@app.route("/endpoint.html")
def endpoint():
    query = {"key":"mask", "price1":"30","price2":"50","new":"on","expedited":"on", "sort":"pshigh"}
    response = callAPI(query)
    itemDict = parseAPIReponse(response)
    return itemDict


@app.route("/ebayapi", methods=['GET'])
def new():
    try:
        form = dict(request.args)
        response = callAPI(form)
        itemDict = parseAPIReponse(response)
        return itemDict
    except:
        return {'items':[], 'total':0}

def callAPI(form):
    # print(form)
    entriesPerPage = 1000
    url = "https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=RishabhB-csci571-PRD-92eb6be68-f2def3d6&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords="+form['key']+"&paginationInput.entriesPerPage="+str(entriesPerPage)

    if 'sort' in form.keys():
        val = form['sort']
        if val=='best':
            url+='&sortOrder=BestMatch'
        elif val=='phigh':
            url+='&sortOrder=CurrentPriceHighest'
        elif val=='pshigh':
            url+='&sortOrder=PricePlusShippingHighest'
        elif val=='pslow':
            url+='&sortOrder=PricePlusShippingLowest'

    i=0  
    flag=True
    j=0
    condRef = {'new':1000, 'used':3000, 'vgood':4000, 'good':5000, 'acceptable':6000,}
    for cond in ['new','used','vgood','good','acceptable']:
        if cond in form.keys():
            if flag:
                i+=1
                flag=False
                url+='&itemFilter(0).name=Condition'      
            url+='&itemFilter(0).value('+str(j)+')='+str(condRef[cond])
            j+=1
    # print(url)
    for key,val in form.items():
        if not val or key=='key' or key=='sort':
            continue
        elif key=='price1':
            if not val:
                val=0
                continue
            url+='&itemFilter('+str(i)+').name=MinPrice&itemFilter('+str(i)+').value='+val
            url+='&itemFilter('+str(i)+').paramName=Currency&itemFilter('+str(i)+').paramValue=USD'
            i+=1
        elif key=='price2':
            if not val:
                val=0
                continue
            url+='&itemFilter('+str(i)+').name=MaxPrice&itemFilter('+str(i)+').value='+val
            url+='&itemFilter('+str(i)+').paramName=Currency&itemFilter('+str(i)+').paramValue=USD'
            i+=1
        elif key=='seller':
            url+='&itemFilter('+str(i)+').name=ReturnsAcceptedOnly&itemFilter('+str(i)+').value=true'
            i+=1
        elif key=='free':
            url+='&itemFilter('+str(i)+').name=FreeShippingOnly&itemFilter('+str(i)+').value=true'
            i+=1
        elif key=='expedited':
            url+='&itemFilter('+str(i)+').name=ExpeditedShippingType&itemFilter('+str(i)+').value=Expedited'
            i+=1
    if 'ReturnsAcceptedOnly' not in url:
        url+='&itemFilter('+str(i)+').name=ReturnsAcceptedOnly&itemFilter('+str(i)+').value=false'
        i+=1
    if 'FreeShippingOnly' not in url:
        url+='&itemFilter('+str(i)+').name=FreeShippingOnly&itemFilter('+str(i)+').value=false'
        i+=1
    #print(url)
    # writeToTxt(url)
    response = requests.get(url)
    # print(response)
    # print(type(response.content), response.content)
    return response

def writeToTxt(s):
    text_file = open(r"./url.txt", "w")
    text_file.write(s)
    text_file.close()

def parseAPIReponse(response):
    data = json.loads(response.content)
    # print(data)
    items = []
    count=0
    total = data['findItemsAdvancedResponse'][0]['paginationOutput'][0]['totalEntries'][0]
    # print('Items Count - ', len(data['findItemsAdvancedResponse'][0]['searchResult'][0]['item']), total)
    if not int(total):
        return {'items':items, 'total':total}
    for i in range(len(data['findItemsAdvancedResponse'][0]['searchResult'][0]['item'])):
        try:
            parsed = {}
            item = data['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][i]
            parsed['url'] = item['galleryURL'][0]
            parsed['title'] = item['title'][0]
            parsed['categ'] = item['primaryCategory'][0]['categoryName'][0]
            parsed['prod_link'] = item['viewItemURL'][0]
            parsed['condition'] = item['condition'][0]['conditionDisplayName'][0]
            parsed['top_rated'] = item['topRatedListing'][0]
            parsed['returns'] = item['returnsAccepted'][0]
            parsed['shipping'] = item['shippingInfo'][0]['shippingServiceCost'][0]['__value__']
            parsed['exp_ship'] = item['shippingInfo'][0]['expeditedShipping'][0]
            parsed['price'] = item['sellingStatus'][0]['convertedCurrentPrice'][0]['__value__']
            parsed['ships_from'] = item['location'][0]
            items.append(parsed)
            count+=1
            if count==10:
                break
        except:
            continue
    return {'items':items, 'total':total}

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8080, debug=True)
