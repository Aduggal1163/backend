import express from 'express';
import mongoose from 'mongoose';
import {DB_NAME} from '../constants.js'
const DBconnect=async()=>{
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("DB connected successfully");
  } catch (error) {
    console.log(error);
  }
}
export default DBconnect;