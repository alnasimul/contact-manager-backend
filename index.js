const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello from contact manager server");
});

app.post(`/insertContact`,(req, res) => {
    const data = req.body;
    console.log(data)
})

app.listen(process.env.PORT || 4000, () => {
    console.log("server is ready");
});  