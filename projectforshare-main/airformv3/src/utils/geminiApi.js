// formGenerator.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("❌ Missing GEMINI API key! Please define VITE_GEMINI_API_KEY in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// --- Helper functions ---
const generateTitleFromContext = (context) => {
  const lower = context.toLowerCase();
  if (lower.includes("contact")) return "Contact Form";
  if (lower.includes("survey") || lower.includes("feedback")) return "Survey Form";
  if (lower.includes("registration") || lower.includes("signup")) return "Registration Form";
  if (lower.includes("job") || lower.includes("application")) return "Job Application Form";
  if (lower.includes("newsletter")) return "Newsletter Signup";
  if (lower.includes("booking") || lower.includes("appointment")) return "Booking Form";
  return "Custom Form";
};

const mapFieldType = (fieldType) => {
  const typeMap = {
    text: "text",
    email: "email",
    number: "number",
    tel: "tel",
    textarea: "textarea",
    select: "select",
    radio: "radio",
    checkbox: "checkbox"
  };
  return typeMap[fieldType] || "text";
};

const generateOptionsFromExample = (exampleValue) => {
  if (typeof exampleValue === "string" && exampleValue.includes(",")) {
    return exampleValue.split(",").map((opt) => opt.trim());
  }
  return ["Option 1", "Option 2", "Option 3"];
};

// --- MAIN FUNCTION ---
export const generateFormFromPrompt = async (userPrompt) => {
  console.log("🚀 Calling Gemini API with prompt:", userPrompt);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are an AI assistant specialized in generating JSON-based web form definitions.

    TASK:
    Based on the given context, output a valid JSON array (no markdown or extra text).
    Each array element must be an object with:
    - "fieldName": readable label
    - "fieldType": one of ["text","email","number","tel","textarea","select","checkbox","radio"]
    - "exampleValue": realistic sample data or comma-separated options for select/checkbox fields

    CONTEXT: ${userPrompt}

    Output ONLY the JSON array, nothing else.
    Generate 8–10 meaningful fields relevant to the context.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    console.log("📥 Raw Gemini Response:", text);

    // --- Parse JSON safely ---
    let parsedFields = null;
    try {
      if (text.startsWith("[")) {
        parsedFields = JSON.parse(text);
      } else {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) parsedFields = JSON.parse(match[0]);
      }
    } catch (err) {
      console.error("❌ JSON parsing failed:", err.message);
    }

    if (!parsedFields || !Array.isArray(parsedFields)) {
      throw new Error("No valid JSON array found in Gemini response");
    }

    // --- Map into frontend-friendly format ---
    const validFields = parsedFields.filter(
      (f) => f.fieldName && f.fieldType && f.exampleValue
    );

    const formResponse = {
      title: generateTitleFromContext(userPrompt),
      description: '', // Remove the AI generation prompt
      fields: validFields.map((field, idx) => ({
        id: Date.now() + idx,
        question: field.fieldName,
        type: mapFieldType(field.fieldType),
        placeholder: field.exampleValue,
        options:
          field.fieldType === "select" || field.fieldType === "checkbox" || field.fieldType === "radio"
            ? generateOptionsFromExample(field.exampleValue)
            : []
      }))
    };

    console.log("✅ Final Form Object:", formResponse);
    return formResponse;

  } catch (error) {
    console.error("💥 Gemini API error or fallback triggered:", error);
    return generateFallbackForm(userPrompt);
  }
};

