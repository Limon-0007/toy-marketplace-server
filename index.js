const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s4mg6y0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    const toyCollection = client.db("toyMarketplace").collection("toys");

    // get data
    app.get("/addAToy", async (req, res) => {
      const search = req.query.search;
      console.log(search);
      const query = {
        name: { $regex: search, $options: "i" },
      };
      const result = await toyCollection.find(query).limit(20).toArray();
      res.send(result);
    });

    app.get("/addAToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/myToys/:subCategory", async (req, res) => {
      const category = req.params.subCategory;
      console.log(category);
      let sub_category = {};
      if (
        category === "Bamboo_Buddy" ||
        category === "Pawsome_Panda" ||
        category === "Bamboo_Breeze"
      ) {
        sub_category = { subCategory: category };
      }
      const result = await toyCollection.find(sub_category).toArray();
      console.log(result);
      res.send(result);
    });

    app.get("/myToys", async (req, res) => {
      const sortOrder = req.query.query;
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const result = await toyCollection
        .find(query)
        .sort({ price: sortOrder === "asc" ? 1 : -1 })
        .toArray();
      res.send(result);
    });

    app.get("/toySearch/:text", async (req, res) => {
      const text = req.params.text;
      const AllData = await toyCollection.find().toArray();
      const result = AllData.filter((data) =>
        data.name.toLowerCase().includes(text.toLowerCase())
      );
      res.send(result);
    });

    // post data
    app.post("/addAToy", async (req, res) => {
      const newToy = req.body;
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    });

    // update data

    app.patch("/addAToy/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToys = req.body;
      console.log(updatedToys);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          photo: updatedToys.photo,
          quantity: updatedToys.quantity,
          name: updatedToys.name,
          sellerName: updatedToys.sellerName,
          email: updatedToys.email,
          subCategory: updatedToys.subCategory,
          price: updatedToys.price,
          ratings: updatedToys.ratings,
          details: updatedToys.details,
        },
      };
      const result = await toyCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    // delete
    app.delete("/addAToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy server is running");
});

app.listen(port, (req, res) => {
  console.log(`Toy server is running on PORT: ${port}`);
});
