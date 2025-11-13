import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config()

const app = express();
app.use(cors())
app.use(express.json())

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

app.get("/api/rooms", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM rooms")
        res.json(rows)
    } catch (error) {
        console.error(`bład pobierania waetości pokoi: ${error}`)
    }
})
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {console.log(`listening on port ${PORT}`)})

