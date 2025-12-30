# Jellyfin Random Button Extended (Fork)

Based on [n00bcodr](https://github.com/n00bcodr/Jellyfin-Random-Button), this modification extends the Random Button with more context-aware behavior inside libraries and an optional Auto Mode, while keeping the original random concept intact.

---

## 🔧 Installation

Installation is the same as the original, except:

- Use the modified `randombutton.js`  
  or, if you want Auto Mode, use **`randombutton+automode.js`** instead.

- **The file is prepared for a standard library setup:**  
  1 movie library, 1 series library, 1 collection library, 2 home video libraries.

- **Edit the JavaScript file:**  
  Copy and paste the library IDs from your main libraries and replace the `pasteyouridhere` placeholders.  
  Save the changes in your JavaScript injector, reload the browser page, and you’re done.

- If you want more libraries or different types of libraries, the code **needs to be adjusted for your setup**.  
  It’s fairly quick with ChatGPT; it may make a few mistakes, but after a few attempts it usually works.

---

## 💡 What it does & Behaviour

I love the Randomizer! But I wanted it to have a few more features and to behave more specifically within libraries. Here's what it does:

---

### **Home Screen behaviour = Fallback**

From the Home View, the Random Button selects randomly from a **Movie or a Series**.

This behavior acts as the **primary fallback**:
- No permanent lock or memory is stored
- Each click evaluates the current navigation context again
- The selection is always fresh and context-aware

This keeps the original Home Screen behavior intact while avoiding unwanted or stuck states.

---

### **Special behaviour (locking to a library)**

When you navigate into a specific library manually, the Random Button operates **within that library and media type** as long as the navigation context remains clear.

- The lock is **implicit and context-based**
- It only applies while you stay inside that library
- Leaving the library (for example via Home, metadata pages, filters, etc.) automatically removes the lock

Examples:

1. Main View → Click into a library manually → Random Button → randomizes within that library  
2. Main View → Random Button → Movie or Series → Random Button → behavior depends on the current view context  

---

### **Special Behavior for Home Videos**

Randomization respects the **current folder hierarchy recursively**.

- Works with flat as well as deeply nested folder structures
- Random selections stay within the current folder tree
- Prevents jumping across unrelated Home Video sections

This is especially useful for large Home Video libraries with complex directory trees.

---

### **Special Behavior for Series / Seasons / Episodes**

The Random Button has additional logic when navigating TV content:

1. **Series:**  
   If the current item is a Series, clicking the Random Button selects a random **other Series** from the Series library.

2. **Season:**  
   If the current item is a Season, clicking Random selects a random **Episode from that Season**.

3. **Episode:**  
   When already on an Episode, clicking Random always selects a random Episode from **any Season within the same Series**.

This allows natural navigation from Series → Season → Episode, and then continuous episode-level shuffling inside the same series, without jumping to unrelated content.

---

### **Fallback = Home Screen behaviour**

If the Random Button cannot determine a valid library context (for example when navigating via info pages, genres, tags, actors/people, or other filters), it always falls back to the Home Screen behavior:

- Random Movie  
- Random Series  

This guarantees predictable behavior regardless of navigation path.

---

### **The Secondary Global Fallback**

If no library IDs are filled in and the `pasteyouridhere` placeholders are still present, the script falls back to a vanilla behavior:

- Random selection from Movies or Series only
- No Collections
- No library-specific logic

This ensures the Random Button always opens an item, even without configuration.

---

### **Auto Mode (optional)**

An optional **Auto Mode** is available via a separate script file:

**`randombutton+automode.js`**

Auto Mode behavior:
- Activated by **double-clicking** the Random Button
- Automatically opens a new random item every **12 seconds**
- **The interval can be adjusted directly in the script to fit your needs**
- The button icon changes to indicate Auto Mode
- Any manual interaction resets the timer
- Auto Mode stops automatically when entering video playback, **double-clicking the icon again, or reloading the page**

This mode is useful for passive discovery, showcasing content, or continuous random browsing.

---

## 🧪 Tested On

Tested only on Jellyfin 10.10.7, on Windows 11, on Chrome.

---

## 📜 License

MIT — free to use, modify, share.

---

## 💡 Further attempts were made, but I failed

Initially, I tried to make the script more general by doing it without library IDs, but unfortunately, I couldn’t manage it.

I also tried to avoid locking when switching between movie, set, and series from the Home View, but it didn’t work reliably. Attempts to store temporary state like `lastItemUsed` caused incorrect behavior and stale results instead of returning to the expected fallback.

I tried equating seasons and episodes with the series to avoid fallback behavior, and also experimented with different shuffle depths (series → season → episode), but without success. The same applied to shuffling collections and then shuffling items inside them.

I also experimented with a secondary “sub-shuffle” button for collections, series, or seasons, but had trouble restricting its visibility to the correct UI containers.

Further attempts were made to introduce randomness for tags, genres, studios, and actors. While tag shuffling partially worked, it could not be limited to the current library or media type and always returned global results.

I published this in the hope that someone with more coding experience might take a look. I worked on this with limited time and a lot of help from ChatGPT. I’m not a coder, and I’d appreciate any improvements or ideas to make the shuffle behavior smarter and more flexible.
