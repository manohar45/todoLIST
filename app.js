const express=require("express");
const bodyParser=require("body-parser");
const mongoose= require("mongoose");
const load=require("lodash");

const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin:admin-test@cluster0.eaike.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemSchema=({
    name:String,
})

const listSchema=({
    name:String,
    items:[itemSchema]
})

const List=mongoose.model("List",listSchema);

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
    name:"Coding"
})

const item2=new Item({
    name:"Full Stack developement"
})

const item3=new Item({
    name:"Big Data"
})

 itemArray=[item1,item2,item3];


app.post("/",function(req,res){
    const itemadd=req.body.items;
    const addlist=req.body.button;
    const newitem=new Item({
        name:itemadd
    });

    if(addlist==="today")
    {
        newitem.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({name:addlist},function(err,foundlist){
            foundlist.items.push(newitem);
            foundlist.save();
            res.redirect("/"+addlist);
        })
    }
    
    
})

app.post("/delete",function(req,res){
    const itemdelete=req.body.checkeditem;
    const whichval=req.body.whichitem;
    if(whichval==="today")
    {
        Item.findByIdAndRemove({_id:itemdelete},function(err){
            if(err)
            {
                console.log("Not removed");
            }
            else
            {
                console.log("removed successfuly");
            }
        });
        res.redirect("/")
    }
    else
    {
        List.findOneAndUpdate({name:whichval},{$pull:{items:{_id:itemdelete}}},function(err,results){
            if(err)
            {
                console.log("Not removed");
            }
            else
            {
                console.log("removed successfuly!!!");
            }

        });
        res.redirect("/"+whichval);
    }
    
    
    
})

app.get("/",function(req,res){
    var date=new Date();
    var options={
         weekday:"long",
         day:"numeric",
         month:"long"
     };

    var today=date.toLocaleDateString("en-US",options);

    Item.find({},function(err,founditems){
        if(founditems.length === 0)
        {
            Item.insertMany(itemArray,function(err){
                if(err)
                {
                    console.log("Error occured");
                }
                else
                {
                    console.log("Successful");
                }
            });
           res.redirect("/") 
        }
        else
        {
            res.render("list",{today_date:"today",items_list:founditems});
        }
        
    })

    
});


app.get("/:topic",function(req,res){
    const val=load.capitalize(req.params.topic);
    List.findOne({name:val},function(err,foundList){
        if(!err)
        {
            if(!foundList)
            {
                const list=new List({
                    name:val,
                    items:itemArray
            
                });
            
                list.save();
                res.redirect("/"+ val);
            }
            else
            {
                res.render("list",{today_date:val,items_list:foundList.items});
            }
        }
    })
    
    
})




app.listen(process.env.PORT || 3000,function(){
    console.log("Server started");
})

