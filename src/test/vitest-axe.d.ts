/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import 'vitest';
import type { AxeMatchers } from 'vitest-axe';

declare module 'vitest' {
  export interface Assertion<T = any> extends AxeMatchers {}
  export interface AsymmetricMatchersContaining extends AxeMatchers {}
}
