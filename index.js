require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.User_Name}:${process.env.User_pass}@cluster0.dtfuxds.mongodb.net/?retryWrites=true&w=majority`;




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
      const MobileCollection = client.db("MobileShopDB").collection("mobile");
      const cartCollection = client.db("MobileShopDB").collection("cart");
     
  
      //--------- jwt api--------
      app.post("/jwt", async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.Access_Token, {
          expiresIn: "2h",
        });
        // console.log(token)
        res.send({ token });
      });

    //   -----get mobile-------
    // app.get("/mobile", async (req, res) => {
      
  
    //     const result = await MobileCollection.find(  {
  
    //     }).toArray()
    //     console.log(result)
    //     res.send(result);
    //   }); price, name, type, processor, memory, OS.

    app.get('/mobile', async (req,res)=>{
      const { search } = req.query;
      console.log(search);
      const result=await MobileCollection.find({
        $or: [
          { name: { $regex: `${search}`, $options: "i" } },
          {price : { $regex: `${search}`, $options: "i" } },
          { type: { $regex: `${search}`, $options: "i" } },
          { processor: { $regex: `${search}`, $options: "i" } },
          { memory: { $regex: `${search}`, $options: "i" } },
          { OS: { $regex: `${search}`, $options: "i" } },
        ],
      }).toArray()
      res.send(result)
    })
    // -----aaded cart
    app.post('/cart', async(req,res)=>{
      const query= req.body
      const result =await cartCollection.insertOne(query)
      res.send(result)
    })

       // -----get cart item-----
       app.get("/getCart", async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const result = await cartCollection.find(query).toArray();
        console.log(result)
        res.send(result);
      });
     //   ------delete cart-----
     app.delete("/cartItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });



      await client.db("admin").command({ ping: 1 });
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
    } finally {
    }
  }
  run().catch(console.dir);
  
  app.get("/", (req, res) => {
    res.send("mobile shop server is running");
  });
  app.listen(port, () => {
    console.log(`mobile shop running on ${port}`);
  });
  