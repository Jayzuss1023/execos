import { google } from "googleapis";

export const GOOGLE_SCOPES = {
  gmail: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ],
  google_calendar: [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
  ],
} as const;

export type GoogleProvider = keyof typeof GOOGLE_SCOPES;

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
  );
}

export function getAuthUrl(provider: GoogleProvider, state: string): string {
  const oauth2Client = createOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [...GOOGLE_SCOPES[provider]],
    state,
    include_granted_scopes: true,
  });
}

export async function getGoogleUserInfo(accessToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });

  const { data } = await oauth2.userinfo.get();
  console.log("DATA", data);

  if (!data.id || !data.email) {
    throw new Error("Failed to get user info from Google");
  }

  return {
    name: data.name,
    email: data.email,
  };
}
