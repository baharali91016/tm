import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";

import { routeTree } from "./routeTree.gen";
import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "./components/theme-provider";

function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
    </ThemeProvider>
  );
}
export default App;

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
  queryCache: new QueryCache({
    onError: (e) => {
      console.error(e);
    },
  }),
  mutationCache: new MutationCache({
    onError: (e) => {
      console.error(e);
    },
  }),
});

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
       <App>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </App>

    </StrictMode>
  );
}
