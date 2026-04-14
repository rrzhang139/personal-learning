// Animation step controller for progressive reveal of scene content

/**
 * Timeline manages a sequence of discrete steps with optional auto-advance.
 *
 * @example
 *   const tl = new Timeline(8, {
 *     onStep: (step) => scene.setStep(step),
 *     autoAdvanceMs: 3000,
 *   });
 *   tl.play();
 */
export class Timeline {
  /**
   * @param {number} totalSteps — number of steps (0-indexed: 0 .. totalSteps-1)
   * @param {object} [opts]
   * @param {function(number): void} [opts.onStep] — callback fired whenever step changes
   * @param {number} [opts.autoAdvanceMs=2000] — interval between auto-advance steps
   */
  constructor(totalSteps, opts = {}) {
    this._totalSteps = totalSteps;
    this._onStep = opts.onStep || null;
    this._autoAdvanceMs = opts.autoAdvanceMs ?? 2000;
    this._current = 0;
    this._intervalId = null;
    this._playing = false;
  }

  // ---- Public API ----

  /** Current step index. */
  get currentStep() {
    return this._current;
  }

  /** Total number of steps. */
  get totalSteps() {
    return this._totalSteps;
  }

  /** Whether auto-advance is running. */
  get isPlaying() {
    return this._playing;
  }

  /**
   * Jump to step n, clamped to valid range.
   * @param {number} n
   */
  setStep(n) {
    const clamped = Math.max(0, Math.min(n, this._totalSteps - 1));
    if (clamped === this._current && n !== 0) return; // avoid redundant calls (except reset to 0)
    this._current = clamped;
    if (this._onStep) this._onStep(this._current);
  }

  /** Advance to the next step. */
  nextStep() {
    this.setStep(this._current + 1);
  }

  /** Go back to the previous step. */
  prevStep() {
    this.setStep(this._current - 1);
  }

  /** Begin auto-advancing steps on an interval. */
  play() {
    if (this._playing) return;
    this._playing = true;
    this._intervalId = setInterval(() => {
      if (this._current >= this._totalSteps - 1) {
        this.pause();
        return;
      }
      this.nextStep();
    }, this._autoAdvanceMs);
  }

  /** Stop auto-advancing (retains current step). */
  pause() {
    this._playing = false;
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /** Reset to step 0 and pause. */
  reset() {
    this.pause();
    this._current = -1; // force onStep even if already 0
    this.setStep(0);
  }

  /** Pause and clean up. */
  stop() {
    this.pause();
  }
}
