// Force Control System Verification Script
// Run this in the browser console to test force controls

console.log('=== FORCE CONTROL SYSTEM VERIFICATION ===');

// Test 1: Check if force control elements exist
function testForceControlElements() {
    console.log('\n1. Testing Force Control Elements:');
    
    const elements = {
        forceSlider: document.getElementById('forceSlider'),
        forceValue: document.getElementById('forceValue'),
        forceIncrease: document.getElementById('forceIncrease'),
        forceDecrease: document.getElementById('forceDecrease')
    };
    
    Object.entries(elements).forEach(([name, element]) => {
        const exists = !!element;
        console.log(`   ${name}: ${exists ? '✓ Found' : '✗ Missing'}`);
        if (exists && name === 'forceSlider') {
            console.log(`     Range: ${element.min} to ${element.max}, Current: ${element.value}`);
        }
    });
    
    return elements;
}

// Test 2: Check if player controller exists and has force methods
function testPlayerController() {
    console.log('\n2. Testing Player Controller:');
    
    const hasGame = !!window.game;
    console.log(`   Game object: ${hasGame ? '✓ Found' : '✗ Missing'}`);
    
    if (hasGame) {
        const hasPlayerController = !!window.game.playerController;
        console.log(`   Player controller: ${hasPlayerController ? '✓ Found' : '✗ Missing'}`);
        
        if (hasPlayerController) {
            const hasSetForceMethod = typeof window.game.playerController.setForceMagnitude === 'function';
            console.log(`   setForceMagnitude method: ${hasSetForceMethod ? '✓ Found' : '✗ Missing'}`);
            console.log(`   Current force magnitude: ${window.game.playerController.forceMagnitude}`);
            return window.game.playerController;
        }
    }
    
    return null;
}

// Test 3: Test force control interactions
function testForceControlInteractions(elements, playerController) {
    console.log('\n3. Testing Force Control Interactions:');
    
    if (!elements.forceSlider || !playerController) {
        console.log('   ✗ Cannot test - missing required elements');
        return;
    }
    
    const originalForce = playerController.forceMagnitude;
    console.log(`   Original force: ${originalForce}`);
    
    // Test slider change
    const testValue = 3.5;
    elements.forceSlider.value = testValue;
    elements.forceSlider.dispatchEvent(new Event('input'));
    
    setTimeout(() => {
        const newForce = playerController.forceMagnitude;
        const sliderWorking = Math.abs(newForce - testValue) < 0.1;
        console.log(`   Slider test: ${sliderWorking ? '✓ Working' : '✗ Failed'} (Force: ${newForce})`);
        
        // Test increase button
        if (elements.forceIncrease) {
            const beforeIncrease = playerController.forceMagnitude;
            elements.forceIncrease.click();
            
            setTimeout(() => {
                const afterIncrease = playerController.forceMagnitude;
                const increaseWorking = afterIncrease > beforeIncrease;
                console.log(`   Increase button: ${increaseWorking ? '✓ Working' : '✗ Failed'} (${beforeIncrease} → ${afterIncrease})`);
                
                // Test decrease button
                if (elements.forceDecrease) {
                    const beforeDecrease = playerController.forceMagnitude;
                    elements.forceDecrease.click();
                    
                    setTimeout(() => {
                        const afterDecrease = playerController.forceMagnitude;
                        const decreaseWorking = afterDecrease < beforeDecrease;
                        console.log(`   Decrease button: ${decreaseWorking ? '✓ Working' : '✗ Failed'} (${beforeDecrease} → ${afterDecrease})`);
                        
                        // Restore original force
                        playerController.setForceMagnitude(originalForce);
                        elements.forceSlider.value = originalForce;
                        if (elements.forceValue) {
                            elements.forceValue.textContent = originalForce.toFixed(1);
                        }
                        console.log(`   Force restored to: ${originalForce}`);
                    }, 100);
                }
            }, 100);
        }
    }, 100);
}

// Test 4: Test keyboard shortcuts
function testKeyboardShortcuts(playerController) {
    console.log('\n4. Testing Keyboard Shortcuts:');
    
    if (!playerController) {
        console.log('   ✗ Cannot test - missing player controller');
        return;
    }
    
    const originalForce = playerController.forceMagnitude;
    
    // Test '[' key (decrease)
    const decreaseEvent = new KeyboardEvent('keydown', { key: '[' });
    window.dispatchEvent(decreaseEvent);
    
    setTimeout(() => {
        const afterDecrease = playerController.forceMagnitude;
        const decreaseWorking = afterDecrease < originalForce;
        console.log(`   '[' key (decrease): ${decreaseWorking ? '✓ Working' : '✗ Failed'} (${originalForce} → ${afterDecrease})`);
        
        // Test ']' key (increase)
        const increaseEvent = new KeyboardEvent('keydown', { key: ']' });
        window.dispatchEvent(increaseEvent);
        
        setTimeout(() => {
            const afterIncrease = playerController.forceMagnitude;
            const increaseWorking = afterIncrease > afterDecrease;
            console.log(`   ']' key (increase): ${increaseWorking ? '✓ Working' : '✗ Failed'} (${afterDecrease} → ${afterIncrease})`);
            
            // Restore original force
            playerController.setForceMagnitude(originalForce);
            const forceSlider = document.getElementById('forceSlider');
            if (forceSlider) forceSlider.value = originalForce;
            const forceValue = document.getElementById('forceValue');
            if (forceValue) forceValue.textContent = originalForce.toFixed(1);
        }, 100);
    }, 100);
}

// Test 5: Test UI synchronization
function testUISync(elements, playerController) {
    console.log('\n5. Testing UI Synchronization:');
    
    if (!elements.forceValue || !playerController) {
        console.log('   ✗ Cannot test - missing required elements');
        return;
    }
    
    const testForce = 4.7;
    playerController.setForceMagnitude(testForce);
    
    // Check if UI manager updates the display
    if (window.game && window.game.uiManager && typeof window.game.uiManager.updateForceMagnitude === 'function') {
        window.game.uiManager.updateForceMagnitude(testForce);
        
        setTimeout(() => {
            const displayValue = parseFloat(elements.forceValue.textContent);
            const syncWorking = Math.abs(displayValue - testForce) < 0.1;
            console.log(`   UI synchronization: ${syncWorking ? '✓ Working' : '✗ Failed'} (Display: ${displayValue}, Expected: ${testForce})`);
        }, 100);
    } else {
        console.log('   ✗ UI Manager updateForceMagnitude method not found');
    }
}

// Run all tests
function runAllTests() {
    console.log('Starting comprehensive force control verification...\n');
    
    const elements = testForceControlElements();
    const playerController = testPlayerController();
    
    if (elements.forceSlider && playerController) {
        testForceControlInteractions(elements, playerController);
        testKeyboardShortcuts(playerController);
        testUISync(elements, playerController);
        
        console.log('\n=== VERIFICATION COMPLETE ===');
        console.log('If all tests show ✓, the force control system is working correctly!');
    } else {
        console.log('\n=== VERIFICATION FAILED ===');
        console.log('Core components are missing. Check the implementation.');
    }
}

// Export for manual testing
window.testForceControls = {
    runAllTests,
    testForceControlElements,
    testPlayerController,
    testForceControlInteractions,
    testKeyboardShortcuts,
    testUISync
};

// Auto-run tests after a short delay to allow game initialization
setTimeout(runAllTests, 2000);

console.log('Force control verification script loaded. Tests will run automatically in 2 seconds.');
console.log('You can also run individual tests manually using window.testForceControls.*');
