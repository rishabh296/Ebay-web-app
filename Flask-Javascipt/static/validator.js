var response = null
var last = null
var link_clicked = false
var three = [false,false,false]

document.querySelector('form').addEventListener("submit", function(e){
    e.preventDefault();
    valid();
});

document.querySelector('form').addEventListener("reset", function(e){
    document.getElementById('container').innerHTML=""
});


function valid(){
    if(parseInt(price1.value)<0 || parseInt(price2.value)<0){
        window.alert('Price Range values cannot be negative! Please try a value greater than or equal to 0.0')
        return false
    }else if (price1.value.length!=0 && price2.value.length!=0 && parseInt(price1.value)>parseInt(price2.value)){
        alert('Oops! Lower price limit cannot be greater than upper price limit! Please try again.')
        return false   
    }else{
        var data = new FormData(document.getElementById('form'))
        var form = new URLSearchParams(data).toString()
        
        var request = new XMLHttpRequest();
        request.open('GET', '/ebayapi?'.concat(form), true);
        request.send()

        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                response = JSON.parse(request.responseText);
                displayResults(response,2)
            }
        };
    }

}

var minimize = function(){
    // alert('In minimize')
    box = document.getElementById(this.getAttribute('data-index'))
    last = this.getAttribute('data-index')
    if (parseInt(last)<3){
        three[parseInt(last)]=false
        // alert('In Minimize - '+parseInt(last)+' and three assigned - '+ three)
    }
    box.innerHTML = smallCard(this.getAttribute('data-index'))
    var links = document.querySelectorAll("[data-skip]")
    for (index = 0; index < links.length; index++) { 
        links[index].addEventListener('click', link_click, false); 
    }
    // alert('Im minimize')
}

var link_click = function(){
    link_clicked = true
    // alert(link_clicked+" in link_click")
}

var expand = function() {
    // alert(link_clicked+" in expand")
    if (last!=this.id && !link_clicked) {
        // alert('Inside expand - '+ this.id)
        // alert(typeof(this.id))
        if (parseInt(this.id)<3){
            three[parseInt(this.id)]=true
            // alert('In Maximize - '+parseInt(this.id)+' and three assigned - '+ three)
        }
        this.innerHTML = bigCard(this.id);
        var cross = this.getElementsByClassName("close")[0];
        cross.addEventListener('click', minimize, false);
        var links = document.querySelectorAll("[data-skip]")
        for (index = 0; index < links.length; index++) { 
            links[index].addEventListener('click', link_click, false); 
        }
    }else{
        last = null
        link_clicked = false
    }
};

function bigCard(i){
    var item = response.items[i]
    if (item.url=="https://thumbs1.ebaystatic.com/pict/04040_0.jpg"){
        item.url = 'ebay_default.jpg'
    }
    card = "<div class='imageBox'><img src='"+item.url+"' alt='Product Image' class='productImage'></div><div class='card_content'>"
    card = card.concat("<div class='close' data-index="+i+">❌</div>")
    card = card.concat("<p class='card_spacing elipse' style='padding-top: 0%; white-space: normal;'><b><a href='"+item.prod_link+"' target='_blank'>"+item.title+"</a></b></p>")
    card = card.concat("<p class='card_spacing'>Category: <i>"+item.categ+"</i><a href='"+item.prod_link+"' target='_blank' data-skip='redirect' class='redir'><img src='redirect.png' data-skip='redirect' style='width: 15px; height:15px; vertical-align: top; padding-left: 1%;'></a></p>")
    card = card.concat("<p class='card_spacing'>Condition: "+item.condition)
    if (item.top_rated=='true'){
        card = card.concat("<img src='topRatedImage.png' style='width: 25px; vertical-align: middle; padding-left: 8px;'>")
    }
    card = card.concat("</p>")
    if (item.returns){
        card = card.concat("<p class='card_spacing'>Seller <b>accepts</b> returns</p>")    
    }else{
        card = card.concat("<p class='card_spacing'>Seller <b>does not accept returns</b></p>")
    }
    if (item.shipping==0){
        card = card.concat("<p class='card_spacing'>Free Shipping ")    
    }else{
        card = card.concat("<p class='card_spacing'>No Free Shipping ")
    }
    if (item.exp_ship){
        card = card.concat("-- Expedited Shipping available")    
    }
    card = card.concat("</p>")

    if (item.shipping==0){
        card = card.concat("<p class='card_spacing' style='padding-bottom: 3%;'><b>Price: $"+item.price+"</b> <i>From "+item.ships_from+"</i></p>")
    }else{
        card = card.concat("<p class='card_spacing' style='padding-bottom: 3%;'><b>Price: $"+item.price+" ( + $"+item.shipping+" for shipping)</b> <i>From "+item.ships_from+"</i></p>")
    }
    card = card.concat("</div>")
    // card = card.concat("<div class='close_box'><span class='close' data-index="+i+">❌</span></div>")

    var links = document.querySelectorAll("[data-skip]")
    for (index = 0; index < links.length; index++) { 
        links[index].addEventListener('click', link_click, false); 
    }
    return card
}

