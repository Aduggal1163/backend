  import mongoose from "mongoose";
  import express from 'express';
  import {DB_NAME} from '../constants.js';
  const app=express()

  const connnectDB= async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("DB connected")
    } catch (error) {
        console.log("Error while connecting",error)
    }
  }
  export default connnectDB
