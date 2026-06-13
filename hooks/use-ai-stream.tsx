import { useState, useCallback, useRef, useEffect } from "react";

interface UseAIStreamOptions {
  onSuccess?: (response: string) => void;
  onError?: (error: string) => void;
}

interface StreamState {
  isStreaming: boolean;
  response: string;
  error: string | null;
}

export function useAIStream(options: UseAIStreamOptions = {}) {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    response: "",
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (prompt: string, context?: Record<string, any>) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setState({ isStreaming: true, response: "", error: null });

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context, stream: true }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Stream request failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (!reader) throw new Error("No reader available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullResponse += parsed.text;
                setState((prev) => ({
                  ...prev,
                  response: fullResponse,
                }));
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }

      setState({ isStreaming: false, response: fullResponse, error: null });
      options?.onSuccess?.(fullResponse);
    } catch (error: any) {
      if (error.name === "AbortError") {
        setState((prev) => ({ ...prev, isStreaming: false }));
      } else {
        const errorMessage = error.message || "เกิดข้อผิดพลาด";
        setState({ isStreaming: false, response: "", error: errorMessage });
        options?.onError?.(errorMessage);
      }
    }
  }, [options]);

  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const reset = useCallback(() => {
    setState({ isStreaming: false, response: "", error: null });
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    ...state,
    startStream,
    stopStream,
    reset,
  };
}

interface UseAIOptions {
  onSuccess?: (response: string) => void;
  onError?: (error: string) => void;
}

export function useAI(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, context?: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    setResponse("");

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Request failed");
      }

      const data = await res.json();
      setResponse(data.text);
      options?.onSuccess?.(data.text);
    } catch (err: any) {
      const errorMessage = err.message || "เกิดข้อผิดพลาด";
      setError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    isLoading,
    response,
    error,
    generate,
    reset: () => {
      setResponse("");
      setError(null);
    },
  };
}
