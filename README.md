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

- **Home Screen behaviour=Fallback:**  
  From the Home View, the Random Button can select randomly from a Movie, a Set, or a Series. Depending on the result you are now **locked to that library and its media type** for all future random selections. This also serves as the fallback behaviour, keeping the original functionality intact.

- **Special behaviour (locking to a library):**  
  When you navigate from the Home Screen into a specific library (or if the Random Button selects an item from a library), the button will be **locked to that library and its media type** for all future random selections. Examples:

  1. Main View → Random Button → Movie or Set or Series (=Home Screen behaviour=Fallback) → Random Button → locked to the library/media type for the next use.  
  2. Main View → Click into a library manually → Random Button → locked to that library/media type for future uses.

- **Special Behavior for Home Videos:**  
  Randomization respecting current folder level recursively, so whether your collection is flat or deeply nested, the button won’t jump across unrelated sections. This creates a more controlled and enjoyable browsing experience, letting you explore your Home Videos folder by folder without losing the element of surprise. This feature is particularly useful for large and tree nested Home Video libraries. 

- **Fallback=Home Screen behaviour**  
  The lock only applies when entering a library from the Main View. If you navigate through media via info pages, tags, genres, actors/people, or other filters, etc.., the Random Button always falls back to the Home Screen behaviour. (Movie or Set or Series)

- **The Secondary Global Fallback**
Is a vanilla fallback that triggers when no library IDs are filled in, the 'pasteyouridhere' placeholders still in place. It randomly selects only Movies or Series (no Sets/Collections) from the user’s library, ensuring the random button always opens an item even without configured IDs, effectively reverting to the vanilla behavior with no ID adjustments.
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

---

## 💡 Further attempts were made, but I failed:

Initially, I tried to make the script more general by doing it without library IDs, but unfortunately, I couldn’t manage it.

I also tried that when I go from the main view to random, and then switch between movie, set, and series, it wouldn’t lock afterwards, but would continue shuffling as long as the shuffle button is pressed. I even managed to implement a sort of memory with lastItemUsed. Unfortunately, it didn’t forget the lastItem when it was supposed to, resulting in random results instead of returning to the locked state. Also tried to equate seasons and episodes with the series, so that they wouldn’t have a fallback but would continue shuffling series. I think that’s possible too, but I wasn’t successful.

Furthermore, I tried that if I land on a TV show, the next shuffle would shuffle a season, and the following one an episode, but that didn’t work either. The same happened when I tried to shuffle a collection, and then shuffle a movie from it next—also without success. I also attempted to implement a 'sub-shuffle button' that would only appear for collections, series, or seasons. However, I had trouble restricting its visibility: it was supposed to appear only in the respective container, but the buttons either always appeared or didn’t appear at all.

I also tried to get randomness for other labels like tags, genres, studios, and actors. For the tags, I even managed to shuffle pre-stored tags. The problem: I couldn’t limit it to the current library or media type. It always showed a random tag from all the tags in the Jellyfin database, completely unfiltered. I couldn’t find a way to narrow it down properly. Maybe someone knows how to limit that.

Edit: I will also try to see if it’s possible, when you’re on an actor and there are media available (movies, series, episodes), to shuffle something from that.

I published this in the hope that someone who knows coding stuff better might take a look. I only worked on it with a few hours of time and a lot of help from ChatGPT. To be honest, I have very little understanding of coding itself and what it actually means. I’m not a coder. I would be grateful if someone could find the right code snippets and help make the shuffle code smarter and more flexible. Much appreciated




