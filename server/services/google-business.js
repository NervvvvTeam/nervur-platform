const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/business.manage"];

// Create OAuth2 client
function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.API_URL || "https://nervurapi-production.up.railway.app"}/api/sentinel-app/businesses/google-callback`
  );
}

// Generate Google OAuth authorization URL
function getAuthUrl(businessId) {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state: businessId // pass businessId to associate tokens later
  });
}

// Exchange authorization code for tokens
async function exchangeCode(code) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Create authenticated client from stored tokens
function getAuthenticatedClient(accessToken, refreshToken) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  return oauth2Client;
}

// Fetch reviews for a business
async function fetchReviews(business) {
  const oauth2Client = getAuthenticatedClient(business.googleAccessToken, business.googleRefreshToken);

  // If tokens were refreshed, save the new ones
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      business.googleAccessToken = tokens.access_token;
      await business.save();
    }
  });

  try {
    // List accounts
    const accountManagement = google.mybusinessaccountmanagement({ version: "v1", auth: oauth2Client });
    const accountsRes = await accountManagement.accounts.list();
    const accounts = accountsRes.data.accounts || [];

    if (accounts.length === 0) return [];

    const accountName = business.googleAccountId || accounts[0].name;

    // List locations
    const businessInfo = google.mybusinessbusinessinformation({ version: "v1", auth: oauth2Client });
    const locationsRes = await businessInfo.accounts.locations.list({
      parent: accountName,
      readMask: "name,title"
    });
    const locations = locationsRes.data.locations || [];

    if (locations.length === 0) return [];

    const locationName = business.googleLocationId || locations[0].name;

    // Fetch reviews (using REST API directly as the SDK may not have mybusiness v4)
    const reviewsUrl = `https://mybusiness.googleapis.com/v4/${locationName}/reviews`;
    const reviewsRes = await oauth2Client.request({ url: reviewsUrl });
    const reviews = reviewsRes.data.reviews || [];

    return reviews.map(r => ({
      reviewId: r.reviewId,
      reviewName: r.name, // full resource name for replying
      authorName: r.reviewer?.displayName || "Anonyme",
      rating: r.starRating === "FIVE" ? 5 : r.starRating === "FOUR" ? 4 : r.starRating === "THREE" ? 3 : r.starRating === "TWO" ? 2 : 1,
      text: r.comment || "",
      createTime: r.createTime,
      hasReply: !!r.reviewReply
    }));
  } catch (err) {
    console.error("[GOOGLE] Fetch reviews error:", err.message);
    throw err;
  }
}

// Post a reply to a review
async function postReply(business, reviewName, replyText) {
  const oauth2Client = getAuthenticatedClient(business.googleAccessToken, business.googleRefreshToken);

  const url = `https://mybusiness.googleapis.com/v4/${reviewName}/reply`;
  await oauth2Client.request({
    url,
    method: "PUT",
    data: { comment: replyText }
  });
}

module.exports = { getAuthUrl, exchangeCode, fetchReviews, postReply, createOAuth2Client };
