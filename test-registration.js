/**
 * 🧪 TEST REGISTRATION API
 * Use this file to test your registration endpoint with proper data
 */

// Test with minimal required fields
const testRegistrationMinimal = {
  name: "John Doe",
  email: "john.doe@example.com",
  password: "SecurePass123!"
};

// Test with complete data
const testRegistrationComplete = {
  name: "Jane Smith",
  email: "jane.smith@example.com", 
  password: "MySecure123!",
  age: 28,
  gender: "Female",
  height: 165,
  weight: 60,
  dietary_preferences: "vegan",
  health_goals: "lose_weight",
  activity_level: "moderate",
  allergies: ["nuts", "dairy"]
};

// Test with invalid data (should fail validation)
const testRegistrationInvalid = {
  name: "", // ❌ Empty name
  email: "invalid-email", // ❌ Invalid email format
  password: "123", // ❌ Too short, no special chars
  age: 10, // ❌ Too young
  weight: 5, // ❌ Too low
  height: 500, // ❌ Too high
  gender: "InvalidGender", // ❌ Not in enum
  dietary_preferences: "invalid_diet", // ❌ Not in enum
  allergies: "not_an_array" // ❌ Should be array
};

/**
 * 🔧 CURL COMMANDS FOR TESTING
 */

// Test minimal registration
const curlMinimal = `
curl -X POST http://localhost:3000/api/users/register \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testRegistrationMinimal)}'
`;

// Test complete registration  
const curlComplete = `
curl -X POST http://localhost:3000/api/users/register \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testRegistrationComplete)}'
`;

console.log("📋 TEST DATA FOR REGISTRATION API");
console.log("=================================");
console.log();
console.log("✅ MINIMAL VALID REQUEST:");
console.log(JSON.stringify(testRegistrationMinimal, null, 2));
console.log();
console.log("✅ COMPLETE VALID REQUEST:");
console.log(JSON.stringify(testRegistrationComplete, null, 2));
console.log();
console.log("❌ INVALID REQUEST (for testing validation):");
console.log(JSON.stringify(testRegistrationInvalid, null, 2));
console.log();
console.log("🔧 CURL COMMANDS:");
console.log("Minimal:", curlMinimal);
console.log();
console.log("Complete:", curlComplete);

/**
 * 🐛 DEBUGGING CHECKLIST
 * 
 * If you're getting validation errors, check:
 * 
 * 1. ✅ Request Content-Type is "application/json"
 * 2. ✅ Request body is valid JSON
 * 3. ✅ Required fields are provided: name, email, password
 * 4. ✅ Name: 2-100 characters, letters/spaces/hyphens/apostrophes only
 * 5. ✅ Email: valid email format
 * 6. ✅ Password: min 8 chars, 1 upper, 1 lower, 1 number, 1 special char
 * 7. ✅ Optional fields follow enum values (gender, dietary_preferences, etc.)
 * 8. ✅ Arrays are properly formatted (allergies)
 * 9. ✅ Numbers are within valid ranges (age: 13-120, weight: 30-300, height: 100-250)
 * 
 * Common issues:
 * - Sending empty strings ("") instead of omitting optional fields
 * - Wrong Content-Type header
 * - Invalid enum values
 * - Numbers as strings instead of actual numbers
 */

module.exports = {
  testRegistrationMinimal,
  testRegistrationComplete,
  testRegistrationInvalid
};