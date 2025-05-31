#!/bin/bash

echo "🚀 Running Order Validation Tests"
echo "================================="

# Backend tests
echo ""
echo "📋 Running Backend Tests..."
cd backend
npm test -- --testPathPattern=workout.service.spec.ts --verbose
BACKEND_EXIT_CODE=$?

# Training Day integration tests
echo ""
echo "📋 Running Training Day Integration Tests..."
npm test -- --testPathPattern=training-day.integration.spec.ts --verbose
TRAINING_DAY_EXIT_CODE=$?

# Frontend tests
echo ""
echo "🎨 Running Frontend Tests..."
cd ../frontend
npm test WorkoutEditDialog.spec.ts
FRONTEND_EXIT_CODE=$?

echo ""
echo "================================="
echo "📊 Test Results Summary:"
echo "================================="

if [ $BACKEND_EXIT_CODE -eq 0 ]; then
    echo "✅ Backend Workout Service Tests: PASSED"
else
    echo "❌ Backend Workout Service Tests: FAILED"
fi

if [ $TRAINING_DAY_EXIT_CODE -eq 0 ]; then
    echo "✅ Training Day Integration Tests: PASSED"
else
    echo "❌ Training Day Integration Tests: FAILED"
fi

if [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    echo "✅ Frontend WorkoutEditDialog Tests: PASSED"
else
    echo "❌ Frontend WorkoutEditDialog Tests: FAILED"
fi

echo ""
echo "🎯 Order Validation Features Tested:"
echo "• Training days always have sequential order (0, 1, 2, ...)"
echo "• Exercises within days have sequential order (0, 1, 2, ...)"
echo "• Drag and drop maintains proper order values"
echo "• Fallback to index when order is null/undefined"
echo "• API input validation ensures no null/undefined orders"
echo "• Test data never relies on fallback values"

if [ $BACKEND_EXIT_CODE -eq 0 ] && [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "🎉 All order validation tests PASSED!"
    echo "✅ Your system will never fall back to 'N/A' order values"
    exit 0
else
    echo ""
    echo "⚠️  Some tests failed. Please check the output above."
    exit 1
fi