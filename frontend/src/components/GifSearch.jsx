import React, { useState } from "react";
import axios from "axios";

const GifSearch = ({ onGifSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  console.log(gifs);

  const handleSearch = async () => {
    if (!searchQuery) return;

    const apiKey = "AIzaSyBmgQwy0riXkH6smlv86x7-7UFjHV9aPos"; // Replace with your actual API key
    try {
      const response = await axios.get(
        `https://api.tenor.com/v1/search?q=${searchQuery}&key=${apiKey}&limit=8`
      );
      // Correctly map through the results and get the GIF URLs
      setGifs(response.data.results);
    } catch (error) {
      console.error("Error fetching GIFs", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for GIFs"
      />
      <button onClick={handleSearch}>Search</button>
      <div className="gif-grid">
        {gifs.map((gif) => (
          <imgYOUR_TENOR_API_KEY
            key={gif.id}
            src={gif.media[0].gif.url} // Correctly accessing the gif URL
            alt={gif.title}
            onClick={() => onGifSelect(gif.media[0].gif.url)} // Pass the selected gif URL to the parent
          />
        ))}
      </div>
    </div>
  );
};

export default GifSearch;
