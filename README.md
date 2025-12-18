# Jellyfin Random Button (Fork)

Based on [n00bcodr](https://github.com/n00bcodr/Jellyfin-Random-Button), this modification **locks the random button to the library and media type you enter from the main Home view**. All library IDs are **neutralized** and configurable, including **HOME1 and HOME2**.

---

## 🔧 Installation

Installation is the same as the original, except:

- Use the modified `randombutton.js`.
- **The file is prepared for a standard use library setup:**  
  1 movie library, 1 series library, 1 collection library, 2 home video libraries.

- **Edit the `randombutton.js`:**  
  Copy and paste the library IDs from your main libraries and replace the `pasteyouridhere` placeholders.  
  Don't forget to save the changes in your JavaScript injector and make a backup. Reload the browser site and go.

- If you want more libraries or different types of libraries, the code **needs to be adjusted for your setup**.  
  It’s pretty quick with ChatGPT; it might make a few mistakes, but after 5 or so attempts it should work.

---

## 💡 What it does & Behaviour

I love the Randomizer! But I wanted it to have a few more features and to behave more specifically within libraries. Here's what it does:

- **Home Screen behaviour:**  
  From the Home View, the Random Button can select randomly from Movies, Sets, or Series. This also serves as the fallback behaviour, keeping the original functionality intact.

- **Special behaviour (locking to a library):**  
  When you navigate from the Home Screen into a specific library (or if the Random Button selects an item from a library), the button will be **locked to that library and its media type** for all future random selections. Examples:

  1. Main View → Random Button → Movies, Sets, or Series (fallback) → Random Button → locked to the library/media type for the next use.  
  2. Main View → Click into a library manually → Random Button → locked to that library/media type for future uses.

- **Scope and practical use:**  
  The lock only applies when entering a library from the Main View. If you navigate through media via info pages, tags, genres, actors/people, or other filters, the Random Button **always falls back to the Main View behaviour**.  

  This is especially useful for large libraries or Home Video collections. No matter how your folder structure is organized—flat or deeply nested—the randomization respects the library lock. If you have a well-organized collection, locking the Random Button to a library makes exploring it much more fun and controlled.

---

## 🧪 Tested On

Tested only on Jellyfin 10.10.7, on Windows 11, on Chrome.

---

## 📜 License

MIT — free to use, modify, share.
