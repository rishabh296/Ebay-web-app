import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'input-form-data',
  templateUrl: './input-form-data.component.html',
  styleUrls: ['./input-form-data.component.css']
})

export class InputFormDataComponent implements OnInit {

  submitted = false;
  showResults = false;
  userForm: FormGroup;
  SERVER_URL = "/ebayapi?";
  uploadForm: FormGroup;
  invalid_key = false
  invalid_range=false
  responseData = 'Random String'
  data:Array<any>
  totalItem: Number
  p:number=1
  config: any;
  items = []
  noResult = false
  selectedOption = 'best'
  resultsFor = ''

  collection = { count: 60, data1: [] }
  
 
  constructor(private formBuilder: FormBuilder, private http:HttpClient) {
    this.data = new Array<any>()
    this.config = {
      itemsPerPage: 5,
      currentPage: this.p,
    }

    for (var i = 0; i < this.collection.count; i++) {
      this.collection.data1.push(
        {
          id: i + 1,
          value: "items number " + (i + 1)
        }
      );
    }
  }

  pageChanged(event){
    this.config.currentPage = event;
    for(let x=0;x<6;x++){
      this.items[x]['flag']=false
    }
  }

  invalidKey(){
    if (this.userForm.controls.key.value=='' || this.userForm.controls.key.value==null){
      this.invalid_key=true
    }else{
      this.invalid_key=false
    }
  }  
  
  invalidRange(){
    if (this.submitted){
      if (((this.userForm.controls.price1.value!='' || this.userForm.controls.price1.value==null) &&  parseInt(this.userForm.controls.price1.value)<0) || ((this.userForm.controls.price2.value!='' || this.userForm.controls.price2.value==null) &&  parseInt(this.userForm.controls.price2.value)<0) 
      || ((this.userForm.controls.price1.value!='' || this.userForm.controls.price1.value==null) && (this.userForm.controls.price2.value!='' || this.userForm.controls.price2.value==null) && parseInt(this.userForm.controls.price1.value)>parseInt(this.userForm.controls.price2.value))){
        this.invalid_range=true
        this.submitted=false
      }else{
        this.invalid_range=false
        this.submitted=false
      }
    }
  } 

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
  		key: [''],
      price1: [''],
      price2: [''],
      new: [''],
      good: [''],
      vgood: [''],
      used: [''],
      acceptable: [''],
      seller: [''], 
      free: [''],
      expedited: [''],
      sort: ['']
      
    });
    
  }

  onSubmit(){
    this.submitted = true
    this.showResults=false
    this.items = []
    this.totalItem=0
    const formData = new FormData();
    var flag = false
    this.invalidKey()
    this.invalidRange()
    // this.p=1

    if (!this.invalid_range && !this.invalid_key){
      this.resultsFor = this.userForm.controls.key.value
      this.SERVER_URL = this.createUrl()
      this.getData(this.SERVER_URL)
    }else{
      this.noResult=false
    }
  }

  prepareData(){
    var count=0
    var otherCount =0
    // alert('Size of Data - '+this.data.length)
    for (let item of this.data){
      try{
        var parsed = {}
        parsed['url'] = item.galleryURL[0]
        parsed['title'] = item.title[0]
        parsed['categ'] = item.primaryCategory[0].categoryName[0]
        parsed['prod_link'] = item.viewItemURL[0]
        parsed['condition'] = item.condition[0].conditionDisplayName[0]
        parsed['top_rated'] = item.topRatedListing[0]
        parsed['returns'] = item.returnsAccepted[0]
        parsed['shipping'] = item.shippingInfo[0].shippingServiceCost[0].__value__
        parsed['exp_ship'] = item.shippingInfo[0].expeditedShipping[0] == 'true'
        parsed['price'] = item.sellingStatus[0].convertedCurrentPrice[0].__value__
        if (parsed['price'] == undefined || parsed['shipping'] == undefined){
          continue
        }
        parsed['ships_from'] = item.location[0]
        
        parsed['ship_type'] = item.shippingInfo[0].shippingType[0]
        parsed['shipToLoc'] = item.shippingInfo[0].shipToLocations[0]
        parsed['oneDay'] = item.shippingInfo[0].oneDayShippingAvailable[0] == 'true'
        parsed['bestOffer'] = item.listingInfo[0].bestOfferEnabled[0] == 'true'
        parsed['buyItNow'] = item.listingInfo[0].buyItNowAvailable[0] == 'true'
        parsed['listingType'] = item.listingInfo[0].listingType[0]
        parsed['gift'] = item.listingInfo[0].gift[0] == 'true'
        parsed['watchCount'] = item.listingInfo[0].watchCount[0]
        parsed['flag'] = false
        this.items.push(parsed)
        count+=1
        if(count==200){
          break
        }
      } catch(err){
        otherCount+=1
      }
    }
  }

  clear(){
    this.invalid_key=false;
    this.submitted=false
    this.invalid_range = false
    this.showResults = false;
    this.noResult = false
    return true
  }

  createUrl(){
    var url = "https://angproj8.wl.r.appspot.com/ebayapi?"
    for (let k of Object.keys(this.userForm.controls)){
      if(this.userForm.controls[k].value){
        url+=k+'='+this.userForm.controls[k].value+'&'
      }
    }
    url+='sort='+this.selectedOption
    // return url.substring(0,url.length-1)
    return url
  }

  getData(url:string){
    this.http.get(url).subscribe((resp:any)=>{
      this.responseData = resp
      this.totalItem = resp.findItemsAdvancedResponse[0].paginationOutput[0].totalEntries[0]
          
      if(this.totalItem!=0){
        this.data = resp.findItemsAdvancedResponse[0].searchResult[0].item
      }
      this.noResult = this.totalItem==0 || this.data.length==0
      if(!this.noResult){
        this.p=1
        this.config.currentPage=1
        this.prepareData()
        if(this.items.length!=0){
          this.showResults=true
          this.noResult=false
        }else{
          this.noResult=true
        }
      }
    },error=>{
      // console.log('There is an error - ',error)
    })
  }

  details(event){
    var target = event.target || event.srcElement || event.currentTarget;
    var id = target.attributes.id.nodeValue;
    if(!this.items[id].flag){
      this.items[id].flag=true
    }else{
      this.items[id].flag=false
    }

  }

}