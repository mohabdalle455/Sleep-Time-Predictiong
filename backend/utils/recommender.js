const dotenv = require('dotenv');
dotenv.config();

const { GoogleGenAI } = require("@google/genai")

// Initialize the Gemini API client lazily to avoid initialization issues
let ai = null;
const getAIClient = () => {
  if (!ai) {
    console.log('Initializing Gemini API client');
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyD-YSYqJoNbSMYQAgS7mPewWCKL8qSTECw";
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables, using fallback key');
    }
    ai = new GoogleGenAI({apiKey});
  }
  return ai;
};

// Simple in-memory cache for recommendations
const recommendationCache = new Map();

// Generate a cache key from input data - enhanced for detailed recommendations
const generateCacheKey = (data) => {
  const { workoutTime, readingTime, phoneTime, workHours, caffeineIntake, relaxationTime, prediction } = data;
  // Round values to reduce cache variations and create more detailed categorization
  const roundedPrediction = Math.round(parseFloat(prediction) * 4) / 4; // Quarter-hour precision
  const workoutCategory = workoutTime < 0.5 ? 'low' : workoutTime > 2.5 ? 'high' : 'med';
  const phoneCategory = phoneTime < 1.5 ? 'low' : phoneTime > 3 ? 'high' : 'med';
  const caffeineCategory = caffeineIntake < 100 ? 'low' : caffeineIntake > 300 ? 'high' : 'med';
  const workCategory = workHours < 8 ? 'normal' : workHours > 10 ? 'high' : 'long';
  
  return `detailed_${workoutCategory}_${phoneCategory}_${caffeineCategory}_${workCategory}_${roundedPrediction}`;
};

// Check if we have a cached recommendation
const getCachedRecommendation = (data) => {
  const cacheKey = generateCacheKey(data);
  if (recommendationCache.has(cacheKey)) {
    console.log('Using cached recommendation');
    return recommendationCache.get(cacheKey);
  }
  return null;
};

// Store a recommendation in the cache
const cacheRecommendation = (data, recommendation) => {
  const cacheKey = generateCacheKey(data);
  recommendationCache.set(cacheKey, recommendation);
  console.log('Recommendation cached');
  
  // Limit cache size to prevent memory issues
  if (recommendationCache.size > 100) {
    // Remove oldest entry
    const firstKey = recommendationCache.keys().next().value;
    recommendationCache.delete(firstKey);
  }
};

