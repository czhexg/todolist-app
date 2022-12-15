const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded());
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("Item", itemSchema);

const defaultItem1 = new Item({ name: "Default Item 1" });
const defaultItem2 = new Item({ name: "Default Item 2" });
const defaultItem3 = new Item({ name: "Default Item 3" });

const defaultItems = [defaultItem1, defaultItem2, defaultItem3];

const listSchema = {
    name: String,
    items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

let newWorkItems = [];
app.get("/", (req, res) => {
    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("successfully saved items into db");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", items: foundItems });
        }
    });
});

app.get("/:customListName", (req, res) => {
    const customListName = _.startCase(req.params.customListName);

    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (foundList) {
                res.render("list", {
                    listTitle: foundList.name,
                    items: foundList.items,
                });
            } else {
                const list = new List({
                    name: customListName,
                    items: defaultItems,
                });

                list.save();
                res.redirect("/" + customListName);
            }
        }
    });
});

app.post("/", (req, res) => {
    const newItem = req.body.newItem;
    const listName = req.body.listName;
    const newItemDoc = new Item({ name: newItem });

    if (listName === "Today") {
        if (newItem) {
            newItemDoc.save();
        }
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(newItemDoc);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", (req, res) => {
    const listName = req.body.listName;
    const toDeleteId = req.body.toDelete;

    if (listName === "Today") {
        Item.findOneAndDelete({ _id: toDeleteId }, (err, result) => {
            if (!err) {
                console.log("\nDeleted: " + result);
            }
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: toDeleteId } } },
            (err) => {
                if (!err) {
                    res.redirect("/" + listName);
                }
            }
        );
    }
});

app.get("/work", (req, res) => {
    res.render("list", { listTitle: "Work List", items: newWorkItems });
});

app.post("/work", (req, res) => {});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
