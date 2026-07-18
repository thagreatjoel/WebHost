<div align="center"><h1> EPIC PORTFOLIO</h1>
</div>

<div align="center">A cool protfolio website of mine shows my works and have cool features and a small database for connect peoples with me it also got real time github intergation with come custom star behind! Its has few feature were you can stick a sticker in my portfoilio</div><br>

<div align="center">
  
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=flat&logo=vercel)](https://web-host-tan.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat&logo=mongodb)](https://mongodb.com/)
</div>

<div align="center">
  
| Category | Package |
|----------|---------|
| **Framework** | Next.js 15.3.5 |
| **UI Library** | React 19 |
| **Styling** | Custom CSS + Tailwind CSS |
| **Database** | MongoDB Atlas |
| **API** | GitHub REST API |
| **Hosting** | Vercel |

</div>

# STICKER SYSTEM
It is an interactive feature that lets visitors place drag and manage hackclub stickers on the page. 
- Green dot shows you own a sticker
- Only stcker owners can only make changes to their stickers
- 	Click + button in navigation to use the sticker



## DATABASE SCHEMA
```xml
{
  _id: ObjectId,
  userId: String,        // User identifier
  userName: String,      // Display name
  userEmail: String,     // User email
  emoji: String,         // Unicode emoji
  name: String,          // Sticker name
  imageUrl: String,      // CDN image URL
  x: Number,            // Position (0-100%)
  y: Number,            // Position (0-100%)
  scale: Number,        // Size multiplier
  rotation: Number,     // Degrees rotated
  publicNote: String,   // Visible to everyone
  privateNote: String,  // Visible to admin only
  placedAt: Date
}
```
## WHAT IS THE USE?
- Guestbook were visitors leave messages
- Feedback from people
- Connection with peoples