// --- FALLBACK FORM (if Gemini fails) ---
const generateFallbackForm = (userPrompt) => {
  const lower = userPrompt.toLowerCase();

  if (lower.includes("contact")) {
    return {
      title: "Contact Form",
      description: "Get in touch with us",
      fields: [
        { id: Date.now() + 1, question: "Full Name", type: "text", placeholder: "John Smith" },
        { id: Date.now() + 2, question: "Email Address", type: "email", placeholder: "john@example.com" },
        { id: Date.now() + 3, question: "Phone Number", type: "tel", placeholder: "+1 (555) 123-4567" },
        { id: Date.now() + 4, question: "Message", type: "textarea", placeholder: "How can we help you?" }
      ]
    };
  }

  // Generic fallback
  return {
    title: "Custom Form",
    description: "Please fill out this form",
    fields: [
      { id: Date.now() + 1, question: "Name", type: "text", placeholder: "Enter your name" },
      { id: Date.now() + 2, question: "Email", type: "email", placeholder: "Enter your email" },
      { id: Date.now() + 3, question: "Details", type: "textarea", placeholder: "Tell us more…" }
    ]
  };
};

// --- AI ANALYTICS SUMMARIZATION ---
export const generateAnalyticsSummary = async (formData, analyticsData, responseData = null) => {
  console.log("🤖 Generating AI analytics summary for form:", formData.title);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare response content analysis if available
    let responseAnalysisSection = '';
    if (responseData && responseData.length > 0) {
      const responseContent = responseData.map(submission => {
        return submission.responses.map(response => 
          `Q: ${response.question}\nA: ${response.answer}`
        ).join('\n');
      }).join('\n---\n');

      responseAnalysisSection = `
    ACTUAL RESPONSE CONTENT ANALYSIS:
    Below are the actual responses submitted by users. Analyze patterns, common themes, sentiment, and key insights:
    
    ${responseContent.substring(0, 3000)}${responseContent.length > 3000 ? '\n... (truncated for analysis)' : ''}
    
    Please analyze:
    1. Common themes and patterns in responses
    2. User sentiment and feedback trends
    3. Most frequent concerns or requests
    4. Quality of responses (detailed vs brief)
    5. Any actionable insights from user feedback
      `;
    }

    const prompt = `
    You are an AI analytics expert. Analyze the following form performance data and provide comprehensive insights.

    FORM DETAILS:
    - Title: ${formData.title}
    - Description: ${formData.description || 'No description'}
    - Questions: ${formData.questions?.length || 0} questions
    - Created: ${formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'Unknown'}
    - Status: ${formData.status || 'Unknown'}

    ANALYTICS DATA:
    - Total Views: ${analyticsData.totalViews || 0}
    - Total Submissions: ${analyticsData.totalSubmissions || 0}
    - Completion Rate: ${analyticsData.completionRate || 0}%
    - Recent Submissions: ${analyticsData.recentSubmissions?.length || 0}

    SUBMISSION TRENDS:
    ${analyticsData.submissionsOverTime ? JSON.stringify(analyticsData.submissionsOverTime) : 'No trend data available'}

    ${responseAnalysisSection}

    Please provide a comprehensive analysis in JSON format with the following structure:
    {
      "overallPerformance": "Brief overall assessment (1-2 sentences)",
      "keyInsights": ["insight1", "insight2", "insight3", "insight4", "insight5"],
      "recommendations": ["recommendation1", "recommendation2", "recommendation3", "recommendation4"],
      "performanceScore": "A-F grade based on metrics",
      "strengths": ["strength1", "strength2", "strength3"],
      "improvements": ["improvement1", "improvement2", "improvement3"],
      "summary": "Detailed summary paragraph (4-5 sentences)",
      ${responseData && responseData.length > 0 ? `
      "responseInsights": {
        "commonThemes": ["theme1", "theme2", "theme3"],
        "userSentiment": "overall sentiment analysis",
        "keyFindings": ["finding1", "finding2", "finding3"],
        "actionableInsights": ["insight1", "insight2", "insight3"],
        "responseQuality": "assessment of response quality and detail level"
      },` : ''}
      "dataGeneralization": "Key patterns and generalizations from all collected data"
    }

    Focus on actionable insights, practical recommendations, and deep analysis of user responses if available. Be specific about numbers, trends, and user feedback patterns.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    console.log("📊 Raw AI Analytics Response:", text);

    // Parse JSON safely
    let parsedAnalysis = null;
    try {
      if (text.startsWith("{")) {
        parsedAnalysis = JSON.parse(text);
      } else {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) parsedAnalysis = JSON.parse(match[0]);
      }
    } catch (err) {
      console.error("❌ Analytics JSON parsing failed:", err.message);
    }

    if (!parsedAnalysis) {
      throw new Error("No valid JSON found in AI analytics response");
    }

    console.log("✅ Final AI Analytics:", parsedAnalysis);
    return parsedAnalysis;

  } catch (error) {
    console.error("💥 AI Analytics error:", error);
    return generateFallbackAnalytics(analyticsData);
  }
};

// --- FALLBACK ANALYTICS (if AI fails) ---
const generateFallbackAnalytics = (analyticsData) => {
  const completionRate = analyticsData.completionRate || 0;
  const totalViews = analyticsData.totalViews || 0;
  const totalSubmissions = analyticsData.totalSubmissions || 0;

  let performanceScore = 'F';
  if (completionRate >= 80) performanceScore = 'A';
  else if (completionRate >= 60) performanceScore = 'B';
  else if (completionRate >= 40) performanceScore = 'C';
  else if (completionRate >= 20) performanceScore = 'D';

  return {
    overallPerformance: `Your form has received ${totalViews} views and ${totalSubmissions} submissions with a ${completionRate}% completion rate.`,
    keyInsights: [
      `Completion rate of ${completionRate}% ${completionRate > 50 ? 'is above average' : 'could be improved'}`,
      `Total engagement: ${totalViews} views generated ${totalSubmissions} responses`,
      `Form performance grade: ${performanceScore}`,
      `${totalSubmissions > 10 ? 'Good response volume for analysis' : 'Limited response data available'}`,
      `${completionRate > 60 ? 'Users find the form accessible' : 'Form may need simplification'}`
    ],
    recommendations: [
      completionRate < 50 ? "Consider simplifying your form to improve completion rates" : "Maintain current form structure",
      totalViews < 100 ? "Increase form promotion to drive more traffic" : "Focus on conversion optimization",
      "Monitor submission trends to identify peak engagement times",
      totalSubmissions > 5 ? "Analyze response patterns for user insights" : "Collect more responses for better analysis"
    ],
    performanceScore,
    strengths: [
      totalSubmissions > 0 ? "Form is successfully collecting responses" : "Form is properly configured",
      "Analytics tracking is working correctly",
      completionRate > 50 ? "Good user engagement" : "Form is functional"
    ],
    improvements: [
      completionRate < 70 ? "Optimize form length and question clarity" : "Consider A/B testing different versions",
      "Add more engaging form elements if completion rate is low",
      totalSubmissions < 10 ? "Increase promotion to gather more response data" : "Focus on response quality analysis"
    ],
    summary: `This form shows ${completionRate > 50 ? 'good' : 'moderate'} performance with ${totalSubmissions} submissions from ${totalViews} views. ${completionRate > 70 ? 'The high completion rate indicates users find the form engaging and easy to complete.' : 'There\'s room for improvement in user engagement and form optimization.'} Focus on ${totalViews < 50 ? 'increasing visibility' : 'improving conversion rates'} to maximize form effectiveness. ${totalSubmissions > 10 ? 'With sufficient response data, consider analyzing user feedback patterns for deeper insights.' : 'Collect more responses to enable comprehensive user feedback analysis.'}`,
    dataGeneralization: `Based on current metrics, this form demonstrates ${completionRate > 60 ? 'strong' : 'moderate'} user engagement patterns. ${totalSubmissions > 5 ? 'Response volume suggests users find value in completing the form.' : 'Limited responses indicate potential barriers to completion.'} Key focus areas should be ${completionRate < 50 ? 'improving form accessibility and reducing friction' : 'maintaining current performance while scaling reach'}.`
  };
};
