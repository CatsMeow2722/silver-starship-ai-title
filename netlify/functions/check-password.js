const handler = async (event) => {
  try {
    const { password } = JSON.parse(event.body || "{}");
    const validPassword = process.env.ACCESS_PASSWORD;
    if (typeof validPassword !== "string" || !validPassword) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: "Password not configured." }),
      };
    }
    if (password && password === validPassword) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true }),
      };
    } else {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: false }),
      };
    }
  } catch (err) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};

export { handler };