import "@testing-library/jest-dom/vitest"
import "@/lib/i18n"
import { vi } from "vitest"

// jsdom does not implement scrollTo — stub it to suppress noisy warnings
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
