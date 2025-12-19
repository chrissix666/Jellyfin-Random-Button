# Jellyfin Random Button Extended (Fork)

Based on [n00bcodr](https://github.com/n00bcodr/Jellyfin-Random-Button), this modification locks the random button to the library and media type you enter from the main Home view.

---

## 🔧 Installation

Installation is the same as the original, except:

- Use the modified `randombutton.js`.
- **The file is prepared for a standard use library setup:**  
  1 movie library, 1 series library, 1 collection library, 2 home video libraries.

- **Edit the `randombutton.js`:**  
  Copy and paste the library IDs from your main libraries and replace the `pasteyouridhere` placeholders.  
  Don't forget to save the changes in your JavaScript injector. Reload the browser site and go.

- If you want more libraries or different types of libraries, the code **needs to be adjusted for your setup**.  
  It’s pretty quick with ChatGPT; it might make a few mistakes, but after a few attempts it should work.

---

## 💡 What it does & Behaviour

I love the Randomizer! But I wanted it to have a few more features and to behave more specifically within libraries. Here's what it does:

- **Home Screen behaviour:**  
  From the Home View, the Random Button can select randomly from Movies, Sets, or Series. This also serves as the fallback behaviour, keeping the original functionality intact.

- **Special behaviour (locking to a library):**  
  When you navigate from the Home Screen into a specific library (or if the Random Button selects an item from a library), the button will be **locked to that library and its media type** for all future random selections. Examples:

  1. Main View → Random Button → Movies, Sets, or Series (fallback) → Random Button → locked to the library/media type for the next use.  
  2. Main View → Click into a library manually → Random Button → locked to that library/media type for future uses.

- **Special Behavior for Home Videos:**  
  While locked, randomization respects the current folder level, so whether your collection is flat or deeply nested, the button won’t jump across unrelated sections. This creates a more controlled and enjoyable browsing experience, letting you explore your Home Videos folder by folder without losing the element of surprise.

This feature is particularly useful for large Home Video libraries. When you enter a library manually or the Random Button selects one from the Home Screen, it becomes locked to that library, ensuring that all future random selections stay within it.

- **Fallback=Home Screen behaviour**  
  The lock only applies when entering a library from the Main View. If you navigate through media via info pages, tags, genres, actors/people, or other filters, etc.., the Random Button always falls back to the Home Screen behaviour. (Movie or Set or Series)
---

## 🧪 Tested On

Tested only on Jellyfin 10.10.7, on Windows 11, on Chrome.

> [!NOTE]
> **Jellyfin Enhanced disclaimer**
>
> Jellyfin Enhanced also includes a Random Button. However, since it is there not injected as a standalone JavaScript, the behaviour of this fork when used together with Jellyfin Enhanced is unknown.
>
> If you are using Jellyfin Enhanced, you should **disable its Random Button** to avoid conflicts.
>
> Jellyfin Enhanced is a great project, but it is currently not used on my side. My setup is still running on Jellyfin 10.10.7, and Jellyfin Enhanced caused subtitle-related bugs and some other issues that were not fully clear.
>
> In the end, only the Random Button functionality was needed. Recently i registered that the Random Button can also be injected independently via a JavaScript injector, without using Jellyfin Enhanced at all.


---

## 📜 License

MIT — free to use, modify, share.


