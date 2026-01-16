const cardIds = [
  3001, 3002, 3003, 3004, 
  3005, 3006, 3007, 3008, 
  3009, 3010, 3011, 3012
];

const orientations = {
  3001: 'landscape', 3002: 'portrait', 3003: 'portrait', 3004: 'landscape',
  3005: 'landscape', 3006: 'landscape', 3007: 'landscape', 3008: 'landscape',
  3009: 'landscape', 3010: 'landscape', 3011: 'portrait', 3012: 'landscape'
};

// Aspect Ratio Logic:
// Moo Luxe 5x7 cards = 7 / 5 = 1.4 Ratio.
// We use 1.4 as the standard for this project.
const ratios = {
  // If you ever have a non-standard card (like a square), set it here.
  // Otherwise, we default to 1.4 below.
};

export const data = cardIds.map((id) => ({
  id: id,
  orientation: orientations[id],
  
  // Default to 1.4 (Moo Standard) unless a specific override exists above
  aspectRatio: ratios[id] || 1.4,
  
  front: `/cards/fronts/${id}.jpg`,
  back: `/cards/backs/${id}.jpg`,
  link: `http://mediabyjoe.com/postcard-${id}`
}));