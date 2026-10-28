import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["ADMIN", "INSTRUCTOR", "STUDENT"],
      default: "STUDENT",
    },
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
    active: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 },
    activationTokenHash: { type: String, select: false },
    activationExpiresAt: { type: Date, select: false },
    educationLevel: {
      type: String,
      enum: ["primary", "secondary", "college", "adult"],
      default: "secondary",
    },
  },
  { timestamps: true }
);

const institutionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    type: { type: String, enum: ["school", "college", "other"], default: "school" },
    country: { type: String, default: "India" },
    state: { type: String, trim: true, maxlength: 80 },
    district: { type: String, trim: true, maxlength: 80 },
    city: { type: String, trim: true, maxlength: 80 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const lessonProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    moduleId: { type: String, required: true },
    completedLessons: { type: [String], default: [] },
    quizScore: { type: Number, min: 0, max: 100 },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
lessonProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

const checklistSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    items: [{ label: { type: String, required: true }, done: { type: Boolean, default: false } }],
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
checklistSchema.index({ institutionId: 1, category: 1 });

const drillSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
    title: { type: String, required: true, maxlength: 160 },
    type: {
      type: String,
      enum: ["evacuation", "earthquake", "fire", "weather", "other"],
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: ["planned", "completed", "cancelled"], default: "planned" },
    objectives: { type: String, maxlength: 2000 },
    debrief: { type: String, maxlength: 4000 },
    participantCount: { type: Number, min: 0, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
drillSchema.index({ institutionId: 1, scheduledAt: -1 });

const simulationAttemptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scenarioId: { type: String, required: true },
    score: { type: Number, min: 0, max: 100, required: true },
    answers: [{ stepId: String, choiceId: String, correct: Boolean }],
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
simulationAttemptSchema.index({ userId: 1, completedAt: -1 });

const quizSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: "", maxlength: 2000 },
    topic: { type: String, required: true, trim: true, maxlength: 80 },
    educationLevel: {
      type: String,
      enum: ["primary", "secondary", "college", "adult"],
      required: true,
    },
    timeLimitMinutes: { type: Number, min: 0, max: 240, default: 0 },
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: Date,
    questions: [
      {
        prompt: { type: String, required: true, trim: true, maxlength: 1000 },
        choices: [
          {
            id: { type: String, required: true },
            text: { type: String, required: true, trim: true, maxlength: 300 },
          },
        ],
        correctChoiceId: { type: String, required: true, select: false },
        explanation: { type: String, default: "", maxlength: 1000, select: false },
      },
    ],
  },
  { timestamps: true }
);
quizSchema.index({ institutionId: 1, status: 1, createdAt: -1 });
quizSchema.index({ createdBy: 1, updatedAt: -1 });

const quizAttemptSchema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    correct: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },
    answers: [{ questionId: String, choiceId: String, correct: Boolean }],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
quizAttemptSchema.index({ quizId: 1, institutionId: 1, submittedAt: -1 });
quizAttemptSchema.index({ userId: 1, quizId: 1, submittedAt: -1 });

export const User = model("User", userSchema);
export const Institution = model("Institution", institutionSchema);
export const LessonProgress = model("LessonProgress", lessonProgressSchema);
export const Checklist = model("Checklist", checklistSchema);
export const Drill = model("Drill", drillSchema);
export const SimulationAttempt = model("SimulationAttempt", simulationAttemptSchema);
export const Quiz = model("Quiz", quizSchema);
export const QuizAttempt = model("QuizAttempt", quizAttemptSchema);

const auditEventSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true, maxlength: 80 },
    changes: { type: Schema.Types.Mixed, default: {} },
    reason: { type: String, maxlength: 500 },
    correlationId: { type: String, maxlength: 100 },
  },
  { timestamps: true, strict: true }
);
auditEventSchema.index({ createdAt: -1 });
auditEventSchema.index({ targetId: 1, createdAt: -1 });
export const AuditEvent = model("AuditEvent", auditEventSchema);

const personalChecklistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        done: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);
export const PersonalChecklist = model("PersonalChecklist", personalChecklistSchema);
