# Add tests for [module/component]

## Overview
We need to add comprehensive tests for the `[module/component]` to ensure its functionality behaves as expected and remains stable during future development.

## Tasks
- [ ] Create test file(s) following the `{filename}.spec.ts` naming convention
- [ ] Write tests covering core functionality and public API
- [ ] Test input validation and error handling scenarios
- [ ] Ensure edge cases and boundary values are covered
- [ ] Test async functions with proper awaiting and error catching
- [ ] Add descriptive test names that document expected behavior
- [ ] Verify all tests pass with `bun test`
- [ ] Confirm test coverage meets project standards

## Implementation Details
- Use the project's existing test runner and assertion patterns
- Group related tests using `describe` blocks for better organization
- Write clear test descriptions that document expected behavior
- Mock external dependencies to create isolated unit tests
- For files with side effects, use proper mocking/spy techniques
- Use parameterized tests for testing similar behavior with different inputs
- Follow the pattern established in existing tests like `src/utils/fs.spec.ts`
- **Location**: Place test files in the same directory as the file being tested
  - Example: Tests for `src/config/loader.ts` should be in `src/config/loader.spec.ts`
- **Coverage**: Test coverage is already enabled in the project configuration
  - Run `bun test` to automatically generate coverage reports
- **Mocking**:
  - Use appropriate mocking techniques for external dependencies
  - Mock filesystem operations, network requests, and other side effects

## Test Focus Areas
- **Core Functionality**: Test the primary functions and their expected outputs
- **Input Validation**: Verify behavior with valid, invalid, and edge case inputs
- **Output Verification**: Assert that function outputs match expected results
- **Error Handling**: Confirm that errors are properly caught and handled
- **Boundary Testing**: Test minimum/maximum values and boundary conditions
  - Empty arrays/strings/objects
  - Minimum and maximum valid values
  - Values just inside and outside valid ranges
- **Async Behavior**: For async functions, test:
  - Successful resolution paths
  - Error rejection paths
  - Proper error propagation
  - Timeout handling (if applicable)

