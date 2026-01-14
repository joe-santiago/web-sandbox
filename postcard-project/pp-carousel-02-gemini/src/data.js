const cardIds = [
  3001, 3002, 3003, 3004, 3005, 3006, // Landscape
  3007, 3008, 3009, 3010, 3011, 3012  // Portrait
];

export const data = cardIds.map((id, index) => ({
  id: id,
  // 1. We assume the Front determines the physical shape
  orientation: index < 6 ? 'landscape' : 'portrait', 
  
  front: `/cards/fronts/${id}.jpg`,
  back: `/cards/backs/${id}.jpg`,
  link: `http://mediabyjoe.com/postcard-${id}`
}));