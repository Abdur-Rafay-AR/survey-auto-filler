# Bahria Survey Auto Filler - Chrome Extension

A Chrome extension to automatically fill Bahria University Quality Assurance Surveys.

## Features

✅ **Auto-fill surveys** with your preferred answer (Strongly Agree, Agree, Uncertain, Disagree, Strongly Disagree)
✅ **Auto-submit** option to submit surveys automatically after filling
✅ **Fill comments** option to add generic positive comments
✅ **Batch processing** - Auto-fill all pending surveys with one click
✅ **Visual notifications** to track progress
✅ **Save settings** - Your preferences are remembered

## Installation

### Method 1: Load Unpacked Extension (Recommended for Testing)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `survey-auto-filler` folder
5. The extension is now installed!

### Method 2: Create Icons First (Optional)

If you want proper icons:
1. Open `create-icons.html` in Chrome
2. It will automatically download 3 icon files (icon16.png, icon48.png, icon128.png)
3. Move these files to the `survey-auto-filler` folder
4. Then follow Method 1

## Usage

### Single Survey Mode

1. Navigate to a Bahria University survey page
2. Click the extension icon in your toolbar
3. Select your preferred answer from the dropdown
4. Optional: Enable "Auto-submit" and "Fill comments"
5. Click "Fill Survey" to auto-fill all questions
6. Click "Submit" if you didn't enable auto-submit

### Batch Mode (Auto-fill All Surveys)

1. Navigate to the "Quality Assurance Surveys" page (the page with the list of surveys)
2. Click the extension icon
3. Select your preferred answer
4. Click "Auto Fill All Surveys"
5. The extension will:
   - Open each survey one by one
   - Fill all questions automatically
   - Submit the survey
   - Move to the next survey
   - Show notifications for each step

## Settings

- **Default Answer**: Choose which answer to use for all questions
  - Strongly Agree
  - Agree
  - Uncertain
  - Disagree
  - Strongly Disagree

- **Auto-submit after filling**: Automatically submit the survey after filling
- **Fill comment fields**: Add generic positive comments to text fields

## How It Works

The extension:
1. Detects radio button groups on the survey page
2. Selects the radio button at your chosen index (0=Strongly Agree, 1=Agree, etc.)
3. Optionally fills comment fields with positive feedback
4. Can automatically submit the form
5. In batch mode, uses session storage to track progress across page navigations

## Safety Features

- Works only on cms.bahria.edu.pk domain
- Shows visual notifications for all actions
- Tracks progress in batch mode
- Allows manual intervention at any time

## Troubleshooting

**Extension not working:**
- Make sure you're on the correct Bahria University website
- Check that the extension is enabled in chrome://extensions/
- Refresh the page and try again

**Auto-fill all not working:**
- Make sure you're on the survey list page (not a survey form page)
- Check that there are "Evaluate" links visible on the page

**Surveys not submitting:**
- The website might have changed its structure
- Try using manual "Submit" button instead of auto-submit

## Technical Details

- **Manifest Version**: 3
- **Permissions**: activeTab, storage, scripting
- **Content Scripts**: Runs on cms.bahria.edu.pk/Sys/Student/QualityAssurance/*
- **Storage**: Uses Chrome sync storage to save settings

## Files Structure

```
survey-auto-filler/
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup UI
├── popup.js           # Popup logic
├── content.js         # Content script for page interaction
├── icon16.png         # 16x16 icon
├── icon48.png         # 48x48 icon
├── icon128.png        # 128x128 icon
├── create-icons.html  # Helper to generate icons
└── README.md          # This file
```

## Privacy

This extension:
- Does NOT collect any personal data
- Does NOT send data to external servers
- Only stores your preference settings locally
- Only works on Bahria University website

## Disclaimer

This tool is for educational purposes. Use responsibly and provide honest feedback when appropriate. The automated responses should reflect your genuine experience with the courses and instructors.

## Support

If you encounter any issues or the website structure changes, feel free to update the selectors in `content.js` to match the new HTML structure.

---

Made with ❤️ for Bahria University students
