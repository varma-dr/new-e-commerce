// const express = require("express");
import express from "express";
import dotenv from "dotenv";

// imported routes from auth.route.js
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// authentication 

app.use("/api/auth", authRoutes)


app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
});