import express, { json } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

//middlewares
app.use(cors({
    origin: process.env.CORSE_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

// app.use(cookiesParser())


//routes import 
import userRouter from './routes/user.routes.js'

//routes decleration
// its prefix
app.use('/api/v1/users', userRouter)

// eg:- http://localhost:8000/api/v1/users/register


export {app}