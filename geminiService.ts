
import { GoogleGenAI, Type } from "@google/genai";
import type { DashboardData, Deal, TranscriptAnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MAX_INPUT_CHARS = 2_000_000; // ~2MB limit for input to be safe

// Define a more specific type for the parameters we pass to the retry helper
interface GeminiRequestParams {
    model: string;
    contents: string;
    config: {
        responseMimeType: 'application/json';
        responseSchema: object;
        temperature: number;
    }
}

/**
 * A wrapper for the Gemini API call that includes retry logic with exponential backoff.
 * This helps mitigate transient issues like network errors or overloaded models.
 */
const callGeminiWithRetry = async (params: GeminiRequestParams): Promise<string> => {
    let retries = 0;
    const maxRetries = 3;
    let delay = 1000; // start with 1-second delay

    while (true) {
        try {
            const response = await ai.models.generateContent(params);
            const text = response.text;
            
            // The API can return a response with an empty text field if content is blocked or it fails to generate.
            // We treat this as a retryable error.
            if (!text) {
                throw new Error("API returned an empty response.");
            }
            return text; // Success!

        } catch (error) {
            retries++;
            const errorMessage = error instanceof Error ? error.message : String(error);

            // Decide if the error is worth retrying.
            // We retry on empty responses (which we throw ourselves) and common server-side errors.
            const isRetryable = errorMessage.includes('API returned an empty response') || errorMessage.includes('503') || errorMessage.includes('500');

            if (!isRetryable || retries > maxRetries) {
                console.error(`Gemini API call failed after ${retries} attempt(s):`, error);
                // If we've exhausted retries, or the error is not retryable, re-throw the original error.
                throw error;
            }

            console.warn(`Gemini API call failed, retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }
};

const dashboardResponseSchema = {
  type: Type.OBJECT,
  properties: {
    analysisTitle: {
      type: Type.STRING,
      description: 'A concise title for the dashboard based on the data, e.g., "Q3 Sales Pipeline Analysis" or "Lead Source Performance".',
    },
    summary: {
      type: Type.STRING,
      description: 'A 2-3 sentence high-level summary of the key findings and trends in the data provided.',
    },
    kpis: {
      type: Type.ARRAY,
      description: '3-5 Key Performance Indicators (KPIs) derived from the data. Each KPI should have a title, a value, and a brief insight.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'The name of the metric, e.g., "Total Revenue", "Lead Conversion Rate", "Average Deal Size".' },
          value: { type: Type.STRING, description: 'The calculated value of the metric. Format currency, percentages, and numbers appropriately.' },
          insight: { type: Type.STRING, description: 'A brief insight, comparison, or context for the metric. Can be an empty string if not applicable.' },
        },
        required: ["title", "value", "insight"],
      },
    },
    charts: {
      type: Type.ARRAY,
      description: 'Data for 2-4 charts to visualize the data. Provide data suitable for bar or pie charts.',
      items: {
        type: Type.OBJECT,
        properties: {
          chartType: { type: Type.STRING, description: 'The type of chart. Must be either "bar" or "pie".' },
          title: { type: Type.STRING, description: 'The title of the chart, e.g., "Opportunities by Stage", "Leads by Source".' },
          data: {
            type: Type.ARRAY,
            description: 'The data points for the chart. For bar/pie charts, use objects with "name" (string label) and "value" (numeric value) keys.',
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "The label for a data point (e.g., a category name)." },
                value: { type: Type.NUMBER, description: "The numerical value for that data point." },
              },
              required: ["name", "value"],
            },
          },
        },
        required: ["chartType", "title", "data"],
      },
    },
    deals: {
      type: Type.ARRAY,
      description: "A list of individual sales opportunities (deals) found in the data. Extract key details for each deal.",
      items: {
        type: Type.OBJECT,
        properties: {
          rowId: { type: Type.NUMBER, description: "The unique '__AI_ROW_ID__' from the original CSV row for this deal. This MUST be included." },
          dealName: { type: Type.STRING, description: "The name or title of the opportunity." },
          amount: { type: Type.STRING, description: "The monetary value of the deal, formatted as a currency string (e.g., '$15,000'). Use 'N/A' if not available." },
          stage: { type: Type.STRING, description: "The current sales stage of the deal (e.g., 'Prospecting', 'Closed Won', 'Negotiation')." },
          insight: { type: Type.STRING, description: "A one-sentence AI-generated insight about this specific deal (e.g., 'High value but at risk' or 'Closing soon based on activity')." },
          description: { type: Type.STRING, description: "The deal's description. IMPORTANT: Use the description directly from the CSV if a relevant column (e.g., 'Description', 'Notes') exists and is not empty. Otherwise, generate a detailed, multi-sentence description based on the deal's other data." },
        },
        required: ["rowId", "dealName", "amount", "stage", "insight", "description"]
      }
    }
  },
  required: ["analysisTitle", "summary", "kpis", "charts", "deals"],
};

const transcriptAnalysisResponseSchema = {
    type: Type.OBJECT,
    properties: {
        analysisTitle: {
            type: Type.STRING,
            description: "A concise, high-level title for the entire analysis, e.g., 'Analysis of 3 Customer Meetings'."
        },
        overallSummary: {
            type: Type.STRING,
            description: "A 2-3 sentence summary combining the key takeaways from all analyzed transcripts."
        },
        meetings: {
            type: Type.ARRAY,
            description: "An array containing the detailed analysis for each individual meeting transcript found in the input.",
            items: {
                type: Type.OBJECT,
                properties: {
                    meetingTitle: { type: Type.STRING, description: "A descriptive title for the meeting, e.g., 'Follow-up with Acme Corp' or 'Transcript 1'." },
                    summary: { type: Type.STRING, description: "A short paragraph summarizing the key discussion points and outcomes of this specific meeting." },
                    sentiment: {
                        type: Type.STRING,
                        description: "The overall sentiment of the client/prospect during this meeting.",
                        enum: ['Positive', 'Neutral', 'Negative', 'Mixed', 'Unknown']
                    },
                    actionItems: {
                        type: Type.ARRAY,
                        description: "A list of clear, concise action items for the sales team based on the meeting.",
                        items: { type: Type.STRING }
                    },
                    risks: {
                        type: Type.ARRAY,
                        description: "A list of potential risks, objections, or concerns raised by the client.",
                        items: { type: Type.STRING }
                    },
                    suggestedFollowUpEmail: {
                        type: Type.STRING,
                        description: "A complete, professionally drafted follow-up email from the salesperson's perspective, ready to be copied and sent."
                    }
                },
                required: ["meetingTitle", "summary", "sentiment", "actionItems", "risks", "suggestedFollowUpEmail"]
            }
        },
        updates: {
            type: Type.ARRAY,
            description: "A list of suggested updates for existing deals based on all transcripts. Only include deals that require changes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Must be the string 'update'." },
                    rowId: { type: Type.NUMBER, description: "The 'rowId' of the deal in the provided CRM data that should be updated." },
                    dealName: { type: Type.STRING, description: "The name of the deal being updated, for user reference." },
                    changes: {
                        type: Type.OBJECT,
                        description: "An object where keys are the deal fields to change (e.g., 'stage', 'amount') and values are objects containing the old and new value.",
                        properties: {},
                        additionalProperties: {
                            type: Type.OBJECT,
                            properties: {
                                oldValue: { type: Type.STRING },
                                newValue: { type: Type.STRING }
                            },
                            required: ["oldValue", "newValue"]
                        }
                    },
                    reasoning: { type: Type.STRING, description: "A brief, clear explanation for why this change is being suggested, based on the transcript." }
                },
                required: ["type", "rowId", "dealName", "changes", "reasoning"]
            }
        },
        creations: {
            type: Type.ARRAY,
            description: "A list of new deals that should be created, based on opportunities identified in the transcripts that are not in the CRM data.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Must be the string 'create'." },
                    deal: {
                        type: Type.OBJECT,
                        description: "The details of the new deal to be created.",
                        properties: {
                            dealName: { type: Type.STRING, description: "The name of the new opportunity." },
                            amount: { type: Type.STRING, description: "The estimated value of the deal, formatted as a currency string. Use 'N/A' if not mentioned." },
                            stage: { type: Type.STRING, description: "The suggested initial sales stage (e.g., 'Qualification', 'Prospecting')." },
                            description: { type: Type.STRING, description: "A detailed description of the opportunity, synthesized from the transcript." }
                        },
                        required: ["dealName", "amount", "stage", "description"]
                    },
                    reasoning: { type: Type.STRING, description: "A brief, clear explanation for why this new deal is being suggested, based on the transcript." }
                },
                required: ["type", "deal", "reasoning"]
            }
        }
    },
    required: ["analysisTitle", "overallSummary", "meetings", "updates", "creations"]
};


export const analyzeVtigerData = async (csvData: string): Promise<DashboardData> => {
  if (csvData.length > MAX_INPUT_CHARS) {
    const sizeInMB = (csvData.length / 1024 / 1024).toFixed(2);
    throw new Error(`Input CSV file is too large (${sizeInMB} MB). The current limit is 2MB.`);
  }

  const prompt = `
    You are a world-class business intelligence analyst specializing in CRM data from Vtiger.
    Your task is to analyze the following CSV data export. The data might be sparse or have missing columns.
    The CSV data contains a special column '__AI_ROW_ID__' which you must use to link your analysis back to the original data.
    
    **CRITICAL: Data Flexibility Mandate**
    - Your primary goal is to work with whatever data is provided, no matter how sparse.
    - If columns are missing for certain analytics (e.g., no numerical columns for financial KPIs, no categorical columns for charts), do NOT invent data or fail. Instead, return an empty array for the corresponding JSON key (e.g., "kpis": [], "charts": []).
    - For individual deals, if a field like 'amount' or 'stage' cannot be found in the data for a row, you MUST populate that field with the string "N/A". Do not omit the deal itself.
    
    **Analysis Steps:**
    1.  Analyze the provided columns to understand the data's context (e.g., Leads, Potentials/Opportunities, Contacts).
    2.  Perform a comprehensive analysis. Generate a high-level summary.
    3.  Based on available data, generate 3-5 relevant KPIs. If you cannot, return an empty 'kpis' array.
    4.  Based on available data, generate 2-4 relevant charts. If you cannot, return an empty 'charts' array.
    5.  Identify and extract all individual sales opportunities or 'deals'. For each deal:
        a. Extract its name, amount, and stage. If a value is missing, use "N/A".
        b. For its 'description', first look for a description column in the CSV. If present and non-empty, use that text but ensure any double quotes (") within it are escaped with a backslash (\\"). Otherwise, generate a detailed description from other available data, also ensuring quotes are escaped.
        c. Generate a concise, one-sentence insight based on all its available data.
        d. **Crucially, you must find the '__AI_ROW_ID__' for the corresponding row and return its numeric value in the 'rowId' field.**
    6.  Generate a JSON object that conforms to the provided schema.

    **CRITICAL JSON FORMATTING RULES - ADHERE STRICTLY**
    - Your entire output MUST be a single, valid JSON object. No extra text or explanations.
    - The most common error is failing to escape double-quotes within string values.
    - EVERY string value you generate (e.g., 'analysisTitle', 'summary', 'insight', 'description') that contains a double-quote character (") MUST have it escaped with a backslash (\\").
    - Example of CORRECT escaping: { "insight": "This deal is at risk of \\"churning\\"." }
    - Example of INCORRECT escaping: { "insight": "This deal is at risk of "churning"." }
    - Pay special attention to the 'description' field, as it may come from CSV data that already contains quotes. You MUST escape them.
    
    Here is the CSV data:
    ---
    ${csvData}
    ---
    
    Now, provide the complete analysis in the required JSON format. Adhere strictly to all rules.
  `;

  try {
    const text = await callGeminiWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: dashboardResponseSchema,
        temperature: 0.2,
      },
    });
    
    const parsedData = JSON.parse(text.trim());

    if (!parsedData.analysisTitle || !parsedData.kpis || !parsedData.charts || !parsedData.deals) {
        throw new Error("API response is missing required dashboard fields, including the 'deals' array.");
    }
    
    return parsedData as DashboardData;

  } catch (error: unknown) {
    console.error("Error processing Gemini API response:", error);
    if (error instanceof Error) {
        if (error.message.includes('JSON')) {
             throw new Error(`The AI returned malformed data that could not be parsed. This can happen with complex text. Please try again. Details: ${error.message}`);
        }
        if (error.message.includes('API returned an empty response')) {
            throw new Error("The AI failed to generate a response after multiple attempts. This could be due to network issues, overly restrictive safety settings, or the input file being too large or complex. Please try again later or with a different file.");
        }
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while communicating with the Gemini API.");
  }
};

export const analyzeTranscripts = async (transcript: string, currentDeals: Deal[]): Promise<TranscriptAnalysisResult> => {
    const dealsJson = JSON.stringify(currentDeals, null, 2);
    if (transcript.length + dealsJson.length > MAX_INPUT_CHARS) {
        throw new Error(`Input transcript and deal data are too large (over 2MB). Please use a smaller transcript or analyze with a smaller dataset.`);
    }

    const prompt = `
      You are an expert-level sales operations analyst AI. Your purpose is to conduct a deep, creative analysis of meeting transcripts.

      The user will provide one or more meeting transcripts as a single block of text. Individual transcripts may be separated by a line like '--- NEW TRANSCRIPT ---'. Your first task is to identify if there are multiple transcripts and analyze each one individually, in addition to providing an overall summary.

      You will also be given a JSON list of current deals from a CRM.

      **Your Comprehensive Analysis Task (for each transcript):**
      1.  **Title:** Give the meeting a concise title. If a name or date is available, use it. Otherwise, use "Meeting Transcript 1", "Meeting Transcript 2", etc.
      2.  **Summary:** Write a short paragraph summarizing the key discussion points, decisions, and outcomes of the meeting.
      3.  **Sentiment Analysis:** Determine the overall sentiment of the client/prospect. Categorize it as 'Positive', 'Negative', 'Neutral', 'Mixed', or 'Unknown'.
      4.  **Action Items:** Extract a clear, concise list of all action items and next steps for the sales team.
      5.  **Risks & Objections:** Identify any potential risks, objections, or concerns raised by the client that could jeopardize a deal.
      6.  **Suggest Follow-up Email:** Draft a professional, ready-to-send follow-up email from the salesperson's perspective. The email should summarize the discussion, reiterate value, and confirm the action items.

      **CRM Integration Task (based on ALL transcripts):**
      1.  **Compare to CRM:** Analyze all findings against the provided list of current CRM deals.
      2.  **Suggest Updates:** If information in a transcript clearly indicates an existing deal has progressed or changed (e.g., stage, amount, probability), create an 'update' suggestion. The 'reasoning' must explicitly reference the transcript.
      3.  **Suggest Creations:** If a transcript discusses a new, distinct opportunity not listed in the CRM, create a 'create' suggestion. The 'reasoning' must justify why it's a new deal.
      4.  **Be Conservative:** Only suggest CRM changes you are highly confident about. If there's no clear evidence, do not suggest a change.

      **Final Output Generation:**
      1.  **Overall Title & Summary:** Create a main title for the entire analysis (e.g., "Analysis of 3 Transcripts") and a high-level summary of the combined findings.
      2.  **Compile Results:** Aggregate all your findings into a single JSON object conforming to the provided schema. If no CRM changes are needed, return empty arrays for 'updates' and 'creations'.

      **CRITICAL JSON FORMATTING RULES:**
      - Your entire output MUST be a single, valid JSON object.
      - **Escape all double-quotes (") within string values using a backslash (\\").**
      - Correct: { "summary": "Client was \\"thrilled\\" with the demo." }
      - Incorrect: { "summary": "Client was "thrilled" with the demo." }

      Here is the meeting transcript(s):
      ---
      ${transcript}
      ---

      Here is the current list of deals from the CRM:
      ---
      ${dealsJson}
      ---

      Now, provide the complete, creative analysis in the required JSON format.
    `;

    try {
        const text = await callGeminiWithRetry({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: transcriptAnalysisResponseSchema,
                temperature: 0.2,
            },
        });
        
        const parsedData = JSON.parse(text.trim());
        
        if (!parsedData.updates || !parsedData.creations || !parsedData.meetings) {
            throw new Error("API response is missing required analysis fields.");
        }
        
        return parsedData as TranscriptAnalysisResult;

    } catch (error: unknown) {
        console.error("Error calling Gemini API for transcript analysis:", error);
        if (error instanceof Error) {
            if (error.message.includes('JSON')) {
                 throw new Error(`The AI returned malformed data that could not be parsed. Details: ${error.message}`);
            }
            if (error.message.includes('API returned an empty response')) {
                throw new Error("The AI failed to generate a response after multiple attempts. This can happen with network issues or if the transcript is too complex. Please try again.");
            }
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while communicating with the Gemini API.");
    }
};