function smallCard(i){
    var item = response.items[i]
    if (item.url=="https://thumbs1.ebaystatic.com/pict/04040_0.jpg"){
        item.url = 'ebay_default.jpg'
    }
    card = "<div class='imageBox'><img src='"+item.url+"' alt='Product Image' class='productImage'></div><div class='card_content'>"
    card = card.concat("<p class='card_spacing elipse' style='padding-top: 3%;'><b><a href='"+item.prod_link+"' target='_blank'>"+item.title+"</a></b></p>")
    card = card.concat("<p class='card_spacing'>Category: <i>"+item.categ+"</i><a href='"+item.prod_link+"' target='_blank' data-skip='redirect' class='redir'><img src='redirect.png' data-skip='redirect' target='_blank' style='width: 15px; height:15px; vertical-align: top; padding-left: 1%;'></a></p>")
    card = card.concat("<p class='card_spacing'>Condition: "+item.condition)
    if (item.top_rated=='true'){
        // alert(item.top_rated)
        // alert(typeof(item.top_rated))
        card = card.concat("<img src='topRatedImage.png' style='width: 25px; vertical-align: middle; padding-left: 8px;'>")
    }
    card = card.concat("</p>")
    if (item.shipping==0){
        card = card.concat("<p class='card_spacing' style='padding-bottom: 3%;'><b>Price: $"+item.price+"</b></p>")
    }else{
        card = card.concat("<p class='card_spacing' style='padding-bottom: 3%;'><b>Price: $"+item.price+" ( + $"+item.shipping+" for shipping)</b></p>")
    }
    card = card.concat("</div>")
    
    return card
    // return "Test Code With No Fucking TAGS"
}

var show = function(){
    if (this.value=='more'){
        displayResults(response,10);
        window.scrollTo(0,document.body.scrollHeight);
    }else{
        // window.scrollTo(document.body.scrollHeight,0);
        displayResults(response,2);
        window.scrollTo(document.body.scrollHeight,0);
        // window.scrollTo(0,0);
    }
}

function displayResults(data,cutoff){
    var flag = true
    if (data.total==0 || data.items.length==0){
        cards = "<div style='margin-top:50px;'><h2 class='total'>No Results found</h2></div>"
        document.getElementById('container').innerHTML = cards
    }else{
        var resultsCount = 0
        resultsCount=data.total

        cards = "<div><h2 class='total'>"+resultsCount+" Results found for <i>"+document.getElementById('key').value+"</i></h2></div><hr>"
        j=0
        for(i in data.items){
            var card = "<div class='productBox' id="+i+">"
            if(i<3 && three[i]===true){
                card = card.concat(bigCard(i))
            }else{
                card = card.concat(smallCard(i))
            }
            card = card.concat("</div>")
            cards = cards.concat(card)
            j=i
            if (i==cutoff && cutoff+1<data.items.length){
                cards = cards.concat("<div class='show_more'><button value='more' id='show' class='show_button'>Show More</button></div>")
                flag = false
                break
            }
        }
        if(flag & data.items.length>3){
            cards = cards.concat("<div class='show_more'><button value='less' id='show' class='show_button'>Show Less</button></div>")
        }
        document.getElementById('container').innerHTML = cards
        
        var elements = document.getElementsByClassName("productBox");
        for (j; j>=0; j--) {
            if(j<3 && three[j]===true){
                elements[j].getElementsByClassName("close")[0].addEventListener('click', minimize, false);    
            }
            elements[j].addEventListener('click', expand, false);
        }

        var links = document.querySelectorAll("[data-skip]")
        for (index = 0; index < links.length; index++) { 
            links[index].addEventListener('click', link_click, false); 
        }

        document.getElementById('show').addEventListener('click',show,false);
        
    }
}