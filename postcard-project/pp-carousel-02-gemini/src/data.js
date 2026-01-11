// src/data.js

// 1. Just list the IDs of the files you actually have in your folder.
// You can add '3113' here later, or remove '3005', and it will just work.
const cardIds = [
    3001, 3002, 3003, 3004, 
    3005, 3006, 3007, 3008, 
    3009, 3010, 3011, 3012
  ];
  
  // 2. This automates the paths for you
  export const data = cardIds.map((id) => ({
    id: id,
    // IMPORTANT: These use backticks (Key next to 1), NOT single quotes.
    front: `/cards/fronts/${id}.jpg`,
    back: `/cards/backs/${id}.jpg`
  }));