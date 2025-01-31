import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Message from "../models/message.model.js";

dotenv.config();
const router = express.Router();

// GET /api/gifs (Fetching GIFs from external API, like Tenor)
router.get("/", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: "Query parameter 'q' is required" });
        }

        const response = await axios.get("https://tenor.googleapis.com/v2/search", {
            params: {
                q: q,
                key: process.env.TENOR_API_KEY,
                limit: 8,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching GIFs:", error.response ? error.response.data : error.message);
        res.status(500).json({
            error: "Failed to fetch GIFs",
            details: error.response ? error.response.data : error.message,
        });
    }
});


router.post("/send-gif", async (req, res) => {
    const { senderId, receiverId, gifUrl } = req.body;

    // Save the GIF message to the database
    const newMessage = new Message({
        senderId,
        receiverId,
        gifUrl,
        createdAt: new Date(),
    });

    try {
        await newMessage.save();
        return res.json({ message: newMessage }); // Send back the saved message
    } catch (err) {
        console.error("Error saving GIF message:", err);
        return res.status(500).json({ error: "Failed to send GIF" });
    }
});

// router.post('/send-gif', async (req, res) => {
//     try {
//         const { senderId, receiverId, gifUrl } = req.body;

//         // Check if necessary fields are provided
//         if (!senderId || !receiverId || !gifUrl) {
//             return res.status(400).json({ error: "Missing required fields" });
//         }

//         // Create a new message document with the gif
//         const message = new Message({
//             senderId,
//             receiverId,
//             gifUrl, // Store this URL correctly if it's a GIF or an SVG
//         });

//         await message.save(); // Save the message

//         res.status(200).json({ message: "GIF sent successfully!" });
//     } catch (error) {
//         console.error("Error while sending GIF:", error);
//         res.status(500).json({ error: "Internal server error", details: error.message });
//     }
// });

export default router;
