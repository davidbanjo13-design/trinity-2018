# Git Cheat Sheet

You forgot all of this once. That's normal — you used it twice in August and not since. This file exists so you never have to ask me again.

**Read this before you start, not when you're stuck.**

---

## The mental model (30 seconds)

**Git** = a program on your laptop that takes labelled snapshots of a folder.
Like Google Docs version history, except you choose when the snapshots happen and you write the label.

**GitHub** = a website that stores a copy of those snapshots online.

**GitHub Desktop** = an app with buttons that runs Git for you.

Three separate things. Two of them share four letters, which is the entire reason this is confusing.

**Netlify** = watches your GitHub repo. When it sees a new snapshot, it rebuilds your live site automatically. You never touch Netlify again.

---

## Your setup

| Thing | Where |
|---|---|
| Your code | `02 Projects/Trinity Reunion/Build/` |
| Your repo on GitHub | `trinity-2018` |
| Your live site | https://trinity-2018.netlify.app/ |

---

## The only loop you need

Every single session ends the same way:

1. Save your file in VS Code — **Cmd + S**
2. Open **GitHub Desktop**
3. Your changed files show up on the left automatically
4. Bottom-left, in the **Summary** box, write what you changed
5. Click **Commit to main**
6. Top bar: click **Push origin**
7. Done. Your live site updates by itself within a minute.

That's it. That's the whole thing.

---

## Writing the message

GitHub Desktop pre-fills "Update index.html". Don't accept it — it tells future-you nothing.

Write what *changed*:

- ✅ `Add story copy and fix typos`
- ✅ `Wrap content in header, main and footer`
- ✅ `Fix heading structure`
- ❌ `Update index.html`
- ❌ `changes`

Ten seconds now. In three months it's the difference between a history you can read and one you can't.

---

## What the words mean

| Word | Plain English |
|---|---|
| **repository (repo)** | A folder Git is watching |
| **commit** | One labelled snapshot |
| **push** | Send your snapshots to GitHub |
| **main** | The name of your one line of work. You have no others. |
| **clone** | Download a repo. You won't need this yet. |
| **branch** | Working on a parallel copy. You won't need this yet either. |

---

## When it goes wrong

**Nothing shows up in GitHub Desktop after I edited a file**
You didn't save it. Cmd + S in VS Code.

**A Git tool points at the wrong folder**
There's a stray `.git` in a parent folder. Git searches *upward* until it finds one. See the Stuck List — this bit you already.

**Live site didn't change after I pushed**
Check the Netlify dashboard for a failed deploy. Also check you clicked **Push origin** and not just Commit — committing saves it on your laptop only.

**"Push origin" is greyed out**
Nothing to push. You either haven't committed yet, or you already pushed.

---

## What you are NOT doing yet

Branches, merges, pull requests, rebasing, merge conflicts, the terminal.

All real, all useful, none of it yours to worry about while you're a solo developer with one project. Commit and push is 100% of what you need for the next several months.

Don't let a tutorial convince you otherwise.
