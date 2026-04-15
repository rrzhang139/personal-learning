/**
 * Main entry point — wires up sidebar, toolbar, lesson loading, and persistence.
 * Physical Chemistry — McQuarrie-inspired, quantum-first approach.
 */

import { LessonRunner } from './engine/LessonRunner.js';
import { lesson_1_1 } from './lessons/lesson_1_1.js';
import { lesson_1_2 } from './lessons/lesson_1_2.js';

// Lesson registry — add lessons here as they're built
const lessons = {
  '1.1': lesson_1_1,
  '1.2': lesson_1_2,
};

// --- localStorage persistence ---
const STORAGE_KEY = 'pchem_progress';

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
const defaultKey = savedKey || activeItem?.dataset?.lesson || '1.1';

if (savedKey) {
  document.querySelectorAll('.toc-item').forEach(i => i.classList.remove('active'));
  const savedItem = document.querySelector(`.toc-item[data-lesson="${savedKey}"]`);
  if (savedItem) savedItem.classList.add('active');
}

if (lessons[defaultKey]) {
  try {
    runner.loadLesson(lessons[defaultKey]);
  } catch (err) {
    console.error('Failed to load default lesson:', err);
    document.querySelector('.status').textContent = 'Error loading lesson — check console';
  }
}

// TOC navigation
document.querySelectorAll('.toc-item').forEach(item => {
  item.addEventListener('click', () => {
    const key = item.dataset.lesson;
    if (lessons[key]) {
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
  if (runner.currentLesson) {
    markLessonCompleted(runner.currentLesson.id);
    const tocItem = document.querySelector(`.toc-item[data-lesson="${runner.currentLesson.id}"]`);
    if (tocItem) tocItem.classList.add('completed');
  }
};
