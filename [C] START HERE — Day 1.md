# START HERE — Day 1

**Today, 7 August 2026. Time needed: 60–90 minutes.**

By the end of this page you will have a real web page, live on the internet, at a URL you can send to anyone.

You know nothing yet. That's fine — today isn't about knowing. It's about proving the pipeline works, so that from tomorrow every session *improves something that already exists* instead of starting from nothing.

Type everything. Do not copy-paste. Your fingers are learning too.

---

## Step 1 — Install VS Code (10 min)

Go to **https://code.visualstudio.com** and download it for Mac. Drag it to Applications. Open it.

Then install one extension:
- Click the Extensions icon in the left sidebar (four squares)
- Search **Live Server** (by Ritwick Dey)
- Click Install

Live Server reloads your page in the browser every time you save. You'll use it every single day from now on.

---

## Step 2 — Make the folder (5 min)

In VS Code: **File → Open Folder…**

Navigate to:
```
Desktop → Cowork homebase → 02 Projects → Reunion-Based Learning → Build
```

Open that folder. This is your project. All your code lives here.

Now, in the file explorer panel on the left, click the **New File** icon and name it exactly:

```
index.html
```

Lowercase. Exactly that name. `index.html` is the file every web server looks for by default — call it anything else and nothing will load.

---

## Step 3 — Write your first page (15 min)

Type this into `index.html`. Every character, by hand.

Don't worry about understanding it yet — you'll take this apart properly in Phase 1. Right now you're proving the pipeline.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Trinity Bexley — Year 11, Class of 2018</title>
  </head>
  <body>
    <h1>Trinity Bexley. Year 11. Class of 2018.</h1>
    <p>It has been eight years. It is time.</p>
  </body>
</html>
```

Save it: **Cmd + S**.

---

## Step 4 — See it (5 min)

Right-click `index.html` in the sidebar → **Open with Live Server**.

Your browser opens. Your page is there.

**Now do this:** change `eight years` to `far too long`. Save. Watch the browser update by itself.

That loop — type, save, see — is the entire job. You'll do it ten thousand times.

---

## Step 5 — Put it on the internet (15 min)

1. Go to **https://app.netlify.com/drop**
2. Open Finder, find your `Build` folder
3. **Drag the whole folder onto the page**
4. Wait about twenty seconds

You now have a URL like `random-words-12345.netlify.app`.

Click **Site configuration → Change site name** and rename it to something real — `trinity-2018` or similar.

**Open that URL on your phone.**

That's your page. On the internet. Made by you, today.

---

## Step 6 — Log it (5 min)

Open `Logs/[C] Daily Log.md`, copy the template, and fill in Day 1.

Do not skip this. The log is what lets you come back to Claude tomorrow and get picked up mid-thought instead of re-explaining where you are.

Set **tomorrow's one thing** to: *"Install Git, get the project on GitHub, connect it to Netlify."*

---

## Step 7 — Sit with it for a second

Yesterday you couldn't write a line from a blank file. Tonight there's a page with your name behind it, at a real address, that people you went to school with could open right now.

The gap between those two things is about seventy minutes of work.

That's the whole thesis of this project: the distance is never as far as it looks from the start, and it only ever closes by building.

---

## Tomorrow — Day 2

- Install Git
- Create a GitHub account
- Push this folder to a repo
- Connect the repo to Netlify so pushing = deploying

Then Phase 1 starts, and you begin writing the real page — the story, why UK schools don't do reunions, and why yours is going to.

---

## What NOT to do today

- ❌ Don't ask AI to improve this page
- ❌ Don't add CSS yet
- ❌ Don't watch a three-hour HTML course "to get ahead"
- ❌ Don't send the link to anyone yet — it says twelve words

Do exactly the seven steps. Close the laptop. Come back tomorrow.
