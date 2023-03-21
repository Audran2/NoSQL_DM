const { MongoClient, ObjectId } = require("mongodb");
const express = require("express"),
bodyParser = require("body-parser");
let app = express();
app.use(express.json());

const url = "mongodb://localhost:27017";
const port = 3000;


// Import des routes
const { mflix } = require("./routes/mflix.js");
const { analytics } = require("./routes/analytics.js");
const { training } = require("./routes/training.js");


(async () => {
  try {
    const client = new MongoClient(url);
    await client.connect();
    console.log("Connected");

    mflix(client.db("sample_mflix"), app);
    analytics(client.db("sample_analytics"), app);
    training(client.db("sample_training"), app);

    app.listen(port, () => console.log(`listening on port ${port}`));
  } catch (e) {
    console.log(e);
  }

})();