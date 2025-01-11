import dotenv from 'dotenv';
import DBconnect from './db/index.js';
import {app} from './app.js'
dotenv.config();
DBconnect().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("server is running at port:",process.env.PORT);
    })
}).catch((e)=>{
    console.log(e);
})