/**
 * Main entry point — wires up sidebar, toolbar, and lesson loading.
 */

import { LessonRunner } from './engine/LessonRunner.js';
import { lesson_1_4 } from './lessons/lesson_1_4.js';
import { lesson_2_1 } from './lessons/lesson_2_1.js';
import { lesson_2_4 } from './lessons/lesson_2_4.js';
import { lesson_3_1 } from './lessons/lesson_3_1.js';
import { lesson_3_2 } from './lessons/lesson_3_2.js';
import { lesson_4_1 } from './lessons/lesson_4_1.js';
import { lesson_4_2 } from './lessons/lesson_4_2.js';

// Lesson registry
const lessons = {
  '1.4': lesson_1_4,
  '2.1': lesson_2_1,
  '2.4': lesson_2_4,
  '3.1': lesson_3_1,
  '3.2': lesson_3_2,
  '4.1': lesson_4_1,
  '4.2': lesson_4_2,
};

// Init runner
const container = document.getElementById('lessonContainer');
const toolbar = document.querySelector('.toolbar');
const runner = new LessonRunner(container, toolbar);

// Load the active lesson from TOC (or fall back to 1.4)
const activeItem = document.querySelector('.toc-item.active');
const defaultKey = activeItem?.dataset?.lesson || '1.4';
try {
  runner.loadLesson(lessons[defaultKey] || lessons['1.4']);
} catch (err) {
  console.error('Failed to load default lesson:', err);
  document.querySelector('.status').textContent = 'Error loading lesson — check console';
}

// TOC navigation
document.querySelectorAll('.toc-item').forEach(item => {
  item.addEventListener('click', () => {
    const key = item.dataset.lesson;
    if (lessons[key]) {
      // Update active TOC
      document.querySelectorAll('.toc-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      runner.loadLesson(lessons[key]);
    } else {
      document.querySelector('.status').textContent = `Lesson ${key} not built yet`;
    }
  });
});
