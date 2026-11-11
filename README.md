# Don't Forget Me

**Don't Forget Me** is a university prototype that combines a web checklist with an ESP32-based reminder device.
The goal is simple: before leaving, the user confirms important items in the web application. A physical display shows how many items are still missing and warns the user if the door is opened too early.

## Features

- Digital checklist for everyday items
- Session-based checklist progress
- REST communication between frontend, backend and ESP32
- MongoDB persistence (optional local demo mode available)
- TM1637 display for the number of missing items
- Door switch event via ESP32
- Warning state when the door is opened before the checklist is complete

## Tech Stack

**Frontend:** Vue · Vite · Axios  
**Backend:** Node.js · Express · REST API  
**Database:** MongoDB · Mongoose  
**Hardware:** ESP32 · Arduino · TM1637  

## Architecture

```text
Vue Frontend
     |
     | REST / JSON
     v
Node.js + Express
     |
     | MongoDB / Mongoose
     v
  MongoDB
     ^
     |
     | HTTP
     |
   ESP32 + TM1637 + door switch
```

## Application flow

1. Start a checklist session.
2. Confirm the items one after another.
3. The physical display counts down: `0004 -> 0003 -> 0002 -> 0001 -> DONE`.
4. If the door is opened before all items are confirmed, the application switches to a warning state.

## Run locally

### Backend

```bash
cd api-game/api-game
npm install
npm start
```

The API runs on `http://localhost:12345`.

By default, the project can run without MongoDB using temporary in-memory data.
To use MongoDB, create an `.env` file based on `.env.example` and set `USE_MONGODB=true`.

### Frontend

```bash
cd front-game/front-game
npm install
npm run dev
```

The frontend is available on `http://localhost:5173`.

## ESP32

The Arduino sketch is located in `sketch/sketch.ino`.
Before uploading it to the ESP32, configure:

- Wi-Fi name
- Wi-Fi password
- local IP address of the computer running the backend

The original hardware concept uses GPIO32 and GPIO33 for the TM1637 display and GPIO27 for the door switch.

## Project note

This repository is a portfolio rebuild based on my original university project and its documented architecture and behavior. The original final source folder was no longer available, so the application was recreated for documentation and demonstration purposes.
