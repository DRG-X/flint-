---
description: How to Test the New Authentication and Onboarding Flow
---

This workflow details the steps to start the application and test the newly implemented user authentication and onboarding flow.

### Step 1: Start the Backend Server

Start the FastAPI engine securely using uvicorn. Note: this runs in `--reload` mode for local development.

// turbo
```powershell
cd d:\Projects\flintC\backend
uvicorn main:app --reload --port 8000
```

### Step 2: Start the Next.js Frontend

Run the Next.js development server for the user-facing web app.

// turbo
```powershell
cd d:\Projects\flintC\frontend
npm run dev
```

### Step 3: Test Without Login

1. Open your browser and navigate to `http://localhost:3000`.
2. Ensure you can view comparison rates and interact with the primary interface without being forced to log in.

### Step 4: Test New User Onboarding

1. Click on "Sign In" or "Log In" on the application.
2. Sign up using a fresh email or new Google account.
3. Observe the redirect to `/post-auth`, which verifies you are a new user safely via the backend `GET /user/profile`.
4. Observe the redirect to `/onboarding`.
5. Fill out the steps:
   - Select Country
   - Select a University (Filtered from `lib/universities.js`, correctly including subsets like BITS Pilani or RMIT).
   - Configure alerts (or skip WhatsApp optional setup).
6. Ensure the final `POST /user/profile` successfully pushes you to the homepage `/`.

### Step 5: Test Returning User

1. Log out or clear your session.
2. Log back in with the exact same account you just registered.
3. Observe the redirect to `/post-auth`.
4. This time, `GET /user/profile` should return `200`, and you should instantly hit the `/` index without ever seeing onboarding.