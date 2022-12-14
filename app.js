const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("Item", itemSchema);

let newListItems = ["Buy Food", "Cook Food", "Eat Food"];
let newWorkItems = [];
app.get("/", (req, res) => {
    res.render("list", { listTitle: "Today", items: newListItems });
});

app.post("/", (req, res) => {
    if (req.body.list === "Work List") {
        let newItem = req.body.newItem;
        if (newItem) {
            newWorkItems.push(newItem);
        }
        res.redirect("/work");
    } else {
        let newItem = req.body.newItem;
        if (newItem) {
            newListItems.push(newItem);
        }
        res.redirect("/");
    }
});

app.get("/work", (req, res) => {
    res.render("list", { listTitle: "Work List", items: newWorkItems });
});

app.post("/work", (req, res) => {});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
