import { Bookmark, Newspaper, Settings } from "lucide-react"
import { useState } from "react"

import { ReadListPage } from "@/features/article-actions/components/read-list-page"
import { FeedPage } from "@/features/feed/components/feed-page"
import { FeedConfigPage } from "@/features/feed-config/components/feed-config-page"

type View = "feed" | "readlist" | "config"

const NAV_ITEMS: Array<{ id: View; label: string; icon: typeof Newspaper }> = [
  { id: "feed", label: "Feed", icon: Newspaper },
  { id: "readlist", label: "Read List", icon: Bookmark },
  { id: "config", label: "Settings", icon: Settings },
]

export function AppLayout() {
  const [activeView, setActiveView] = useState<View>("feed")

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="flex" aria-label="Main navigation">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                activeView === id
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={activeView === id ? "page" : undefined}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-3 md:p-6">
        {activeView === "feed" && <FeedPage />}
        {activeView === "readlist" && <ReadListPage />}
        {activeView === "config" && <FeedConfigPage />}
      </main>
    </div>
  )
}
