const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require('dotenv').config()
// const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// ============= JWT MAIN FUNCTION ===============
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  // console.log({authorization});
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "authorization access" });
  }

  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res
        .status(401)
        .send({ error: true, message: "authorization access" });
    }
    req.decoded = decoded;
    next();
  });
};



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.SUMMER_CAMP_USER}:${process.env.SUMMER_CAMP_PASSWORD}@cluster0.djxbtyf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("SummerCamp").collection("users");
    const coursesCollection = client.db("SummerCamp").collection("courses");
    const cartCollection = client.db("SummerCamp").collection("carts");


    app.get("/courses", async (req, res) => {
      const result = await coursesCollection.find().toArray();
      res.send(result);
    })



    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })


    // Cart collection --------------------------------------------
    app.post('/carts', async (req, res) => {
      const item = req.body;
      console.log(item);
      const result = await cartCollection.insertOne(item);
      res.send(result);
    })

    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Summer Camp is running!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})