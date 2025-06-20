import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    BACKEND_URL: "http://localhost:3000",
    FRONTEND_URL: "http://localhost:5173",
    MOBILE_URL: "http://localhost:8081",
    USER_EMAIL: "cadriano.miranda@gmail.com",
    USER_PASSWORD: "j@eT2p-l#OI0"
  },
});
