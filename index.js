const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
// http://localhost:5000
const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.czzcg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("drone_ecommerce");
    const courses_Collection = database.collection("courses");
    const cart_Collection = database.collection("cart");
    const order_Collection = database.collection("order");
    const users_Collection = database.collection("users");

    // add data to course collection with additional info
    app.get("/course/addCourse", async (req, res) => {
      // const course = req.body;
      const course = {
        'img' : 'https://i.ibb.co/bghFqVn/Product6-grande.jpg',
        'title' : 'Iris Drones',
        'desc' : 'This is a High Tech Drone',
        'price' : 18000, 
        'rating' : 4.5, 
        'ratingCount' : 250, 
      };
      const result = await courses_Collection.insertOne(course);
      res.json(result);
    });

    // load courses get api
    app.get("/courses", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = req.query.page;
      const cursor = courses_Collection.find({});
      const count = await cursor.count();
      let courses;

      if (size && page) {
        courses = await cursor
          .skip(size * page)
          .limit(size)
          .toArray();
      } else {
        courses = await cursor.toArray();
      }
      res.json({ count, courses });
    });

    // load single course get api
    app.get("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const course = await courses_Collection.findOne(query);
      res.json(course);
    });

    // load cart data according to user id get api
    app.get("/cart/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cart_Collection.find(query).toArray();
      res.json(result);
    });

    // load cart data according to user id get api
    app.get("/order-list/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await order_Collection.find(query).toArray();
      res.json(result);
    });

    // load cart data according to user id get api
    app.get("/order-list", async (req, res) => {
      const result = await order_Collection.find().toArray();
      res.json(result);
    });


    // add data to cart collection with additional info
    app.post("/course/add", async (req, res) => {
      const course = req.body;
      const result = await cart_Collection.insertOne(course);
      res.json(result);
    });

    // add data to cart collection with additional info
    app.post("/place-order/:uid", async (req, res) => {
      const uid = req.params.uid;
      const course = req.body;
      const result = await order_Collection.insertOne(course);
      res.json(result);
    });

    // delete data from cart delete api
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cart_Collection.deleteOne(query);
      res.json(result);
    });

    // delete data from order delete api
    app.delete("/order/delete/:id/:uid", async (req, res) => {
      const id = req.params.id ;
      const uid = req.params.uid;


      // const id = req.params.id ;
      // const uid =req.params.uid
      // const query = { _id: ObjectId(id) };
      // const result = await order_Collection.deleteOne(query);

      const query = {uid: uid };
      const result = await order_Collection.deleteOne(
        {_id: id},
        {uid: uid});
      // const result = await order_Collection.deleteOne({query},{uid: uid});

      // const query = { _id: ObjectId(id) };
      // const result = await order_Collection.deleteOne(
      //   { _id: ObjectId(id) }
      //   );
      res.json( result );
      // res.json(id+ ' _&_ ' + query + result);
      // res.json(result);
    });

    // delete data from order delete api
    app.delete("/product/delete/:id", async (req, res) => {
      const id = req.params.id ;

      const result = await courses_Collection.deleteOne({_id:  ObjectId(id)} )
      
      res.json( result );
     
    });

    // change order status
    app.post("/order/status-change/:id/:uid", async (req, res) => {
      const id = req.params.id ;
      const uid = req.params.uid;
      const status = req.body.status;

      const query = {uid: uid };
      const result = await order_Collection.updateOne(
        
        { _id: id },
     
        {
          $set: {
            status: status
          }
        }
     );

      res.json( result );
      // res.json( id + ' ' + uid );
    
    
    });
    

    //save user to the database
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await users_Collection.updateOne(filter, updateDoc, options);
      res.json(result);
  });

    // load single user get api
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email};
      const user = await users_Collection.findOne(query);
      res.json(user);
    });

    // Add Admin New
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email,
                      displayName: 'admin',
                      role: 'admin' };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await users_Collection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //All user List
    app.get("/user-list", async (req, res) => {
      const result = await users_Collection.find().toArray();
      res.json(result);
    });

    //all product
    app.get("/products", async (req, res) => {
      const result = await courses_Collection.find().toArray();
      res.json(result);
    });

    // purchase delete api
    app.delete("/purchase/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cart_Collection.deleteMany(query);
      res.json(result);
    });

    // change User to Admin
  app.post("/user/status-change/:uid", async (req, res) => {
      const uid = req.params.uid;
      const status = req.body.status;

      const query = {uid: uid };
      const result = await users_Collection.updateOne(
        
        { _id: ObjectId(uid) },
    
        {
          $set: {
            role: status
          }
        }
      )
      res.json(result);
    });

    //add product
    app.post('/product/add', async (req, res) => {
      const appointment = req.body;
      const result = await courses_Collection.insertOne(appointment);
      res.json(result)
    });

    // orders get api
    app.get("/orders", async (req, res) => {
      const result = await cart_Collection.find({}).toArray();
      res.json(result);
    });
  } finally {
    // await client.close();
  }


}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.get("/hello", (req, res) => {
  res.send("hello from server");
});


app.listen(port, () => {
  console.log("server is running on port", port);
});
