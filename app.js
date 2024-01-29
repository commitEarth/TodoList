const express = require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");

const app = express();

app.set('view engine','ejs') // to use ejs file stored in folder views as "kist.ejs"
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public")); // to use css for my kist.ejs

// mongoose.connect("mongodb://127.0.0.1:27017/todoListDB"); // localhost:27017:not-works this id for local databse
// mongoose.connect("mongodb+srv://riyanpatel66mb:DSABzBpostZdaPMP@cluster1st.zz9qka7.mongodb.net/todoListDB"); // mongo atlas AWS database
const url ="mongodb+srv://riyanpatel66mb:DSABzBpostZdaPMP@cluster1st.zz9qka7.mongodb.net/todoListDB"
mongoose.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, res) {
        try {
            console.log('Connected to Database');
        } catch (err) {
            throw err;
        }
    });

// itemschema for home page , list schema for custom dyanamic list pages
const itemSchema = {
  name:String
}

const  ListSchema = {
  name:String,
  List:[itemSchema]
}


// two models = two collections
const items=mongoose.model("item",itemSchema);
const list = mongoose.model("List",ListSchema);


// creating default items for non-empty pages
const item1a =new items({
  name:"Welcome !"
})
const item2b =new items({
  name:"Hit the + to add tasks"
})
const item3c =new items({
  name:"Hit the checkbox to delete"
})
const defaultItem =[item1a,item2b,item3c];


// get request for starter home page
app.get("/", function(req,res){

  var date = new Date();
  var options={weekday:"long",day:"numeric",month:"long"};
  var today = date.toLocaleDateString("en-US",options);//options help us to define favourble type of time-data

  items.find().then(function(data){
    // logic so that defualt items are not uodated again and gain
    if(data.length==0){
      items.insertMany(defaultItem);
      res.redirect("/");
    }
    else{
      res.render("kist",{newListItem:data,today:today});
    }
  })

})

//get request for user-defined sublists
app.get("/:newList",function(req,res){

list.findOne({name:req.params.newList}).then(function (data){
  var currList=req.params.newList; // newList is heading of the sublist


  //sublist exist:render it, Else create a sublist with heading and default items as starter data
  if(data){
    res.render("kist",{newListItem:data.List,today:currList});

  }
  else{
    var curr = new list({
      name:currList,
      List:defaultItem
    });
    list.insertMany([curr]);
    res.redirect("/"+currList);
  }

})

})

// post request for adding the tasks
app.post("/", function(req,res){
  var currHead=req.body.button;

  list.findOne({name:currHead}).then(function(data){
    if(data){
      var currItem = new items({
        name:req.body.textInput
      })
    data.List.push(currItem);
    data.save();
    res.redirect("/"+currHead)
   }
   else{
      var temp=new items({
       name:req.body.textInput
     })
    items.insertMany([temp]);
    res.redirect("/");
   }
  })

})

//post request for a deleting from both types of model ,using logic
app.post("/delete",function(req,res){

  list.findOne({name:req.body.titleOf}).then(function(data){
    if(data){
      list.updateMany({name:req.body.titleOf},{$pull:{List:{_id:req.body.checkbox}}} ).then(function(doc,err){
        if(err){
          console.log(err);
        }
      });
      res.redirect("/"+req.body.titleOf);
    }
    else{
      items.deleteMany({_id:req.body.checkbox}).then(function(doc,err){
      if(err){
        console.log(err);
      }
      })
      res.redirect("/");
    }
    })
})

// if(port==null || port=""){
//   port=3000;
// }
app.listen(process.env.PORT ||3000 ,function(){
  console.log("Website ON (if localhost port 3000)");
})
