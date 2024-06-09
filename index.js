const express = require('express');
const morgan = require('morgan');
const userData = require('./dummyData.js');
const mongoose = require('mongoose');


//Variable
const app = express();
const port = 8081;
const { users } = userData;
let bucket = users;
const dbUrl = `mongodb+srv://TechzoneBatch4:mehmoodabad33@back-end-development.z2s7bgp.mongodb.net/?retryWrites=true&w=majority&appName=Back-End-Development`

mongoose
    .connect(dbUrl, { dbName: 'TechZone_DB' })
    .then((response) => {
        console.log("MongoDB Connected Successfully")
    })
    .catch((err) => {
        console.log("Database Not Connected")
    })

//Schema
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true }
    },{timestamps:true}
)
// Create a model
const UserModal = mongoose.model('employees', userSchema);

// Use middleware to parse JSON requests
app.use(express.json());


//Routes
app.get('/', (req, res) => {
    res.send("Welcome")
})

app.get('/api/users', (req, res) => {

    UserModal.find()
    .then((actualData)=>{
        if(actualData.length < 1){
            //400
            return res.status(400).send({
                status:true,
                message:'No Data Available'
            })
        }
        //200
        return res.status(200).send({
            status : true,
            message:'List Of Items',
            data : actualData 
        })
    })
    .catch((err)=>{
        console.log(`Error In Fetching Data ${err}`);
        return res.status(500).send({
            status: false,
            message: '500 Internal Server Error'
        })
    })
})


//Post Route
app.post('/api/users', (req, res) => {
    const body = req.body;
    // console.log(`Req Method: ${body.todoInput}`);

    //Add Data in Bucket
    // let bucketClone = [...bucket];
    // bucketClone.push(body);
    // bucket = [...bucketClone];

    if (!body.name || !body.email) {
        return res.status(400).send({
            status: false,
            message: 'No Data Avaliable'
        })
    }

    UserModal.create({
        name: body.name,
        email: body.email
    })
     .then((actualData) => {
            return res.status(200).send({
                staus: true,
                message: 'Data Added Sucessfully',
                data: actualData
            })
        })
        .catch((err) => {
            console.log(`Server Error ${err}`);
        });

    //return res.json(body);
})

app.route('/api/users/:id')
    .get((req, res) => {
        const id = req.params.id;
        const singleUsers = bucket.filter((item) => item.id == id);
        return res.json(singleUsers);
    })
    .delete((req, res) => {
        const id = req.params.id;
        UserModal.findByIdAndDelete(id)
        .then((actualData)=>{
            //400
            if(!actualData.id){
                return res.status(400).send({
                    status:false,
                    message : 'Data Not Exist'
                })
            }
            //200
            return res.status(200).send({
                status:true,
                message:'Item Deleted Sucessfully',
                data : actualData
            })

        })
        .catch((err)=>{
            console.log("Error In Deleting Item");
            return res.status(500).send({
                status: false,
                message: '500 Internal Server Error'
            })
        })
    })
    .patch((req, res) => {
        // res.send({ staus: 'panding3' })
        //Req For Update
        //1) current ID OR Path ID                          // Get from Path
        //2) updated object                                 // Get from req.body
        //3) index Number of the object in the array        // use findIndex
        //4) splice method on clone of bucket


        const id = req.params.id;
        const {updatedName,updatedEmail} = req.body;
        console.log(`User ID ${id}`);
        console.log(`User Body ${updatedName} ${updatedEmail}`);

        //400
        if(!updatedName || !updatedEmail){
            return res.status(400).send({
                status:false,
                message:'Fields names must be same'
            })
        }

        //401
        const isValidID = mongoose.isValidObjectId(id);
        if(!isValidID){
            return res.status(401).send({
                staus:false,
                message:'Invalid ID'
            })
        }


        UserModal.findByIdAndUpdate(id,{
            name:updatedName,
            email:updatedEmail
        },{new:true})
        .then((actualData)=>{
            return res.status(200).send({
                status:true,
                message:'Sucessfully Update The Item',
                data:actualData
            })
        })
        .catch((err)=>console.log(`ERROR ${errr}`));
})


//Start Server;
app.listen(
    port,
    () => {
        console.log(`Server is running on http://localhost:${port}`);
    }
)