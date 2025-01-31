import React, { useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore"; // Ensure this path is correct
import { useChatStore } from "../store/useChatStore";

const GifSearch = () => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [error, setError] = useState(null);

  const { authUser } = useAuthStore();
  const { selectedUser, addMessage } = useChatStore(); // Add method to update store

  const fetchGifs = async () => {
    try {
      setError(null); // Reset error state
      const response = await axios.get(
        `http://localhost:5000/api/gifs?q=${query}`
      );

      const gifResults = response.data.results || [];
      if (gifResults.length === 0) {
        setError("No GIFs found. Try another search!");
      }
      setGifs(gifResults);
    } catch (err) {
      console.error("Error fetching GIFs:", err);
      setError("Failed to fetch GIFs. Please try again.");
    }
  };

  const handleGifSelect = (gif) => {
    setSelectedGif(gif);
  };

  const handleSendGif = async () => {
    if (selectedGif) {
      if (!authUser) {
        alert("You need to be logged in to send a GIF");
        return;
      }

      if (!selectedUser) {
        alert("No recipient selected");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/api/gifs/send-gif",
          {
            senderId: authUser._id,
            receiverId: selectedUser._id,
            gifUrl: selectedGif.media_formats?.gif?.url,
          }
        );

        // Assuming the response contains the new message
        const newMessage = response.data.message;

        // Add the new message to the store
        addMessage(newMessage); // Update store with new message

        alert("GIF sent successfully!");
      } catch (err) {
        console.error("Error sending GIF:", err.response?.data || err.message);
        alert("Failed to send GIF. Try again.");
      }
    } else {
      alert("Please select a GIF first.");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search GIFs..."
      />
      <button onClick={fetchGifs}>Search</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="flex gap-2 overflow-auto">
        {gifs.length > 0
          ? gifs.map((gif, index) => (
              <img
                className="w-[150px] h-[150px]"
                key={index}
                src={gif.media_formats?.gif?.url || ""}
                alt="GIF"
                onClick={() => handleGifSelect(gif)}
                style={{ cursor: "pointer", margin: "10px" }}
              />
            ))
          : !error && <p>No GIFs to display.</p>}
      </div>

      {selectedGif && (
        <div>
          <h3>Selected GIF:</h3>
          <img src={selectedGif.media_formats?.gif?.url} alt="Selected GIF" />
          <button onClick={handleSendGif}>Send GIF</button>
        </div>
      )}
    </div>
  );
};

export default GifSearch;
