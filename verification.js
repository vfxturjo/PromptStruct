// Phase 2 Verification Script
// Run this in browser console to test functionality

console.log('🔍 Phase 2 Verification Starting...');

// Test 1: Check if React components are mounted
const reactRoot = document.getElementById('root');
if (reactRoot && reactRoot.children.length > 0) {
    console.log('✅ React app is mounted');
} else {
    console.log('❌ React app not mounted');
}

// Test 2: Check if drag-and-drop elements exist
const dragHandles = document.querySelectorAll('[data-rbd-drag-handle-draggable-id]');
if (dragHandles.length > 0) {
    console.log('✅ Drag handles found:', dragHandles.length);
} else {
    console.log('❌ No drag handles found');
}

// Test 3: Check if control panels exist
const controlPanels = document.querySelectorAll('[class*="space-y-3"]');
if (controlPanels.length > 0) {
    console.log('✅ Control panels found:', controlPanels.length);
} else {
    console.log('❌ No control panels found');
}

// Test 4: Check if preview panel exists
const previewPanel = document.querySelector('[class*="whitespace-pre-wrap"]');
if (previewPanel) {
    console.log('✅ Preview panel found');
} else {
    console.log('❌ No preview panel found');
}

// Test 5: Check for any console errors
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
        console.log('❌ Console errors detected:', errorCount);
    }
    console.error = originalError;
}, 1000);

console.log('🎯 Phase 2 Verification Complete!');
console.log('📝 Manual tests needed:');
console.log('  1. Try dragging elements');
console.log('  2. Edit element names and content');
console.log('  3. Interact with generated controls');
console.log('  4. Toggle elements on/off');
console.log('  5. Add new elements');
console.log('  6. Switch between Clean/Raw preview modes');
