# 🎲 Jellyfin Random Button Extended + Auto Mode ⚡🔥

Based on [n00bcodr](https://github.com/n00bcodr/Jellyfin-Random-Button), this fork extends the Random Button with **context-aware behavior inside libraries** and a **powerful Auto Mode** for continuous random browsing. Auto Mode is **experimental but highly recommended** for passive discovery!  

---

## 🚀 Auto Mode First! ⚡✨

**Auto Mode is the new highlight of this fork**. You can enable it using **`randombutton+automode.js`**, which adds continuous random browsing with the following behavior:

- Activated by **double-clicking** the Random Button
- Automatically opens a new random item every **12 seconds**
- **Interval can be adjusted directly in the script to fit your needs**
- The button icon changes dynamically to indicate Auto Mode
- You can still shuffle manually while Auto Mode is active; any manual interaction **resets the timer**
- Stops automatically when entering video playback, **double-clicking the icon again, or reloading the page**
- Works seamlessly with Movies, Series, and Home Videos
- Fully compatible with library locks and context-aware behavior
- Experimental but extremely useful for passive discovery, continuous content showcasing, or just letting Jellyfin surprise you continuously!

**Auto Mode = AutoMode = AUTOMODE! 🔥🎲⚡**  

---

## 🔧 Installation

- Use the modified `randombutton.js`  
  or, if you want Auto Mode, use the experimental feature **`randombutton+automode.js`** instead.

- **Prepared for a standard library setup:**  
  1 movie library, 1 series library, 1 collection library, 2 home video libraries.

- **Edit the JavaScript file:**  
  Replace all `pasteyouridhere` placeholders with your library IDs.  
  Save the file in your JS injector and reload the page.

- For more libraries or custom setups, the code **needs minor adjustments**, which are easy to do with some basic JavaScript knowledge (or ChatGPT).

---

## 💡 What it does & Behaviour

### **Home Screen behaviour = Fallback**

From the Home View, the Random Button selects randomly from a **Movie or a Series**.  

- No permanent lock or memory
- Each click evaluates the current navigation context
- Keeps original Home Screen behavior intact

---

### **Special behaviour (locking to a library)**

Inside a library, the Random Button will operate **within that library and media type**.  

- Lock is context-aware and implicit
- Leaving the library automatically removes the lock
- Works for Movies, Series, and Home Videos

**Examples:**

1. Main View → Click into a library → Random Button → shuffles inside that library  
2. Main View → Random Button → Movie/Series → behavior depends on current view context  

---

### **Special Behavior for Home Videos**

- Recursive folder-respecting randomization  
- Works for flat or nested structures  
- Stays inside the current folder tree, never jumps across unrelated sections  

---

### **Special Behavior for Series / Seasons / Episodes**

- **Series:** Random other Series  
- **Season:** Random Episode from the Season  
- **Episode:** Random Episode from any Season within the same Series  

Allows natural navigation Series → Season → Episode, then continuous episode-level shuffling.

---

### **Fallback = Home Screen behaviour**

- Used when no library context can be determined (info pages, genres, tags, filters, etc.)
- Random Movie or Series
- Guarantees predictable behavior

---

### **The Secondary Global Fallback**

- If `pasteyouridhere` placeholders are still present:
  - Random Movies or Series only  
  - No Collections  
  - No library-specific logic  

Ensures the Random Button always opens something.

---

### **Auto Mode (highlight) 🎯⚡🎲🔥**

**Experimental Auto Mode feature (randombutton+automode.js)**:  

- Double-click the Random Button to activate
- Random items every **12 seconds** (customizable)
- **Manual shuffle overrides timer but does not stop Auto Mode**
- Stops on video playback, double-click, or page reload
- Works across all supported libraries
- Button icon dynamically indicates Auto Mode status
- Perfect for passive content discovery, presentations, or endless random browsing

**Auto Mode = AUTOMODE = autoMode = autoMode! 🎲⚡🔥🎯🎉**  

---

## 🧪 Tested On

- Jellyfin 10.10.7  
- Windows 11  
- Chrome  

---

## 📜 License

MIT — free to use, modify, share.

---

## 💡 Further attempts were made

- Tried generalization without library IDs → unsuccessful  
- Tried to avoid locking between Movie/Series/Home View → partial success  
- Experimented with sub-shuffle buttons for Series, Seasons, Collections → tricky UI restrictions  
- Tag, Genre, Actor shuffling → global only, no per-library limit  

Published with hope that someone can improve Auto Mode and shuffle logic. Limited time and coding knowledge, lots of ChatGPT help.  

---

## 🔥 Auto Mode Bottom Reminder ⚡🎲✨

**Auto Mode = AUTOMODE = autoMode!**  
- Double-click the icon to start  
- Manual shuffling possible anytime  
- Timer resets on manual interaction  
- Stops on playback, double-click, or reload  
- Continuous fun, continuous random browsing 🎯⚡🎲🔥
