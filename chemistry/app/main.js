/**
 * Main entry point — wires up sidebar, toolbar, lesson loading, and persistence.
 */

import { LessonRunner } from './engine/LessonRunner.js';
import { lesson_1_4 } from './lessons/lesson_1_4.js';
import { lesson_2_1 } from './lessons/lesson_2_1.js';
import { lesson_2_4 } from './lessons/lesson_2_4.js';
import { lesson_3_1 } from './lessons/lesson_3_1.js';
import { lesson_3_2 } from './lessons/lesson_3_2.js';
import { lesson_4_1 } from './lessons/lesson_4_1.js';
import { lesson_4_2 } from './lessons/lesson_4_2.js';
import { lesson_4_3 } from './lessons/lesson_4_3.js';
import { lesson_4_4 } from './lessons/lesson_4_4.js';
import { lesson_5_1 } from './lessons/lesson_5_1.js';
import { lesson_5_2 } from './lessons/lesson_5_2.js';
import { lesson_5_3 } from './lessons/lesson_5_3.js';
import { lesson_5_4 } from './lessons/lesson_5_4.js';
import { lesson_6_1 } from './lessons/lesson_6_1.js';
import { lesson_6_2 } from './lessons/lesson_6_2.js';
import { lesson_6_3 } from './lessons/lesson_6_3.js';

// Lesson registry
const lessons = {
  '1.4': lesson_1_4,
  '2.1': lesson_2_1,
  '2.4': lesson_2_4,
  '3.1': lesson_3_1,
  '3.2': lesson_3_2,
  '4.1': lesson_4_1,
  '4.2': lesson_4_2,
  '4.3': lesson_4_3,
  '4.4': lesson_4_4,
  '5.1': lesson_5_1,
  '5.2': lesson_5_2,
  '5.3': lesson_5_3,
  '5.4': lesson_5_4,
  '6.1': lesson_6_1,
  '6.2': lesson_6_2,
  '6.3': lesson_6_3,
};

// --- localStorage persistence ---
const STORAGE_KEY = 'chemistry_progress';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function setActiveLesson(key) {
  const progress = loadProgress();
  progress.activeLesson = key;
  saveProgress(progress);
}

function markLessonCompleted(key) {
  const progress = loadProgress();
  if (!progress.completed) progress.completed = [];
  if (!progress.completed.includes(key)) progress.completed.push(key);
  saveProgress(progress);
}

// Restore completed state from localStorage
function restoreProgress() {
  const progress = loadProgress();
  if (progress.completed) {
    document.querySelectorAll('.toc-item').forEach(item => {
      const key = item.dataset.lesson;
      if (progress.completed.includes(key)) {
        item.classList.add('completed');
      }
    });
  }
  return progress;
}

// Init runner
const container = document.getElementById('lessonContainer');
const toolbar = document.querySelector('.toolbar');
const runner = new LessonRunner(container, toolbar);

// Restore progress and determine which lesson to load
const progress = restoreProgress();
const savedKey = progress.activeLesson;
const activeItem = document.querySelector('.toc-item.active');
const defaultKey = savedKey || activeItem?.dataset?.lesson || '1.4';

// Update TOC active state to match saved lesson
if (savedKey) {
  document.querySelectorAll('.toc-item').forEach(i => i.classList.remove('active'));
  const savedItem = document.querySelector(`.toc-item[data-lesson="${savedKey}"]`);
  if (savedItem) savedItem.classList.add('active');
}

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
      setActiveLesson(key);
      runner.loadLesson(lessons[key]);
    } else {
      document.querySelector('.status').textContent = `Lesson ${key} not built yet`;
    }
  });
});

// Mark lesson complete when narrative engine finishes all steps
const origStart = runner.engine.start.bind(runner.engine);
runner.engine.start = async function(fromStep = 0) {
  await origStart(fromStep);
  // If we ran to the end, mark complete
  if (runner.currentLesson) {
    markLessonCompleted(runner.currentLesson.id);
    const tocItem = document.querySelector(`.toc-item[data-lesson="${runner.currentLesson.id}"]`);
    if (tocItem) tocItem.classList.add('completed');
  }
};
