const axios = require('axios');

async function analyzeCodeWithAI(diffData) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Skipping AI review.');
    return [];
  }

  const prompt = `
  You are an expert Senior Software Engineer. Review the following GitHub Pull Request diff.
  
  Focus on:
  1. Security Vulnerabilities
  2. Performance Issues
  3. Obvious bugs or edge cases
  
  Return the result as a valid JSON array of objects.
  Each object must have:
  - "path": (string) filename.
  - "position": (number) line number in the diff.
  - "body": (string) review comment.

  Diff:
  ${diffData.substring(0, 20000)}
  `;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        }
      }
    );

    const rawText = response.data.candidates[0].content.parts[0].text;
    
    // Attempt to extract purely the JSON part
    // Sometimes LLMs wrap JSON in ```json
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(rawText);

  } catch (error) {
    console.error('Error with AI generation:', error.message);
    return [];
  }
}

module.exports = { analyzeCodeWithAI };
