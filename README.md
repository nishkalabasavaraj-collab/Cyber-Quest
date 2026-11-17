# CyberQuest

CyberQuest is a local cybersecurity awareness game. It uses a small Java 17 server built with the JDK, plus a browser interface made with HTML, CSS, and JavaScript. It does not use Tomcat, Apache, SQL, or third-party libraries.

## Run it

1. Install JDK 17 or newer.
2. Double-click `run.bat`, or use the commands below in this folder.
3. Open `http://localhost:8080` in a browser.

```text
javac --add-modules jdk.httpserver -d out src/cyberquest/*.java
java --add-modules jdk.httpserver -cp out cyberquest.Main
```

Player records are saved in `data/players.txt`. The Java server listens only on the local computer. Stop it with Ctrl+C.

On Vercel, CyberQuest runs as a static browser demo. Its sample accounts and scores are saved in that browser's local storage, so its leaderboard is local to each browser. Use the Java-backed local version above for the MCA Java demonstration.

## Project structure

```text
CyberQuest/
  src/cyberquest/       Java server, models, and game services
  web/                  HTML, CSS, and browser JavaScript
  data/                 Created automatically for player records
```

This is an educational simulator. It does not scan networks or perform real attacks. Quiz and scenario content is fictional. Do not enter a real password in the password challenge.
