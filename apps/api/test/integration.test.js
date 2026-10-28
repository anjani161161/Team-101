import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import app from "../src/app.js";
import { AuditEvent, User } from "../src/models/index.js";
import { disasterTopics } from "../src/data/disaster-learning.js";

test(
  "admin, instructor and student permissions are enforced with tenant scoping and audit logs",
  { skip: !process.env.MONGODB_TEST_URI },
  async () => {
    process.env.SESSION_SECRET ||= "integration-test-session-secret-with-more-than-32-characters";
    const uri = new URL(process.env.MONGODB_TEST_URI);
    uri.pathname = `/atmoswatch_test_${randomUUID().replaceAll("-", "")}`;
    await mongoose.connect(uri.toString());
    const server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    async function request(path, { method = "GET", cookie, body } = {}) {
      const response = await fetch(`${origin}/api/v1${path}`, {
        method,
        headers: {
          Origin: "http://localhost:5173",
          ...(cookie ? { cookie } : {}),
          ...(body ? { "content-type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      return {
        response,
        data: response.status === 204 ? null : await response.json(),
        cookie: response.headers.getSetCookie?.()[0]?.split(";")[0],
      };
    }
    async function login(email, password) {
      const result = await request("/auth/login", { method: "POST", body: { email, password } });
      assert.equal(result.response.status, 200);
      return result.cookie;
    }
    try {
      const adminPassword = "Admin-test-password-very-long-1";
      await User.create({
        name: "Test Admin",
        email: "admin@example.test",
        role: "ADMIN",
        active: true,
        passwordHash: await bcrypt.hash(adminPassword, 4),
      });
      const adminCookie = await login("admin@example.test", adminPassword);
      const adminCurrentUser = await request("/auth/me", { cookie: adminCookie });
      assert.equal(adminCurrentUser.data.user.role, "ADMIN");
      const wrongPassword = await request("/auth/login", {
        method: "POST",
        body: { email: "admin@example.test", password: "incorrect-test-password" },
      });
      assert.equal(wrongPassword.response.status, 401);
      const noAdminCreate = await request("/users", {
        method: "POST",
        cookie: undefined,
        body: { name: "No Auth", email: "noauth@example.test", role: "ADMIN" },
      });
      assert.equal(noAdminCreate.response.status, 401);
      const createdInstitution = await request("/preparedness/institutions", {
        method: "POST",
        cookie: adminCookie,
        body: { name: "North Campus", type: "school" },
      });
      assert.equal(createdInstitution.response.status, 201);
      const institutionId = createdInstitution.data.item._id;
      const instructorCreate = await request("/users", {
        method: "POST",
        cookie: adminCookie,
        body: {
          name: "Instructor One",
          email: "instructor@example.test",
          role: "INSTRUCTOR",
          institutionId,
        },
      });
      assert.equal(instructorCreate.response.status, 201);
      assert.equal(instructorCreate.data.item.active, false);
      assert.equal("passwordHash" in instructorCreate.data.item, false);
      assert.ok(instructorCreate.data.activationToken);
      const activeInstructor = await request("/auth/activate", {
        method: "POST",
        body: {
          token: instructorCreate.data.activationToken,
          password: "Instructor-test-password-1",
        },
      });
      assert.equal(activeInstructor.response.status, 200);
      const replay = await request("/auth/activate", {
        method: "POST",
        body: {
          token: instructorCreate.data.activationToken,
          password: "Instructor-test-password-2",
        },
      });
      assert.equal(replay.response.status, 400);
      const instructorCookie = await login("instructor@example.test", "Instructor-test-password-1");
      const instructorCurrentUser = await request("/auth/me", { cookie: instructorCookie });
      assert.equal(instructorCurrentUser.data.user.role, "INSTRUCTOR");
      assert.equal(String(instructorCurrentUser.data.user.institutionId), String(institutionId));

      const deniedAdmin = await request("/users", {
        method: "POST",
        cookie: instructorCookie,
        body: { name: "Escalation", email: "escalate@example.test", role: "ADMIN" },
      });
      assert.equal(deniedAdmin.response.status, 403);
      const forgedInstitution = await request("/users", {
        method: "POST",
        cookie: instructorCookie,
        body: {
          name: "Wrong Campus",
          email: "wrong@example.test",
          role: "STUDENT",
          institutionId: new mongoose.Types.ObjectId().toString(),
        },
      });
      assert.equal(forgedInstitution.response.status, 403);
      const studentCreate = await request("/users", {
        method: "POST",
        cookie: instructorCookie,
        body: { name: "Student One", email: "student@example.test", role: "STUDENT" },
      });
      assert.equal(studentCreate.response.status, 201);
      assert.equal(String(studentCreate.data.item.institutionId), String(institutionId));
      const duplicate = await request("/users", {
        method: "POST",
        cookie: adminCookie,
        body: { name: "Duplicate", email: "STUDENT@example.test", role: "STUDENT" },
      });
      assert.equal(duplicate.response.status, 409);
      const checklist = await request("/preparedness/checklists", {
        method: "POST",
        cookie: instructorCookie,
        body: {
          title: "Scope checklist",
          category: "core",
          items: [{ label: "Review exits", done: false }],
        },
      });
      assert.equal(checklist.response.status, 201);
      const studentCookie = (
        await request("/auth/activate", {
          method: "POST",
          body: {
            token: studentCreate.data.activationToken,
            password: "Student-test-password-123",
          },
        })
      ).cookie;
      assert.ok(studentCookie);
      const quizDraft = await request("/learning/quizzes", {
        method: "POST",
        cookie: instructorCookie,
        body: {
          title: "Campus earthquake response",
          description: "Check response basics.",
          topic: "Earthquake",
          educationLevel: "secondary",
          questions: [
            {
              prompt: "What should you do during indoor shaking?",
              choices: [
                { id: "cover", text: "Drop, cover, and hold on" },
                { id: "run", text: "Run to the stairs" },
              ],
              correctChoiceId: "cover",
              explanation: "Protect your head and stay away from glass.",
            },
            {
              prompt: "Who provides the official response instructions?",
              choices: [
                { id: "official", text: "Local authorities and the site plan" },
                { id: "rumor", text: "Unverified social posts" },
              ],
              correctChoiceId: "official",
              explanation: "Follow authorized local guidance.",
            },
          ],
        },
      });
      assert.equal(quizDraft.response.status, 201);
      assert.equal(quizDraft.data.item.status, "draft");
      const hiddenDraft = await request(`/learning/quizzes/${quizDraft.data.item.id}`, {
        cookie: studentCookie,
      });
      assert.equal(hiddenDraft.response.status, 404);
      const publishedQuiz = await request(`/learning/quizzes/${quizDraft.data.item.id}/publish`, {
        method: "POST",
        cookie: instructorCookie,
      });
      assert.equal(publishedQuiz.data.item.status, "published");
      const availableQuizzes = await request("/learning/quizzes", { cookie: studentCookie });
      assert.equal(availableQuizzes.data.items.length, 1);
      assert.equal("correctChoiceId" in availableQuizzes.data.items[0].questions[0], false);
      const quizQuestions = availableQuizzes.data.items[0].questions;
      const quizAttempt = await request(`/learning/quizzes/${quizDraft.data.item.id}/attempts`, {
        method: "POST",
        cookie: studentCookie,
        body: {
          answers: [
            { questionId: quizQuestions[0].id, choiceId: "cover" },
            { questionId: quizQuestions[1].id, choiceId: "rumor" },
          ],
        },
      });
      assert.equal(quizAttempt.data.item.score, 50);
      const quizResults = await request(`/learning/quizzes/${quizDraft.data.item.id}/results`, {
        cookie: instructorCookie,
      });
      assert.equal(quizResults.data.items.length, 1);
      assert.equal(quizResults.data.items[0].score, 50);
      const ownStudents = await request("/users?role=STUDENT", { cookie: instructorCookie });
      assert.equal(ownStudents.data.total, 1);
      assert.equal(ownStudents.data.items[0].email, "student@example.test");
      const classSummary = await request("/users/progress-summary", { cookie: instructorCookie });
      assert.equal(classSummary.response.status, 200);
      assert.equal(classSummary.data.studentCount, 1);
      const anonymousDisasterHub = await request("/learning/disasters");
      assert.equal(anonymousDisasterHub.response.status, 401);
      for (const cookie of [adminCookie, instructorCookie, studentCookie]) {
        const disasterHub = await request("/learning/disasters", { cookie });
        assert.equal(disasterHub.response.status, 200);
        assert.equal(disasterHub.data.items.length, 14);
      }
      const studentTopic = await request("/learning/disasters/earthquake", {
        cookie: studentCookie,
      });
      assert.equal(studentTopic.response.status, 200);
      assert.equal("answer" in studentTopic.data.item.quiz, false);
      assert.equal("answer" in studentTopic.data.item.scenarios[0].checkpoint, false);
      const animationCatalog = await request("/learning/disasters/earthquake/videos", {
        cookie: studentCookie,
      });
      assert.equal(animationCatalog.data.items.length, 5);
      assert.ok(animationCatalog.data.items.every((item) => item.type === "ANIMATED_SCENARIO"));
      const scenarioId = animationCatalog.data.items[0].id;
      const scenarioCheckpoint = await request(
        `/learning/disasters/earthquake/scenarios/${scenarioId}/checkpoint`,
        {
          method: "POST",
          cookie: studentCookie,
          body: { choiceId: disasterTopics[0].quiz.answer },
        }
      );
      assert.equal(scenarioCheckpoint.data.completed, true);
      const savedDisasterProgress = await request("/learning/progress", { cookie: studentCookie });
      assert.ok(
        savedDisasterProgress.data.items
          .find((item) => item.moduleId === "disaster-earthquake")
          .completedLessons.includes(`scenario:${scenarioId}`)
      );
      const studentTopicQuiz = await request("/learning/disasters/earthquake/quiz", {
        method: "POST",
        cookie: studentCookie,
        body: { choiceId: disasterTopics[0].quiz.answer },
      });
      assert.equal(studentTopicQuiz.data.score, 100);
      assert.equal((await request("/learning/disasters")).response.status, 401);
      const publicSourceStatus = await request("/public/disaster-sources/status");
      assert.equal(publicSourceStatus.response.status, 200);
      assert.equal("userId" in publicSourceStatus.data, false);
      const instructorRoleFilter = await request("/users?role=ADMIN", { cookie: instructorCookie });
      assert.equal(instructorRoleFilter.response.status, 403);
      const studentAdminList = await request("/users", { cookie: studentCookie });
      assert.equal(studentAdminList.response.status, 403);
      const studentPrivilegedCreate = await request("/users", {
        method: "POST",
        cookie: studentCookie,
        body: { name: "Bad", email: "bad@example.test", role: "ADMIN" },
      });
      assert.equal(studentPrivilegedCreate.response.status, 403);
      const studentRoleChange = await request(`/users/${studentCreate.data.item.id}`, {
        method: "PATCH",
        cookie: studentCookie,
        body: { role: "ADMIN" },
      });
      assert.equal(studentRoleChange.response.status, 403);
      const studentInstitutionChange = await request(`/users/${studentCreate.data.item.id}`, {
        method: "PATCH",
        cookie: studentCookie,
        body: { institutionId: new mongoose.Types.ObjectId().toString() },
      });
      assert.equal(studentInstitutionChange.response.status, 403);
      const studentChecklistWrite = await request("/preparedness/checklists", {
        method: "POST",
        cookie: studentCookie,
        body: { title: "Unauthorized", category: "core", items: [] },
      });
      assert.equal(studentChecklistWrite.response.status, 403);
      const personalChecklist = await request("/preparedness/personal-checklist", {
        cookie: studentCookie,
      });
      assert.equal(personalChecklist.response.status, 200);
      assert.equal(personalChecklist.data.item.items.length, 5);
      const updatedPersonalChecklist = await request("/preparedness/personal-checklist", {
        method: "PATCH",
        cookie: studentCookie,
        body: {
          items: personalChecklist.data.item.items.map((item, index) => ({
            id: item.id,
            done: index === 0,
          })),
        },
      });
      assert.equal(updatedPersonalChecklist.data.item.items[0].done, true);
      const instructorPrivateChecklist = await request("/preparedness/personal-checklist", {
        cookie: instructorCookie,
      });
      assert.equal(instructorPrivateChecklist.response.status, 403);
      const roleChanged = await request(`/users/${studentCreate.data.item.id}`, {
        method: "PATCH",
        cookie: adminCookie,
        body: { role: "INSTRUCTOR" },
      });
      assert.equal(roleChanged.data.item.role, "INSTRUCTOR");
      const revokedSession = await request("/auth/me", { cookie: studentCookie });
      assert.equal(revokedSession.response.status, 401);
      const deactivated = await request(`/users/${studentCreate.data.item.id}`, {
        method: "PATCH",
        cookie: adminCookie,
        body: { role: "STUDENT", active: false },
      });
      assert.equal(deactivated.data.item.active, false);
      const reactivated = await request(`/users/${studentCreate.data.item.id}`, {
        method: "PATCH",
        cookie: adminCookie,
        body: { active: true },
      });
      assert.equal(reactivated.data.item.active, true);
      assert.ok(await login("student@example.test", "Student-test-password-123"));

      const secondInstitution = await request("/preparedness/institutions", {
        method: "POST",
        cookie: adminCookie,
        body: { name: "South Campus", type: "college" },
      });
      const forgedChecklist = await request("/preparedness/checklists", {
        method: "POST",
        cookie: instructorCookie,
        body: {
          title: "Wrong tenant",
          category: "core",
          items: [],
          institutionId: secondInstitution.data.item._id,
        },
      });
      assert.equal(forgedChecklist.response.status, 403);
      const allChecklists = await request("/preparedness/checklists", { cookie: adminCookie });
      assert.ok(allChecklists.data.items.some((item) => item._id === checklist.data.item._id));
      const outsider = await request("/users", {
        method: "POST",
        cookie: adminCookie,
        body: {
          name: "Other Student",
          email: "other@example.test",
          role: "STUDENT",
          institutionId: secondInstitution.data.item._id,
        },
      });
      const outsiderSession = await request("/auth/activate", {
        method: "POST",
        body: {
          token: outsider.data.activationToken,
          password: "Outsider-test-password-123",
        },
      });
      const crossInstitutionQuizzes = await request("/learning/quizzes", {
        cookie: outsiderSession.cookie,
      });
      assert.equal(crossInstitutionQuizzes.data.items.length, 0);
      const crossInstitutionQuiz = await request(`/learning/quizzes/${quizDraft.data.item.id}`, {
        cookie: outsiderSession.cookie,
      });
      assert.equal(crossInstitutionQuiz.response.status, 404);
      const crossScope = await request(`/users/${outsider.data.item.id}`, {
        method: "PATCH",
        cookie: instructorCookie,
        body: { name: "Tampered" },
      });
      assert.equal(crossScope.response.status, 404);
      const finalAdmin = await request(
        `/users/${(await User.findOne({ email: "admin@example.test" })).id}`,
        { method: "PATCH", cookie: adminCookie, body: { active: false } }
      );
      assert.equal(finalAdmin.response.status, 409);
      const audit = await request("/users/audit", { cookie: adminCookie });
      assert.equal(audit.response.status, 200);
      assert.ok(audit.data.total >= 3);
      assert.ok(await AuditEvent.exists({ action: "user.created" }));
      const analytics = await request("/users/analytics", { cookie: adminCookie });
      assert.equal(analytics.response.status, 200);
      assert.equal(analytics.data.institutions, 2);
      assert.equal(analytics.data.checklists, 1);
      assert.ok(analytics.data.userCounts.some((row) => row._id.role === "INSTRUCTOR"));

      const publicSignup = await request("/auth/register", {
        method: "POST",
        body: {
          name: "Public Student",
          email: "public@example.test",
          password: "Public-test-password-123",
          role: "ADMIN",
        },
      });
      assert.equal(publicSignup.response.status, 400);
      const normalSignup = await request("/auth/register", {
        method: "POST",
        body: {
          name: "Public Student",
          email: "public@example.test",
          password: "Public-test-password-123",
        },
      });
      assert.equal(normalSignup.response.status, 201);
      assert.equal(normalSignup.data.user.role, "STUDENT");
      const registeredCurrentUser = await request("/auth/me", { cookie: normalSignup.cookie });
      assert.equal(registeredCurrentUser.data.user.role, "STUDENT");
      const loggedOut = await request("/auth/logout", {
        method: "POST",
        cookie: normalSignup.cookie,
      });
      assert.equal(loggedOut.response.status, 204);
      const invalidatedByLogout = await request("/auth/me", { cookie: normalSignup.cookie });
      assert.equal(invalidatedByLogout.response.status, 401);
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  }
);
