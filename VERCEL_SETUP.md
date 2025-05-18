# Setting Up xAI Integration with Vercel

According to the Vercel documentation, there's a special integration process for xAI that provides better authentication and usage metrics. Here's how to set it up:

## Prerequisites
- A Vercel account
- The Vercel CLI installed on your machine

## Installation Steps

1. **Install the xAI integration using Vercel CLI**:
   ```bash
   vercel install xai
   ```
   During this process, you will be asked to open the dashboard to accept the marketplace terms if you have not installed this integration before. You can also choose which project(s) the provider will have access to.

2. **Set up your project with the required packages**:
   We've already installed the necessary packages:
   ```bash
   npm install @ai-sdk/xai ai
   ```

3. **Configure your API route**:
   We've updated our `/app/api/chat/route.ts` file to use the xAI provider.

4. **Environment Variables**:
   When using the Vercel integration, you don't need to manually set the `XAI_API_KEY` in your environment variables - the integration handles this for you.

## Deployment

When deploying to Vercel:

1. Make sure you have the xAI integration installed for your Vercel project
2. Deploy your project normally using the Vercel dashboard or CLI
3. The integration will automatically handle the authentication with xAI

## Local Development

For local development, you still need to:

1. Create a `.env.local` file with your API keys
2. Include the `XAI_API_KEY` in that file

## Learn More

- [Vercel xAI Integration Documentation](https://vercel.com/docs/ai/xai)
- [xAI Platform](https://platform.xai.com/) 