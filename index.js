const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
//const admin = require("firebase-admin");
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 2222;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7xlcz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travail-app');
        const usersCollection = database.collection('users');
        const jobCollection = database.collection('jobs');
        const applicationCollection = database.collection('applications');

        //Get: User by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send(user);
        });

        // POST: save user to db
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        //PUT: Update user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        //POST: a new job
        app.post('/addNewJob', async (req, res) => {
            const newJob = req.body;
            console.log(newJob);
            const result = await jobCollection.insertOne(newJob);
            console.log(result)
            res.json(result)
        });

        // GET: get all jobs
        app.get('/availableJobs', async (req, res) => {
            const result = await jobCollection.find({}).toArray();
            res.json(result)
        });

        // GET: specific one,
        app.get('/availableJobs/:id', async (req, res) => {
            const id = req.params.id;
            const result = await jobCollection.findOne({ _id: ObjectId(id) });
            console.log(result)
            res.json(result)
        });

        // GET : Jobs created by user
        app.get('/created-jobs/:email', async (req, res) => {
            const email = req.params.email;
            const query = { createdBy: email };
            const cursor = await jobCollection.find(query).toArray();
            res.json(cursor)
        });

        // GET: search applied jobs with email
        app.get('/applied-jobs/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await applicationCollection.find(query).toArray();
            res.json(result)
        });

        // POST: Apply for Job
        app.post('/apply-job', async (req, res) => {
            const data = req.body;
            const result = await applicationCollection.insertOne(data);
            res.json(result);
        });

    }
    finally {

    }

}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Ah, here We Go!')
})

app.listen(port, () => {
    console.log('Listening at: ', port)
})
