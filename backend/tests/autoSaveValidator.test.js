// tests/autoSaveValidator.test.js
import { autoSaveValidator } from "../src/middleware/validators/users/post-autosave-vali";
describe("autoSaveValidator", () => {
  let req, res, next;
  const [
    levelValidator,
    deviceValidator,
    wordsValidator,
    patchValidator,
    errorHandler,
  ] = autoSaveValidator;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  // Helper to run all validation steps
  async function runValidation() {
    for (const v of [levelValidator, deviceValidator, wordsValidator, patchValidator]) {
      await v.run(req);
    }
    errorHandler(req, res, next);
  }

  // poprawny UUID v4
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";
  const validWord = { id: 1, boxName: "boxOne" };

  it("400 when level is missing", async () => {
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: expect.arrayContaining([
        { field: "level", message: "Level is required" },
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when level is invalid", async () => {
    req.body = {
      level: "A1",
      deviceId: validUuid,
      words: [validWord],
      patchNumber: 0,
    };
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          { field: "level", message: "Invalid level. Allowed values: B2, C1" },
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when deviceId is missing", async () => {
    req.body = {
      level: "B2",
      words: [validWord],
      patchNumber: 0,
    };
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: expect.arrayContaining([
        { field: "deviceId", message: "Device ID is required" },
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when deviceId is not a UUID v4", async () => {
    req.body = {
      level: "C1",
      deviceId: "not-a-uuid",
      words: [validWord],
      patchNumber: 0,
    };
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          { field: "deviceId", message: "Invalid device ID format. Expected UUID v4" },
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when words is missing", async () => {
    req.body = {
      level: "B2",
      deviceId: validUuid,
      patchNumber: 0,
    };
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: expect.arrayContaining([
        { field: "words", message: "Words array is required" },
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when words is not a non-empty array", async () => {
    req.body = {
      level: "C1",
      deviceId: validUuid,
      words: [],
      patchNumber: 0,
    };
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          { field: "words", message: "Words must be a non-empty array" },
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when a word item has invalid id", async () => {
    req.body = {
      level: "B2",
      deviceId: validUuid,
      words: [{ id: 0, boxName: "boxOne" }],
      patchNumber: 0,
    };
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          { field: "words", message: "Invalid word ID. Must be a positive number" },
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when a word item has invalid boxName", async () => {
    req.body = {
      level: "C1",
      deviceId: validUuid,
      words: [{ id: 1, boxName: "invalidBox" }],
      patchNumber: 0,
    };
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          {
            field: "words",
            message:
              "Invalid boxName. Allowed values: boxOne, boxTwo, boxThree, boxFour, boxFive",
          },
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when patchNumber is missing", async () => {
    req.body = {
      level: "B2",
      deviceId: validUuid,
      words: [validWord],
    };
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: expect.arrayContaining([
        { field: "patchNumber", message: "Patch number is required" },
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("400 when patchNumber is negative", async () => {
    req.body = {
      level: "C1",
      deviceId: validUuid,
      words: [validWord],
      patchNumber: -1,
    };
    await runValidation();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          { field: "patchNumber", message: "Patch number must be a non-negative integer" },
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when all fields are valid", async () => {
    req.body = {
      level: "B2",
      deviceId: validUuid,
      words: [{ id: 2, boxName: "boxThree" }],
      patchNumber: 5,
    };
    await runValidation();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
