const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// app.use(cors({
//   origin: ['http://localhost:5173', 'https://assignment-11-group-study-server.vercel.app', 'https://assignment-11-group-study.web.app/'],
//   credentials: true
// }));

app.use(cors());
app.use(express.json());
app.use(cookieParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bgmtqy5.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const assignmentCollection = client.db('groupStudy').collection('assignments');
    const submittedCollection = client.db('groupStudy').collection('submitted');
    const myAssignmentCollection = client.db('groupStudy').collection('myAssignment');


    // all assignment
    app.get('/assignments', async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const cursor = assignmentCollection.find().skip(page * size).limit(size);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/assignmentCount', async (req, res) => {
      const count = await assignmentCollection.estimatedDocumentCount();
      res.send({ count });
    })

    app.get('/assignments/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.findOne(query);
      res.send(result);
    })

    app.post('/assignments', async (req, res) => {
      const newAssignment = req.body;
      const result = await assignmentCollection.insertOne(newAssignment);
      res.send(result);
    })

    app.post('/submitted', async(req, res) => {
      const submitted = req.body;
      const result = await submittedCollection.insertOne(submitted);
      res.send(result);
    })


    app.put("/assignments/:id", async (req, res) => {
      const id = req.params;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedAssignment = req.body;
      const assignment = {
        $set: {
          title: updatedAssignment.title,
          email: updatedAssignment.email,
          image: updatedAssignment.image,
          marks: updatedAssignment.marks,
          difficulty_level: updatedAssignment.difficulty_level,
          description: updatedAssignment.description,
          due_date: updatedAssignment.due_date
        }
      }
      const result = await assignmentCollection.updateOne(filter, assignment, options);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('assignMate is running')
})

app.listen(port, () => {
  console.log(`AssignMate Server is running on port ${port}`)
})