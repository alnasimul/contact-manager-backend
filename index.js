const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { Parser } = require("json2csv");
const csvToJson = require("csvtojson");
const fs = require("fs");
const ObjectID = require("mongodb").ObjectId;
require("dotenv").config();

const ws = fs.createWriteStream("./contacts.csv");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.66naq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

client.connect((err) => {
  const numbers = client.db(process.env.DB_NAME).collection("numbers");

  // perform actions on the collection object

  app.post(`/insertContact`, (req, res) => {
    const data = req.body;
    numbers.insertOne({ ...data }).then((result) => {
      res.status(200).send(result.acknowledged);
    });
    console.log(data);
  });

  app.get(`/loadContact`, (req, res) => {
    numbers.find({}).sort({name: 1}).toArray((err, documents) => {
      res.status(200).send(documents);
    });
  });

  app.get(`/loadContactsBySearch`, (req, res) => {

    const search = req.query.search;

    numbers.find({name: { $regex: search, $options: '-i'} } ).sort({name: 1})
    .toArray((err, documents) => {
      res.status(200).send(documents);
    });
  })

  app.get(`/getContactBySelectedCompany`,(req, res) => {
      const company = req.query.company;

      numbers.find({company})
      .toArray((err, documents) => {
        res.status(200).send(documents)
      })
  })

  app.get(`/backupContacts`, (req, res) => {
    numbers.find({}).sort({name: 1}).toArray((err, documents) => {
      res.status(200).send(documents);

      // const fields = ["_id", "name", "email", "home", "company", "numbers"];
      // const transforms = [unwind({ paths: ["numbers", "numbers.value"] })];
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(documents);
    //  console.log(csv);

      fs.writeFileSync("./contacts.csv", csv);
      // csv()
      //   .fromFile(contacts)
      //   .then((jsonObj) => {
      //     console.log(jsonObj);
      //     /**
      //      * [
      //      * 	{a:"1", b:"2", c:"3"},
      //      * 	{a:"4", b:"5". c:"6"}
      //      * ]
      //      */
      //   })
    });
  });

  app.get(`/restoreContacts`, (req, res) => {
    const csvFilePath = "./contacts.csv";
    csvToJson()
      .fromFile(csvFilePath)
      .then((jsonArray) => {
        
        let fullyParsedContacts = []
        jsonArray.forEach( el => {
          const newEl = {...el}
          newEl.numbers =  JSON.parse(el.numbers)
          fullyParsedContacts.push(newEl)

        })

     //   console.log(fullyParsedContacts)

       // console.log(JSON.stringify(jsonObj));
      //  console.log(JSON.parse(JSON.stringify(jsonObj)))

        fs.writeFile ("./contacts.json", JSON.stringify(fullyParsedContacts) , function(err) {
          if (err) throw err;
          res.status(200).send(true)
          }
      );
      });
  });

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
    console.log(data);
  });

  app.delete("/deleteContact/:id", (req, res) => {
    const id = req.params.id;

    numbers
      .deleteOne({ _id: ObjectID(id) })
      .then((result) => {
        res.status(200).send(result.deletedCount > 0);
      })
      .catch((err) => console.log(err));
  });

  app.delete(`/deleteMultipleContacts/:ids`, (req, res) => {
    const selectedContacts = req.params.ids.split(",");

  // const parsedSelectedContacts = selectedContacts.split(",")

  // console.log(parsedIds)

    selectedContacts.forEach((id) => {

     // console.log(JSON.stringify(id), index)
      numbers.deleteOne({_id : ObjectID(id)})
      .then(result => {
        res.status(200).send(result.deletedCount > 0)
      })
    });

    console.log(selectedContacts)
  })

  console.log("Connected to mongo instance");
});

app.get("/", (req, res) => {
  res.send("Hello from contact manager server");
});

app.listen(process.env.PORT || 4000, () => {
  console.log("server is ready");
});
