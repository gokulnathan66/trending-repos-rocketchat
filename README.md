# GitHub Trending Repositories - Rocket.Chat Bot

A GitHub Action that automatically fetches trending repositories and posts them to Rocket.Chat with rich visual formatting.

## Features

✨ **Visual Appeal**: Rich message formatting with repository images and metadata  
🖼️ **Multiple Formats**: Choose between rich attachments or simple inline images  
📊 **Repository Info**: Stars, programming language, and owner avatars  
🎨 **GitHub Integration**: Repository social preview images and branding  
⏰ **Automated**: Runs daily via GitHub Actions  

## Setup

1. Add your Rocket.Chat webhook URL to the repository secrets as `ROCKETCHAT_WEBHOOK`
2. The GitHub Action will run automatically every day at 09:30 AM UTC

## Message Formats

### Rich Format (Default)
Uses Rocket.Chat's attachment format with:
- Repository social preview images
- Owner avatars as thumbnails
- Organized fields for stars and language
- GitHub branding and footer

### Simple Format
Fallback format with inline images:
- Owner avatars as inline images
- Compact text layout
- Compatible with all chat platforms

## Usage

### Manual Execution
```bash
# Rich format with attachments (default)
npm run fetch:rich

# Simple format with inline images
npm run fetch:simple
```

### GitHub Action
The action runs automatically but you can also trigger it manually from the Actions tab.
