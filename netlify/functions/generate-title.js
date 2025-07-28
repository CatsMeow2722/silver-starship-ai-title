/*
 * Netlify Function to generate a short title for an uploaded image.
 *
 * This function is invoked via an HTTP POST from the front-end. The
 * request body should be JSON containing an `image` property, which
 * is a data URL (e.g. `data:image/png;base64,...`) representing the
 * uploaded photo. The function uses OpenAI’s Chat Completion API
 * (vision model) to craft a concise description of the image. Titles
 * are limited to 50 characters or fewer and focus on the main item
 * visible in the photo.
 *
 * An OpenAI API key must be set in the site’s environment variables
 * (OPENAI_API_KEY). If the key isn’t available or the API call
 * fails, the function returns a simple timestamp-based placeholder.
 */

exports.handler = async function (event) {
  try {
    // Only handle POST requests; reject others
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { Allow: 'POST' },
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      };
    }
    // Attempt to parse the incoming JSON body
    let payload = {};
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (_) {
      // leave payload empty on parse error
    }
    const { image } = payload;
    const apiKey = process.env.OPENAI_API_KEY;

    // If we have a key and an image, try calling OpenAI
    if (apiKey && image) {
      try {
        const messages = [
          {
            role: 'system',
            content:
              'You are an assistant that provides concise, descriptive titles for auction items. Keep titles under 50 characters and focus on the most prominent item in the photo.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this item with a short auction lot title:' },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ];
        const body = {
          model: 'gpt-4o',
          messages,
          max_tokens: 30,
          temperature: 0.4,
        };
        // Netlify functions run on Node 18+, which includes fetch
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        });
        if (resp.ok) {
          const data = await resp.json();
          const assistantMessage = data?.choices?.[0]?.message?.content?.trim();
          if (assistantMessage) {
            return {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ title: assistantMessage }),
            };
          } else {
            console.error('No assistantMessage in response', data);
          }
        } else {
          const errorData = await resp.text();
          console.error('OpenAI API error status', resp.status, errorData);
        }
      } catch (err) {
        console.error('Error calling OpenAI API:', err);
        // Fall through to fallback
      }
    }

    // Fallback placeholder title uses the current time to ensure uniqueness
    const timestamp = new Date().toISOString();
    const fallbackTitle = `Lot item – ${timestamp.substring(11, 19)}`;
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ title: fallbackTitle }),
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal Server Error', error: err.message }),
    };
  }
};
