# Rock Paper Suffer

A full-stack multiplayer game combining Rock-Paper-Scissors with Ultimate Tic Tac Toe. Built with React, TypeScript, Node.js, Express, and WebSockets.

## 🎮 Game Rules

1. **RPS Phase**: Each turn starts with Rock-Paper-Scissors
   - Winner gets 1 move on the board
   - Draw means both players get 1 move each

2. **Move Phase**: Make moves on the 9×9 grid
   - Choose any unresolved 3×3 microboard
   - Mark an empty cell in that microboard
   - Win microboards by getting 3 in a row

3. **Victory Condition**: Win 3 microboards in a row (horizontal, vertical, or diagonal) to win the game

4. **Draw**: If the macroboard fills with no winner, the game is a draw

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start development server
npm run dev
```

The server will run on `http://localhost:3000`

### Frontend Setup

```bash
# In a new terminal, navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The client will run on `http://localhost:5173`

## 📁 Project Structure

```
rps-ultimate-ttt/
├── server/
│   ├── src/
│   │   ├── engine/           # Game logic
│   │   │   ├── types.ts      # TypeScript types
│   │   │   ├── Cell.ts       # Cell class
│   │   │   ├── Microboard.ts # 3×3 board logic
│   │   │   ├── Macroboard.ts # 3×3 meta-board
│   │   │   ├── RPS.ts        # Rock-Paper-Scissors
│   │   │   ├── MoveValidator.ts
│   │   │   └── GameEngine.ts # Main game controller
│   │   ├── services/
│   │   │   └── GameService.ts
│   │   ├── routes/
│   │   │   └── game.routes.ts
│   │   ├── websocket/
│   │   │   └── socket.ts     # WebSocket handlers
│   │   └── server.ts         # Express server
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Cell.tsx
│   │   │   ├── MicroBoard.tsx
│   │   │   ├── MacroBoard.tsx
│   │   │   ├── GameBoard.tsx
│   │   │   ├── RPSModal.tsx
│   │   │   └── GameStatus.tsx
│   │   ├── store/
│   │   │   └── gameStore.ts  # Zustand state
│   │   ├── services/
│   │   │   └── api.ts        # API & WebSocket
│   │   ├── types/
│   │   │   └── game.types.ts
│   │   ├── styles/
│   │   │   └── game.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

## 🔧 API Endpoints

### REST API

- `POST /api/game/new` - Create a new game
- `GET /api/game/:id` - Get game state
- `POST /api/game/:id/rps` - Submit RPS choice
- `POST /api/game/:id/move` - Make a move
- `GET /api/game` - List all games (debug)
- `GET /health` - Health check

### WebSocket Events

**Client → Server:**
- `join:game` - Join a game room
- `rps:submit` - Submit RPS choice
- `move:make` - Make a move

**Server → Client:**
- `game:update` - Game state updated
- `rps:waiting` - Waiting for other player
- `rps:result` - RPS round completed
- `move:made` - Move was made
- `game:end` - Game finished
- `error` - Error occurred

## 🎯 Features

✅ Full game engine with validation  
✅ Real-time multiplayer via WebSockets  
✅ Animated moves and transitions  
✅ RPS modal interface  
✅ Visual macroboard state tracking  
✅ Game history logging  
✅ Clean TypeScript architecture  
✅ Responsive design  
✅ Error handling  
✅ Move validation  
✅ Win detection for micro and macro boards  

## 🏗️ Architecture

### Backend

The server uses a modular architecture:

- **GameEngine**: Core game logic and state management
- **Microboard**: Manages individual 3×3 boards
- **Macroboard**: Tracks overall game state
- **RPS**: Handles Rock-Paper-Scissors logic
- **MoveValidator**: Validates all moves
- **GameService**: Business logic layer
- **WebSocket**: Real-time communication

### Frontend

React components with Zustand for state management:

- **GameBoard**: Main 9×9 grid container
- **MicroBoard**: Individual 3×3 boards
- **Cell**: Individual cells
- **RPSModal**: RPS selection interface
- **GameStatus**: Game information display
- **MacroBoard**: Visual state tracker

## 🎨 Styling

Custom CSS with:
- Gradient backgrounds
- Smooth animations
- Responsive grid layout
- Hover effects
- Color-coded players (X = blue, O = pink)
- Visual feedback for moves

## 🧪 Testing the Game

1. Open two browser windows/tabs
2. In the first window, click "Create New Game"
3. Copy the Game ID from the interface
4. In the second window, paste the Game ID and click "Join Game"
5. Both players select Rock, Paper, or Scissors
6. Winner(s) make their move(s)
7. Continue until someone wins!

## 🔒 Security Features

- Server-side game logic (no client-side cheating)
- Move validation on every action
- WebSocket authentication ready
- CORS configuration
- Input sanitization

## 📦 Production Build

### Backend

```bash
cd server
npm run build
npm start
```

### Frontend

```bash
cd client
npm run build
npm run preview
```

## 🐛 Debugging

- Server logs to console
- Client has DevTools support
- WebSocket events logged
- Error messages displayed in UI

## 🚧 Future Enhancements

- [ ] User authentication
- [ ] Matchmaking system
- [ ] Game replays
- [ ] Leaderboard
- [ ] Spectator mode
- [ ] Chat system
- [ ] Time limits per turn
- [ ] Sound effects
- [ ] Mobile app version

## 📝 License

MIT License - feel free to use this project for learning or production!

## 👥 Contributing

Contributions welcome! Please follow TypeScript best practices and maintain the existing architecture.

---

**Enjoy the game! 🎮**