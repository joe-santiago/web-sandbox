const cardIds = [
  3001, 3002, 3003, 3004, 
  3005, 3006, 3007, 3008, 
  3009, 3010, 3011, 3012
];

// We define the specific orientation for each ID based on your screenshots
const orientations = {
  3001: 'landscape',
  3002: 'portrait',  // Road/Path
  3003: 'portrait',  // Green Hills
  3004: 'landscape',
  3005: 'landscape',
  3006: 'landscape',
  3007: 'landscape',
  3008: 'portrait',  // Looking up at building
  3009: 'landscape',
  3010: 'landscape',
  3011: 'portrait',  // Sparkler
  3012: 'landscape'
};

export const data = cardIds.map((id) => ({
  id: id,
  // Look up the orientation in our list above
  orientation: orientations[id], 
  
  front: `/cards/fronts/${id}.jpg`,
  back: `/cards/backs/${id}.jpg`,
  link: `http://mediabyjoe.com/postcard-${id}`
}));