const callGeminiRecommendation = async (data) => {
  const { workoutTime, readingTime, phoneTime, workHours, caffeineIntake, relaxationTime, prediction } = data;
  
  // Check cache first
  const cachedRecommendation = getCachedRecommendation(data);
  if (cachedRecommendation) {
    return cachedRecommendation;
  }
  
  // Maximum number of retries with exponential backoff
  const MAX_RETRIES = 3;
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      console.log(`Generating detailed recommendation (attempt ${retries + 1}/${MAX_RETRIES + 1})`);
      
      // Simplified prompt for concise, actionable recommendations
      const prompt = `
As an expert sleep specialist, analyze the following sleep and lifestyle data to provide concise, practical recommendations:

**DATA:**
- Predicted Sleep: ${prediction} hours
- Workout: ${workoutTime}h | Reading: ${readingTime}h
- Screen Time: ${phoneTime}h | Work: ${workHours}h
- Caffeine: ${caffeineIntake}mg | Relaxation: ${relaxationTime}h

**TASK:**
Provide 3-5 specific, actionable recommendations focusing on the most impactful changes. Keep explanations brief but clear.

Format as a simple list with no markdown or special formatting:
1. Most important recommendation
2. Second priority
3. Additional suggestion
etc.

Focus only on the most critical factors affecting sleep quality.`;

      // Get the AI client (lazy initialization)
      const aiClient = getAIClient();
      
      // Use the free-tier Gemini Pro model with proper method call
      const model = aiClient.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 2048,
        }
      });
      
      const response = await model.generateContent(prompt);
      
      const text = response.response.text() || "No recommendation generated.";
      console.log('Detailed recommendation generated successfully');
      
      // Enhance the recommendation with additional formatting and resources
      const enhancedText = enhanceRecommendation(text, data);
      
      // Cache the successful recommendation
      cacheRecommendation(data, enhancedText);
      
      return enhancedText;
    } catch (error) {
      console.error(`Gemini API error (attempt ${retries + 1}):`, error.message);
      
      // Check for specific error types
      const isRateLimitError = error.message.includes('quota') || error.message.includes('rate');
      const isNetworkError = error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT';
      
      // If we've reached max retries, return a fallback message
      if (retries === MAX_RETRIES) {
        console.log('Max retries reached, returning detailed fallback recommendation');
        const fallbackRecommendation = generateDetailedFallbackRecommendation(data);
        const enhancedFallback = enhanceRecommendation(fallbackRecommendation, data);
        
        // Cache the fallback recommendation too
        cacheRecommendation(data, enhancedFallback);
        
        return enhancedFallback;
      }
      
      // Calculate wait time with exponential backoff
      let waitTime = Math.pow(2, retries) * 1000; // 1s, 2s, 4s, 8s
      
      // Add extra delay for rate limit errors
      if (isRateLimitError) {
        waitTime *= 3; // Triple the wait time for rate limits
      }
      
      console.log(`Waiting ${waitTime}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      retries++;
    }
  }
};

// Generate a concise fallback recommendation when the API fails
const generateDetailedFallbackRecommendation = (data) => {
  const { workoutTime, phoneTime, caffeineIntake, workHours, prediction } = data;
  
  // Convert to numbers for calculations
  const sleepHours = parseFloat(prediction);
  const workout = parseFloat(workoutTime);
  const phone = parseFloat(phoneTime);
  const caffeine = parseFloat(caffeineIntake);
  const work = parseFloat(workHours);
  
  let recommendations = [];
  
  // Most important recommendations based on data
  if (sleepHours < 6) {
    recommendations.push("Go to bed 1-2 hours earlier tonight");
    recommendations.push("See a doctor if poor sleep continues");
  } else if (sleepHours < 7) {
    recommendations.push("Add 30-60 minutes to your sleep schedule");
  }
  
  if (phone > 3) {
    recommendations.push("Reduce screen time 2 hours before bed");
  }
  
  if (caffeine > 300) {
    recommendations.push("Cut caffeine after 2 PM");
  } else if (caffeine > 150 && sleepHours < 7) {
    recommendations.push("Try reducing caffeine intake");
  }
  
  if (work > 10) {
    recommendations.push("Set strict work boundaries");
  }
  
  if (workout < 0.5 && sleepHours < 7) {
    recommendations.push("Add 20-30 min daily walk");
  }
  
  // Add general recommendations if we don't have enough specific ones
  if (recommendations.length < 3) {
    recommendations.push("Keep consistent sleep schedule");
    recommendations.push("Create relaxing bedtime routine");
  }
  
  // Limit to 5 most important recommendations
  if (recommendations.length > 5) {
    recommendations = recommendations.slice(0, 5);
  }
  
  // Format as simple list
  const recommendationText = recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n');
  
  // Add header and footer to match AI format
  const header = `# Key Sleep Insights

**Your Predicted Sleep: ${sleepHours} hours**

Most important recommendations:

`;
  const footer = `

---

*For detailed advice, consult a sleep specialist*`;
  
  return header + recommendationText + footer;
};

// Validate and enhance the generated recommendations
const enhanceRecommendation = (text, data) => {
  if (!text || text.trim().length < 50) {
    console.log('Generated recommendation too short, using enhanced fallback');
    return generateDetailedFallbackRecommendation(data);
  }
  
  // For AI-generated text, just return it with a simple header
  const { prediction } = data;
  const header = `# Key Sleep Insights

**Your Predicted Sleep: ${prediction} hours**

Most important recommendations:

`;
  
  // Add simple footer
  const footer = `

---

*For detailed advice, consult a sleep specialist*`;
  
  return header + text + footer;
};

module.exports = callGeminiRecommendation;
