// src/data.js

const cardIds = [
  3001, 3002, 3003, 3004, 
  3005, 3006, 3007, 3008, 
  3009, 3010, 3011, 3012
];

export const data = cardIds.map((id) => ({
  id: id,
  // Images
  front: `/cards/fronts/${id}.jpg`,
  back: `/cards/backs/${id}.jpg`,
  
  // URL Convention: http://mediabyjoe.com/postcard-[ID]
  link: `http://mediabyjoe.com/postcard-${id}`
}));