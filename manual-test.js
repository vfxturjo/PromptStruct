// 🔍 Phase 2 Manual Test Script
// Copy and paste this into browser console at http://localhost:5173

console.log('🚀 Starting Phase 2 Manual Tests...');

// Test 1: Check if React app is mounted
function testReactMount() {
    console.log('\n📱 Test 1: React App Mount');
    const reactRoot = document.getElementById('root');
    if (reactRoot && reactRoot.children.length > 0) {
        console.log('✅ React app is mounted');
        return true;
    } else {
        console.log('❌ React app not mounted');
        return false;
    }
}

// Test 2: Check structural elements
function testStructuralElements() {
    console.log('\n🏗️ Test 2: Structural Elements');
    const elements = document.querySelectorAll('[class*="mb-4"]');
    if (elements.length >= 4) {
        console.log(`✅ Found ${elements.length} structural elements`);
        return true;
    } else {
        console.log(`❌ Expected at least 4 elements, found ${elements.length}`);
        return false;
    }
}

// Test 3: Check drag handles
function testDragHandles() {
    console.log('\n🎯 Test 3: Drag Handles');
    const dragHandles = document.querySelectorAll('[class*="cursor-grab"]');
    if (dragHandles.length >= 4) {
        console.log(`✅ Found ${dragHandles.length} drag handles`);
        return true;
    } else {
        console.log(`❌ Expected at least 4 drag handles, found ${dragHandles.length}`);
        return false;
    }
}

// Test 4: Check control panels
function testControlPanels() {
    console.log('\n🎛️ Test 4: Control Panels');
    const controlPanels = document.querySelectorAll('[class*="space-y-3"]');
    if (controlPanels.length >= 2) {
        console.log(`✅ Found ${controlPanels.length} control panels`);
        return true;
    } else {
        console.log(`❌ Expected at least 2 control panels, found ${controlPanels.length}`);
        return false;
    }
}

// Test 5: Check preview panel
function testPreviewPanel() {
    console.log('\n👁️ Test 5: Preview Panel');
    const previewPanel = document.querySelector('[class*="whitespace-pre-wrap"]');
    if (previewPanel) {
        console.log('✅ Preview panel found');
        return true;
    } else {
        console.log('❌ No preview panel found');
        return false;
    }
}

// Test 6: Check toggle buttons
function testToggleButtons() {
    console.log('\n🔄 Test 6: Toggle Buttons');
    const toggleButtons = document.querySelectorAll('button');
    const onOffButtons = Array.from(toggleButtons).filter(btn =>
        btn.textContent === 'On' || btn.textContent === 'Off'
    );
    if (onOffButtons.length >= 4) {
        console.log(`✅ Found ${onOffButtons.length} toggle buttons`);
        return true;
    } else {
        console.log(`❌ Expected at least 4 toggle buttons, found ${onOffButtons.length}`);
        return false;
    }
}

// Test 7: Check add element button
function testAddElementButton() {
    console.log('\n➕ Test 7: Add Element Button');
    const addButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Add Element')
    );
    if (addButton) {
        console.log('✅ Add Element button found');
        return true;
    } else {
        console.log('❌ Add Element button not found');
        return false;
    }
}

// Test 8: Check preview mode buttons
function testPreviewModeButtons() {
    console.log('\n🔄 Test 8: Preview Mode Buttons');
    const cleanButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent === 'Clean'
    );
    const rawButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent === 'Raw'
    );
    if (cleanButton && rawButton) {
        console.log('✅ Preview mode buttons found');
        return true;
    } else {
        console.log('❌ Preview mode buttons not found');
        return false;
    }
}

// Test 9: Check for console errors
function testConsoleErrors() {
    console.log('\n🚨 Test 9: Console Errors');
    const originalError = console.error;
    let errorCount = 0;
    console.error = function (...args) {
        errorCount++;
        originalError.apply(console, args);
    };

    setTimeout(() => {
        if (errorCount === 0) {
            console.log('✅ No console errors detected');
        } else {
            console.log(`❌ ${errorCount} console errors detected`);
        }
        console.error = originalError;
    }, 1000);
}

// Test 10: Interactive Tests
function testInteractiveFeatures() {
    console.log('\n🎮 Test 10: Interactive Features');
    console.log('📝 Manual tests to perform:');
    console.log('   1. Try dragging elements by grip handles');
    console.log('   2. Click on element names to edit them');
    console.log('   3. Edit content in textareas');
    console.log('   4. Interact with generated controls');
    console.log('   5. Toggle elements on/off');
    console.log('   6. Click "Add Element" button');
    console.log('   7. Switch between Clean/Raw preview modes');
    console.log('   8. Check if preview updates in real-time');
}

// Run all tests
function runAllTests() {
    const tests = [
        testReactMount,
        testStructuralElements,
        testDragHandles,
        testControlPanels,
        testPreviewPanel,
        testToggleButtons,
        testAddElementButton,
        testPreviewModeButtons,
        testConsoleErrors,
        testInteractiveFeatures
    ];

    let passedTests = 0;
    tests.forEach((test, index) => {
        try {
            const result = test();
            if (result !== false) passedTests++;
        } catch (error) {
            console.log(`❌ Test ${index + 1} failed with error:`, error);
        }
    });

    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${passedTests}/${tests.length} tests`);
    console.log(`❌ Failed: ${tests.length - passedTests}/${tests.length} tests`);

    if (passedTests === tests.length - 1) { // -1 because interactive test doesn't return a value
        console.log('🎉 All automated tests passed! Phase 2 is working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Please check the issues above.');
    }
}

// Start the tests
runAllTests();
