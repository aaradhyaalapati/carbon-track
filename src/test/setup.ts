// Vitest global setup. Adds jest-dom matchers (toBeInTheDocument, etc.) for the
// component and accessibility tests that will accompany the frontend.
import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(matchers);
