// jest.config.cjs
module.exports = {
    testEnvironment: "node",
    transform: {
      // wszystkie .js będą transformowane przez babel-jest
      "^.+\\.js$": "babel-jest"
    },
    moduleFileExtensions: ["js", "json"]
    // → USUŃ rozszerzenie extensionsToTreatAsEsm
  };
  