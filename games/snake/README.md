# Babylon.js Snake Game

A classic Snake game built with Babylon.js 3D engine, featuring modern JavaScript ES6 modules, responsive design, and beautiful visual effects.

## Features

- **3D Rendering**: Powered by Babylon.js for smooth 3D graphics
- **Responsive Design**: Works on desktop and mobile devices
- **Touch Controls**: Swipe gestures for mobile gameplay
- **Visual Effects**: Particle effects, bloom post-processing, and smooth animations
- **Score System**: Local storage for high score persistence
- **Modern Development**: ES6 modules, ESLint, and Prettier for code quality

## Project Structure

```
snake/
├── package.json              # Project configuration and dependencies
├── index.html               # Main HTML file with responsive layout
├── .eslintrc.json          # ESLint configuration for code quality
├── .prettierrc             # Prettier configuration for code formatting
├── .gitignore              # Git ignore rules
├── styles/
│   └── main.css            # Complete responsive styling
└── src/
    ├── main.js             # Babylon.js initialization and engine setup
    ├── game.js             # Main game controller and state management
    ├── snake.js            # Snake entity with 3D rendering and movement
    ├── food.js             # Food spawning with particle effects
    ├── input.js            # Input handling (keyboard and touch)
    └── grid.js             # Grid coordinate system management
```

## Prerequisites

Before running the project, make sure you have:

1. **Node.js** (version 14 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **Modern Web Browser** with WebGL support
   - Chrome, Firefox, Safari, or Edge (latest versions)

## Installation & Setup

1. **Clone or download** this project to your local machine

2. **Navigate to the project directory:**
   ```bash
   cd path/to/snake
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   This will start a live server on `http://localhost:8080` and automatically open the game in your browser.

## Alternative Setup (Without Node.js)

If you don't have Node.js installed, you can still run the game:

1. **Serve the files** using any local web server:
   - Python: `python -m http.server 8080`
   - PHP: `php -S localhost:8080`
   - Or use any other local server solution

2. **Open in browser**: Navigate to `http://localhost:8080`

## Development Scripts

- `npm run dev` - Start development server with live reload
- `npm run lint` - Check code quality with ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Game Controls

### Desktop
- **Arrow Keys**: Move the snake (Up, Down, Left, Right)
- **WASD Keys**: Alternative movement controls
- **Spacebar**: Pause/Resume game
- **R Key**: Restart game after game over

### Mobile
- **Swipe Gestures**: Swipe in the direction you want the snake to move
- **Tap Controls**: Tap the pause button to pause/resume

## Gameplay

1. **Objective**: Control the snake to eat food and grow longer
2. **Scoring**: Each food item increases your score
3. **Collision**: Game ends if the snake hits walls or itself
4. **High Score**: Your best score is saved locally

## Technical Details

### Babylon.js Integration
- 3D scene with orthographic camera for 2D gameplay
- Custom materials and lighting for visual appeal
- Post-processing pipeline with bloom effects
- Particle systems for food consumption effects

### Performance Optimizations
- Efficient collision detection
- Object pooling for particles
- Optimized rendering loop
- Memory management for mobile devices

### Browser Compatibility
- Modern browsers with WebGL support
- Mobile-responsive design
- Touch event handling for mobile devices

## Customization

### Game Settings
Edit `src/game.js` to modify:
- Game speed and difficulty
- Grid size and snake starting position
- Scoring system

### Visual Appearance
Edit `styles/main.css` to customize:
- Colors and themes
- Layout and responsive breakpoints
- UI elements and animations

### 3D Effects
Edit `src/main.js` to adjust:
- Camera settings and positioning
- Post-processing effects
- Lighting and materials

## Troubleshooting

### Common Issues

1. **Game not loading**:
   - Check browser console for errors
   - Ensure all files are properly served
   - Verify WebGL support in your browser

2. **Controls not working**:
   - Make sure the game canvas has focus
   - Check if browser is blocking input events
   - Try refreshing the page

3. **Performance issues**:
   - Close other browser tabs
   - Check hardware acceleration is enabled
   - Try reducing browser zoom level

### Browser Requirements
- WebGL 1.0 or higher
- ES6 module support
- Canvas API support
- Modern JavaScript features (async/await, classes, modules)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting: `npm run lint:fix && npm run format`
5. Test your changes thoroughly
6. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Credits

- **Babylon.js**: 3D engine powering the game
- **Modern JavaScript**: ES6+ features for clean, maintainable code
- **Responsive Design**: Mobile-first approach for universal compatibility

---

**Enjoy playing the Snake game!** 🐍🎮
