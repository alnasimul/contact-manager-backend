const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectID = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.66naq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1});

client.connect(err => {
    const numbers = client.db(process.env.DB_NAME).collection("numbers");

    // perform actions on the collection object

    app.post(`/insertContact`,(req, res) => {
        const data = req.body;
        numbers.insertOne({...data})
        .then((result) => {
            res.status(200).send(result.acknowledged);
          });
        console.log(data)
    })

    app.get(`/loadContact`, (req, res) => {
      numbers.find({})
      .toArray((err, documents) => {
        res.status(200).send(documents);
      });
    })

    app.patch(`/updateContact/:id`, (req, res) => {
      const id = req.params.id;
      const data = req.body;
      numbers
      .updateOne(
        { _id: ObjectID(id) },
        {
          $set: { ...data },
        }
      )
      .then((result) => {
        res.status(200).send(result.modifiedCount > 0);
      })
      .catch((err) => console.log(err));
      console.log(data)
    })

    app.delete("/deleteContact/:id", (req, res) => {
      const id = req.params.id;
  
      numbers
        .deleteOne({ _id: ObjectID(id) })
        .then((result) => {
          res.status(200).send(result.deletedCount > 0);
        })
        .catch((err) => console.log(err));
    });
  
    console.log('Connected to mongo instance')

  });

app.get("/", (req, res) => {
    res.send("Hello from contact manager server");
});



app.listen(process.env.PORT || 4000, () => {
    console.log("server is ready");
});  