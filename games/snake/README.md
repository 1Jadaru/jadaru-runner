# Babylon.js Snake Game - Enhanced Edition

A classic Snake game built with Babylon.js 3D engine, featuring modern JavaScript ES6 modules, responsive design, beautiful visual effects, and advanced gameplay mechanics.

## 🎮 New Features in Enhanced Edition

### Power-up System
- **Speed Power-up** (Red): Temporarily increases snake movement speed
- **Slow Power-up** (Blue): Temporarily decreases snake movement speed
- **Ghost Power-up** (Purple): Allows snake to pass through itself and walls
- **Double Power-up** (Yellow): Doubles points earned for a duration

### Game Modes
- **Classic Mode**: Traditional Snake gameplay with balanced speed
- **Speed Mode**: Fast-paced gameplay with increased movement speed
- **Survival Mode**: Slower speed but more challenging with progressive difficulty

### Combo System
- Chain food consumption to build combos
- Combo multiplier increases score exponentially
- Visual combo display with animated effects
- Maximum combo tracking for high scores

### Enhanced Visual Effects
- Particle effects for food consumption and power-ups
- Ghost mode with floating animation and transparency
- Screen flash effects for level-ups
- Dynamic lighting and post-processing effects
- Smooth animations and transitions

### Audio System
- Web Audio API integration for sound effects
- Different sound types for various game events
- Configurable audio settings
- Mobile-friendly audio handling

### Performance Optimizations
- Adaptive quality based on FPS
- Object pooling for particles
- Optimized rendering with instanced meshes
- Memory management for mobile devices
- Real-time performance monitoring

## Features

- **3D Rendering**: Powered by Babylon.js for smooth 3D graphics
- **Responsive Design**: Works on desktop and mobile devices
- **Touch Controls**: Swipe gestures for mobile gameplay
- **Visual Effects**: Particle effects, bloom post-processing, and smooth animations
- **Score System**: Local storage for high score persistence with combo tracking
- **Modern Development**: ES6 modules, ESLint, and Prettier for code quality
- **Progressive Difficulty**: Speed increases with level progression
- **Multiple Game Modes**: Classic, Speed, and Survival modes
- **Power-up System**: Special items with unique effects
- **Combo Mechanics**: Score multipliers for skilled play
- **Ghost Mode**: Special ability to pass through obstacles
- **Audio Feedback**: Immersive sound effects and audio visualization

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
- **ESC Key**: Open game menu

### Mobile
- **Swipe Gestures**: Swipe in the direction you want the snake to move
- **Tap Controls**: Tap the pause button to pause/resume
- **Virtual D-pad**: On-screen directional controls

## Gameplay Mechanics

### Basic Gameplay
1. **Objective**: Control the snake to eat food and grow longer
2. **Scoring**: Each food item increases your score with combo multipliers
3. **Collision**: Game ends if the snake hits walls or itself (unless in ghost mode)
4. **High Score**: Your best score is saved locally

### Power-ups
- **Random Spawning**: Power-ups appear randomly after eating food (10% chance)
- **Duration**: Power-ups last for 5 seconds
- **Visual Effects**: Each power-up has unique colors and particle effects
- **Strategic Use**: Plan when to use power-ups for maximum effect

### Combo System
- **Chain Eating**: Eat food quickly to build combos
- **Multiplier**: Each combo level increases score by 50%
- **Decay**: Combos reset if you don't eat food quickly enough
- **Display**: Current combo is shown with animated effects

### Game Modes
- **Classic**: Balanced speed, traditional gameplay
- **Speed**: 30% faster movement, high-paced action
- **Survival**: 20% slower but more challenging progression

### Level Progression
- **Level Up**: Every 100 points increases your level
- **Speed Increase**: Each level makes the game slightly faster
- **Visual Feedback**: Screen flash effect when leveling up
- **Difficulty Scaling**: Progressive challenge increase

## Technical Details

### Babylon.js Integration
- 3D scene with orthographic camera for 2D gameplay
- Custom materials and lighting for visual appeal
- Post-processing pipeline with bloom effects
- Particle systems for food consumption and power-up effects
- Animation system for smooth movement and effects

### Performance Optimizations
- Efficient collision detection with ghost mode support
- Object pooling for particles and effects
- Optimized rendering loop with adaptive quality
- Memory management for mobile devices
- Real-time FPS monitoring and quality adjustment

### Audio System
- Web Audio API for cross-platform compatibility
- Procedurally generated sound effects
- Configurable audio settings
- Mobile-friendly audio handling
- Sound effect categories: eat, powerup, gameover, levelup

### Browser Compatibility
- Modern browsers with WebGL support
- Mobile-responsive design with touch controls
- Progressive enhancement for older browsers
- Fallback support for audio and visual effects

## Customization

### Game Settings
Edit `src/game.js` to modify:
- Game speed and difficulty scaling
- Power-up spawn rates and durations
- Combo system parameters
- Level progression settings

### Visual Appearance
Edit `styles/main.css` to customize:
- Colors and themes
- Layout and responsive breakpoints
- UI elements and animations
- Game mode button styling

### 3D Effects
Edit `src/main.js` to adjust:
- Camera settings and positioning
- Post-processing effects
- Lighting and materials
- Particle system parameters

### Power-up Configuration
Edit the PowerUp class in `src/game.js` to:
- Add new power-up types
- Modify power-up effects
- Change visual appearance
- Adjust spawn mechanics

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
   - Game automatically adjusts quality based on FPS

4. **Audio not working**:
   - Check browser audio permissions
   - Ensure Web Audio API is supported
   - Try clicking on the game area first

### Browser Requirements
- WebGL 1.0 or higher
- ES6 module support
- Canvas API support
- Web Audio API support
- Modern JavaScript features (async/await, classes, modules)

## Performance Tips

1. **Mobile Devices**: Use virtual controls for better touch response
2. **High Scores**: Focus on building combos for maximum points
3. **Power-ups**: Use ghost mode strategically to avoid collisions
4. **Speed Mode**: Practice with classic mode first before trying speed mode
5. **Survival Mode**: Plan your route carefully as speed increases

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
- **Web Audio API**: Cross-platform audio support
- **Particle Systems**: Visual effects and feedback

---

**Enjoy playing the Enhanced Snake Game!** 🐍🎮✨

### Version History

**v2.0 (Enhanced Edition)**
- Added power-up system with 4 unique types
- Implemented combo system with score multipliers
- Added 3 distinct game modes
- Enhanced visual effects and animations
- Added audio system with Web Audio API
- Improved performance and mobile support
- Added ghost mode and advanced collision detection

**v1.0 (Original)**
- Basic Snake gameplay with 3D graphics
- Responsive design and touch controls
- High score persistence
- Particle effects and visual feedback
