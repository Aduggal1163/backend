import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv';
import DBconnect from './db/index.js';
dotenv.config();
const app=express();
DBconnect().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("server is running at port:",process.env.PORT);
    })
}).catch((e)=>{
    console.log(e);
})