import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import topLevelAwait from "vite-plugin-top-level-await";
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(), topLevelAwait()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: '@root-entry-name: default;',
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build:{
    rollupOptions:{
      input:{
        entry: path.resolve(__dirname, "index.html"),
        login: path.resolve(__dirname, "login.html"),
        examList: path.resolve(__dirname, "exam-list.html"),
        examRank: path.resolve(__dirname, "exam-rank.html"),
        examSubmission: path.resolve(__dirname, "exam-submission.html"),
        exam: path.resolve(__dirname, "exam.html"),
        problemList: path.resolve(__dirname, "problem-list.html"),
        problem: path.resolve(__dirname, "problem.html"),
        rank: path.resolve(__dirname, "rank.html"),
        setting: path.resolve(__dirname, "setting.html"),
        submissionList: path.resolve(__dirname, "submission-list.html"),
        submission: path.resolve(__dirname, "submission.html"),
        about: path.resolve(__dirname, "about.html"),
        homework: path.resolve(__dirname, "homework.html"),
        homeworkList: path.resolve(__dirname, "homework-list.html"),
        userInfo: path.resolve(__dirname, "user-info.html"),

        adminCourseList: path.resolve(__dirname, "admin/course-list.html"),
        adminExamList: path.resolve(__dirname, "admin/exam-list.html"),
        adminExam: path.resolve(__dirname, "admin/exam.html"),
        adminEntry: path.resolve(__dirname, "admin/index.html"),
        adminLogin: path.resolve(__dirname, "admin/login.html"),
        adminProblemList: path.resolve(__dirname, "admin/problem-list.html"),
        adminProblem: path.resolve(__dirname, "admin/problem.html"),
        adminTagList: path.resolve(__dirname, "admin/tag-list.html"),
        adminUserList: path.resolve(__dirname, "admin/user-list.html"),
        adminHomeworkList: path.resolve(__dirname, "admin/homework-list.html"),
        adminHomework: path.resolve(__dirname, "admin/homework.html"),
      }
    }
  },
})
