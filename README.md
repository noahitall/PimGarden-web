# PimGarden Website

The official website for PimGarden, a privacy-first contact manager application.

## Overview

This repository contains the landing page, privacy policy, and terms of service for the PimGarden app. The site is built using static HTML, CSS, and JavaScript, with a Vercel serverless function for the email subscription form.

## Features

- Responsive design that works across all device sizes
- Privacy-focused landing page showcasing PimGarden's features
- Detailed privacy policy emphasizing the app's privacy-first approach
- Comprehensive terms of service
- Email subscription form using Vercel serverless functions
- Modern, clean design with a focus on readability

## Local Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open your browser to the URL displayed in the terminal (typically http://localhost:3000)

## Deployment

This site is automatically deployed to Vercel when changes are pushed to the main branch.

To manually deploy:

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```
2. Login to Vercel:
   ```
   vercel login
   ```
3. Deploy:
   ```
   vercel
   ```

## Email Subscription

The email subscription form sends submitted emails to a designated target email address. This functionality can be customized by modifying the `/api/subscribe.js` serverless function and setting the appropriate environment variables in your Vercel project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Projects

- [PimGarden](https://github.com/noahitall/PimGarden) - The main PimGarden app repository 