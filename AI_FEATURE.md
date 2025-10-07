# AI Feature Setup

## Google Gemini AI Integration

The LaTeX Editor includes an AI assistant powered by Google Gemini that can generate LaTeX code based on your natural language descriptions.

### Setup Instructions

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Get API Key" or "Create API Key"
   - Copy your API key

2. **For Local Development**
   - Create a `.env` file in the project root (already done if using the provided one)
   - Add your API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. **For Render.com Deployment**
   - Go to your Render dashboard
   - Select your "latex-editor" service
   - Click "Environment" in the left sidebar
   - Add a new environment variable:
     - **Key**: `GEMINI_API_KEY`
     - **Value**: Your Gemini API key
   - Click "Save Changes"
   - The service will automatically redeploy

### How to Use

1. Open your LaTeX editor
2. Click the **"AI Generate"** button in the toolbar (magic wand icon)
3. Describe what you want to create in natural language
4. Click **"Generate with AI"**
5. The AI will generate LaTeX code and insert it into your editor
6. Click **"Compile"** to generate the PDF

### Example Prompts

- "Create a professional resume for a software engineer with 5 years of experience"
- "Generate a cover letter for a data analyst position"
- "Make a simple article about machine learning basics"
- "Create a mathematics document with equations for calculus"
- "Generate a business letter template"

### Note

The AI is configured to only use basic LaTeX packages that are available on the server to ensure compatibility.
