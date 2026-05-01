// Configuration and fallback data

export const WMO_CODE_MAP = {
  0: 'Clear',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  85: 'Slight Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Slight Hail',
  99: 'Thunderstorm with Heavy Hail'
}

export const FALLBACK_QUOTES = [
  { quote: "The expert at anything was once a beginner.", author: "Helen Hayes" },
  { quote: "Education is the passport to the future.", author: "Malcolm X" },
  { quote: "The beautiful thing about learning is that no one can take it away.", author: "B.B. King" },
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { quote: "Dont let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { quote: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { quote: "You dont have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { quote: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { quote: "Anyone who stops learning is old.", author: "Henry Ford" },
  { quote: "Education is not the filling of a pail, but the lighting of a fire.", author: "William Butler Yeats" },
  { quote: "The capacity to learn is a gift; the ability to learn is a skill.", author: "Brian Herbert" },
  { quote: "Study the past if you would define the future.", author: "Confucius" },
  { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { quote: "Genius is one percent inspiration and ninety-nine percent perspiration.", author: "Thomas Edison" },
  { quote: "Mistakes are proof that you are trying.", author: "Unknown" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "It always seems impossible until its done.", author: "Nelson Mandela" },
  { quote: "Perseverance is not a long race; its many short races one after the other.", author: "Walter Elliot" },
  { quote: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "Dont watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { quote: "Try not to become a man of success, but rather try to become a man of value.", author: "Albert Einstein" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { quote: "Everything youve ever wanted is on the other side of fear.", author: "George Addair" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "I have not failed. Ive just found 10,000 ways that wont work.", author: "Thomas Edison" },
  { quote: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
  { quote: "Believe you can and youre halfway there.", author: "Theodore Roosevelt" }
]

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 0 && hour < 12) return "Good Morning"
  if (hour >= 12 && hour < 18) return "Good Afternoon"
  return "Good Evening"
}

export function getFallbackQuote() {
  const dayOfMonth = new Date().getDate()
  return FALLBACK_QUOTES[dayOfMonth % FALLBACK_QUOTES.length]
}
