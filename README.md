# Don't Forget Me

**Don't Forget Me** is a university IoT project that combines a web-based checklist with an ESP32 reminder device.

The application allows the user to confirm important everyday items before leaving. The checklist status is communicated between the web application, the backend and the ESP32. A TM1637 display shows the number of remaining items, and a door switch can trigger a warning if the user leaves before completing the checklist.

## Technologies

- **Frontend:** Vue · Vite · Axios
- **Backend:** Node.js · Express · REST API
- **Database:** MongoDB · Mongoose
- **Hardware:** ESP32 · Arduino · TM1637

## Core Functionality

- Start a checklist session
- Confirm checklist items one after another
- Synchronize checklist status through REST requests
- Display the number of remaining items on the TM1637 display
- Detect a door-opening event through the ESP32
- Trigger a warning when the door is opened before the checklist is complete

## Portfolio Version

This repository is a reconstructed portfolio version of the university project.

For this version, the project structure and core functionality were recreated based on the original implementation and project work. The repository was also cleaned and documented for presentation on GitHub.

## Project note

This repository is a portfolio rebuild based on my original university project and its documented architecture and behavior. The original final source folder was no longer available, so the application was recreated for documentation and demonstration purposes.
