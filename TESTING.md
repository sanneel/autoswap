# Testing Guide

## Overview

This document outlines the testing strategy and procedures for the SwapRide project.

## Testing Stack

### Flutter (Mobile App)
- `flutter test` — Unit and widget tests
- `flutter analyze` — Static analysis
- Manual device testing on iOS/Android

### Next.js (Web Dashboard)
- TypeScript type checking via `tsc --noEmit`
- Build verification via `next build`
- Manual browser testing

## Running Tests

### Flutter App
```bash
# Install dependencies
flutter pub get

# Run all tests
flutter test

# Run with compact reporter
flutter test --reporter compact

# Run specific test file
flutter test test/widget_test.dart

# Run tests with coverage
flutter test --coverage
```

### Web Dashboard
```bash
cd autoswap-web

# Install dependencies
npm install

# Type check
npm run typecheck

# Build verification
npm run build

# Development server
npm run dev
```

## Linting

### Flutter
```bash
# Run static analysis
flutter analyze

# Apply auto-fixes
flutter analyze --fix
```

### Next.js
```bash
cd autoswap-web
npm run typecheck
```

## Test Categories

### Unit Tests
- Repository methods
- Utility functions
- Data transformations

### Widget Tests
- Individual widget rendering
- User interaction handling
- State changes

### Integration Tests
- Multi-screen flows
- Authentication flows
- Chat functionality

## CI Pipeline

See `.github/workflows/ci.yml` for automated testing on pull requests.

## Test Structure

### Flutter
```
test/
├── widget_test.dart        # Example widget test
└── [feature]/
    ├── [feature]_repository_test.dart
    └── [feature]_controller_test.dart
```

### Pattern for Flutter Tests
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:swapride/core/utils/result.dart';

void main() {
  group('Repository', () {
    test('should return success on valid data', () async {
      // Arrange
      final repository = MyRepository();
      
      // Act
      final result = await repository.fetchData();
      
      // Assert
      expect(result.isSuccess, true);
    });
  });
}
```

## Writing Tests

### Before Adding Features
1. Write tests that describe expected behavior
2. Run tests to verify they fail
3. Implement the feature
4. Run tests to verify they pass

### Test Naming
- Use descriptive names: `should_return_user_when_valid_id_provided`
- Group related tests in `group()` blocks
- One assertion concept per test

## Manual Testing Checklist

### Authentication
- [ ] Sign up with email
- [ ] Sign in with email
- [ ] Sign out
- [ ] Password reset flow

### Profile
- [ ] Onboarding flow completes
- [ ] Avatar upload works
- [ ] Profile edits save

### Cars
- [ ] Add car with photos
- [ ] Edit car details
- [ ] Delete car
- [ ] Set swap preferences

### Discovery
- [ ] Swipe interested works
- [ ] Swipe not interested works
- [ ] Pull to refresh works
- [ ] Empty state displays correctly

### Matching
- [ ] Mutual interest creates match
- [ ] Match appears in matches list
- [ ] Match updates in real-time

### Chat
- [ ] Send message works
- [ ] Messages appear in real-time
- [ ] Contact filter blocks contact info
- [ ] Paywall allows contact sharing

### Paywall
- [ ] RevenueCat SDK initializes
- [ ] Paywall screen displays
- [ ] Purchase unlocks contact
- [ ] Restore purchases works

## Debugging Failed Tests

1. Check test output for error message
2. Verify test data setup
3. Check for async timing issues
4. Verify mock/stub setup
5. Run test in isolation: `flutter test test/specific_test.dart`

## Coverage Goals

- Minimum: Repositories, utilities, core widgets
- Target: 80% for new features

## Known Limitations

- No integration tests currently
- No E2E tests
- Web testing is manual only