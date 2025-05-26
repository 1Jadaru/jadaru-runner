# Jadaru Runner - Refactored Version

A modern, modular 3D endless runner game built with Three.js and ES6+ modules.

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns with ES6 modules
- **Entity-Component-System**: Organized game entities and systems
- **Performance Optimized**: Frame rate monitoring and automatic quality adjustment
- **Mobile Responsive**: Touch controls for mobile devices
- **Modern JavaScript**: ES6+ features, async/await, modules
- **Audio System**: Web Audio API integration for sound effects
- **Collision Detection**: Efficient AABB collision system
- **Visual Effects**: Glow effects, particle systems, screen shake
- **Configurable**: Centralized configuration system
- **Animated Billboards**: Dynamic advertising displays with multiple animation types

## 🔧 Recent Fixes

### Billboard Animation System ✅ FULLY RESOLVED
- **Previous Issues**: 
  - Greenish color overlay on left half of billboards
  - Half-missing content (left half blank on left billboards, right half blank on right billboards)
  - Inconsistent animation display
- **Root Causes Identified**: 
  - Overlapping neon trim geometry interfering with screen texture
  - Billboard rotation angle too steep (15°) causing viewing angle problems
  - Inconsistent UV mapping coordinates
- **Complete Solution Applied**:
  - ✅ Removed problematic neon trim overlay eliminating color interference
  - ✅ Reduced rotation angle from 15° to 5° preserving full content visibility
  - ✅ Fixed UV mapping with explicit coordinates for proper texture display
  - ✅ Restored all 4 animation types (scrollText, pulse, wave, matrix)
- **Final Result**: Fully functional billboard system with clean displays showing complete animated content

### Performance & Stability ✅
- **Frame Rate**: Stable 60fps performance maintained
- **Memory Management**: Optimized geometry complexity
- **Visual Quality**: Sharp, clean billboard displays without artifacts
- **Animation Smoothness**: All billboard animations running smoothly

## 📁 Project Structure

```
src/
├── core/
│   ├── config.js          # Game configuration and constants
│   ├── GameEngine.js      # Main game engine and loop
│   └── GameFactory.js     # Entity creation factory
├── entities/
│   ├── Player.js          # Player entity with physics
│   └── Obstacle.js        # Obstacle entities with AI
├── systems/
│   ├── InputSystem.js     # Keyboard and touch input handling
│   ├── PhysicsSystem.js   # Physics and movement calculations
│   ├── CollisionSystem.js # Collision detection and response
│   ├── RenderSystem.js    # Visual effects and optimizations
│   └── AudioSystem.js     # Sound effects and music
├── environment/
│   └── EnvironmentSystem.js # Road, scenery, and backgrounds
├── ui/
│   └── UISystem.js        # User interface management
└── main.js                # Application entry point
```

## 🎮 Controls

### Keyboard
- **A** / **←**: Move left
- **D** / **→**: Move right  
- **W** / **↑** / **Space**: Jump
- **Escape**: End game

### Touch (Mobile)
- Touch control buttons at bottom of screen
- Left/Right arrows for movement
- Up arrow for jumping

### Debug Controls (Development)
- **Ctrl+R**: Restart game
- **Ctrl+P**: Toggle pause
- **Ctrl+W**: Toggle wireframe mode
- **Ctrl+S**: Take screenshot

## 🛠 Technical Improvements

### Performance Optimizations
- **Frame Rate Monitoring**: Automatic quality reduction when FPS drops
- **Frustum Culling**: Objects outside view are not processed
- **Object Pooling**: Reuse obstacle objects to reduce garbage collection
- **Efficient Collision Detection**: Optimized AABB collision system

### Code Quality
- **ES6+ Modules**: Clean imports/exports for better dependency management
- **Async/Await**: Modern promise handling
- **Consistent Naming**: camelCase convention throughout
- **Error Handling**: Comprehensive error catching and reporting
- **Documentation**: JSDoc comments for all methods

### Architecture Benefits
- **Separation of Concerns**: Each system handles one responsibility
- **Loose Coupling**: Systems communicate through the game engine
- **Easy Testing**: Modular structure allows unit testing
- **Maintainable**: Clear file organization and naming
- **Extensible**: Easy to add new features and systems

## 🎯 Game Mechanics

### Player
- Smooth acceleration/deceleration movement
- Physics-based jumping with gravity
- Visual feedback (rotation during movement/jumping)
- Boundary constraints within lane

### Obstacles
- Randomized spawning positions
- Pulsing visual effects
- Collision detection with player
- Recycling system for performance

### Scoring
- Points awarded for passing obstacles
- Local storage persistence of high scores
- Visual score increase animations

### Progressive Difficulty
- Gradually increasing game speed
- Maintained challenge curve

## 🔧 Configuration

All game parameters are centralized in `src/core/config.js`:

```javascript
export const CONFIG = {
  PLAYER: {
    JUMP_VELOCITY: 0.2,
    GRAVITY: -0.01,
    MAX_SPEED: 0.15
  },
  GAME: {
    INITIAL_SPEED: 0.1,
    LANE_WIDTH: 4
  },
  // ... more configuration options
};
```

## 🎨 Visual Features

- **Tron-style aesthetic**: Neon colors and glowing effects
- **Dynamic lighting**: Directional and ambient lighting
- **Particle effects**: Explosion effects on collision
- **Screen shake**: Impact feedback
- **Trail effects**: Player movement trail
- **Billboards**: Animated roadside elements
- **Starfield**: Dynamic background

## 🔊 Audio Features

- **Web Audio API**: Synthesized sound effects
- **Volume Controls**: Separate music and SFX controls
- **Sound Effects**: Jump, collision, score, game over
- **Mute Toggle**: Audio on/off functionality

## 🚀 Getting Started

1. **Open the game**: Simply open `index.html` in a modern web browser
2. **Development**: Use a local server for ES6 module support
3. **Controls**: Use keyboard or touch controls to play
4. **Debug**: Open browser console for debug information

## 🌐 Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **ES6 Module Support**: Required for imports/exports
- **WebGL Support**: Required for Three.js rendering
- **Web Audio API**: Optional, for sound effects

## 📈 Performance Tips

- The game automatically adjusts quality based on frame rate
- Reduce browser tab count for better performance
- Close other applications for optimal experience
- Enable hardware acceleration in browser settings

## 🔍 Development Notes

This refactored version demonstrates:
- Modern JavaScript best practices
- Modular architecture patterns
- Performance optimization techniques
- Responsive design principles
- Error handling strategies
- Documentation standards

## 📝 Future Enhancements

Potential improvements for future versions:
- Power-ups and collectibles
- Multiple game modes
- Procedural level generation
- Multiplayer support
- Advanced particle systems
- Physics engine integration
- Asset loading system
- Internationalization

## 📺 Billboard System

- **Dynamic Advertising Displays**: Interactive billboards along the roadside
- **Multiple Animation Types**:
  - **Scrolling Text**: Horizontally scrolling messages with dynamic content
  - **Pulse Effects**: Breathing glow effects with scaling text
  - **Wave Animations**: Wavy text effects with character-by-character movement
  - **Matrix Effects**: Digital rain with cyber-punk styling
- **Real-time Content**: Live score and distance displays
- **Visual Consistency**: Clean rendering without color overlay issues
