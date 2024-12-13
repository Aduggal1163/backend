 import mongoose from "mongoose";
 import express from "express";
 import dotenv from 'dotenv';
 const app=express();
 import connnectDB  from "./db/index.js";
 dotenv.config();
 app.listen(`${process.env.PORT}`,()=>{
    console.log("server connected");
 });
connnectDB();