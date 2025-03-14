# 🌟 QuickFolds

Welcome to **QuickFolds**, an innovative web application designed for origami enthusiasts! QuickFolds allows creators to animate their origami folding sequences effortlessly—no need for complex 3D software like Blender or Maya. Share your designs with the community using a sleek, step-by-step animated visualizer.


Our current final version can be found under the `final` tag in the GitHub repository.


---

## 📖 Project Overview

### ✨ What is QuickFolds?
QuickFolds is a web-based platform tailored for origami artists who want to create and share folding animations. Instead of relying on static paper instructions or obstructed video tutorials, users can generate smooth digital animations with simple Mountain and Valley folds. The intuitive interface ensures that anyone can get started with a minimal learning curve.

### 🏗️ Core Technologies
- **Frontend:** HTML, CSS, JavaScript, Three.js, Vite
- **Backend:** Java, Spring Boot, PostgreSQL, Docker
- **Development Tools:** Maven, Node.js, Windows Subsystem for Linux (WSL) (Windows Users), Homebrew (Mac Users)

---

## 🚀 Getting Started

### 🛠️ Installation
To set up QuickFolds, you’ll need to install several prerequisites such as Node.js, JDK 21, Docker Desktop, and Maven.

📜 **[User Manual](./_USERMANUAL.md)** 📜
📍 Follow the step-by-step guide in `_USERMANUAL.md` for installation instructions and how to use QuickFolds effectively.

### ⚙️ Developer Setup
If you are a developer looking to contribute, our repository structure and setup details are outlined in the developer guide.

🖥️ **[Developer Manual](./_DEVMANUAL.md)** 🖥️
🔧 `_DEVMANUAL.md` contains everything you need to start developing, testing, and improving QuickFolds.

---

## 🎯 Features
✅ **Origami Animation Editor** – Easily create and edit folding sequences.

✅ **Step-by-Step Folding** – Show every move with precision.

✅ **Community Board** – Share and explore origami designs.

✅ **3D Viewing & Manipulation** – Rotate, zoom, and interact with your model.

✅ **Web-Based, No Extra Software Needed!**

---

### Current List of Known bugs

+ Folding does not always correctly split an annotation line crossing the crease line.

+ Folding breaks if the user is interacting with a very small face.

+ If the user is in the middle of one button action in the editor, then swap sto another, it crashes. For example, clicking "Add Point", followed by "Delete Point", without having first completed the add point action, may break the editor.

+ Creating annotation lines that connect two vertices. The user should be disallowed from doing this, but currently they can, and it may cause issues with subsequent folds.

+ Viewing an origami model fails if the user views a different user's created origami or is on a different local computer.


## 🐛 Found a Bug?
Help us improve! Submit an issue here: [QuickFolds Issues](https://github.com/NewbieTed/QuickFolds/issues)

### 📌 Bug Report Format
```
Title: Short Description of the Issue

Description: Explain the bug in detail (3-6 sentences).

Steps to Reproduce:
	1.	Step 1
	2.	Step 2
…

Expected vs Actual Behavior:
	•	Expected: What should happen?
	•	Actual: What happens instead?

Web Browser: (e.g., Google Chrome, Firefox, Edge)
```
For best practices, refer to [Bugzilla’s Guide](https://bugzilla.mozilla.org/page.cgi?id=bug-writing.html).

---

## 📜 License
This project is open-source under the [MIT License](./LICENSE).

💡 Happy Folding! 🦢🎨✨

```
        _____                   /|
        |   \      ____        / |
  __    |    \    /\   |      /  ;
 /\  \  |     \  /  \  |     /  ;
/,'\  \ |      \/  : \ |    /   ;
~  ;   \|      /   :  \|   /   ;
   |    \     /   :'  |   /    ;
   |     \   /    :   |  /    ;
   |      \ /    :'   | /     ;
   |       /     :    |/     ;
   |      /     :'    |      ;
    \    /      :     |     ;
     \  /      :'     |     ;
      \       :'      |    ;
       \______:_______|___;
```