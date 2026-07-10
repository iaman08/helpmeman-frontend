import { useState, useRef, useCallback } from "react";

export type StreamState = "idle" | "sending" | "waiting_first_token" | "streaming" | "completed" | "error";

interface UseAIStreamOptions {
  endpoint: string;
  token?: string | null;
  onToken: (text: string) => void;
  onMeta?: (meta: any) => void;
  onError?: (err: string) => void;
  onCompleted?: () => void;
}

export function useAIStream({
  endpoint,
  token,
  onToken,
  onMeta,
  onError,
  onCompleted
}: UseAIStreamOptions) {
  const [streamState, setStreamState] = useState<StreamState>("idle");
  const [error, setError] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setStreamState("completed");
  }, []);

  const startStream = useCallback(async (message: string, bodyParams: Record<string, any> = {}) => {
    setError("");
    stopStream();

    setStreamState("sending");
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStreamState("waiting_first_token");

    let rawTokenBuffer = "";
    let lastFlushedText = "";
    let transitionedToStreaming = false;

    // requestAnimationFrame batch rendering loop
    const flushTextToUI = () => {
      const parts = rawTokenBuffer.split('[META]');
      const extractedText = parts[0];

      if (extractedText && !transitionedToStreaming) {
        transitionedToStreaming = true;
        setStreamState("streaming");
        onToken(extractedText);
      } else if (transitionedToStreaming && extractedText !== lastFlushedText) {
        lastFlushedText = extractedText;
        onToken(extractedText);
      }
      rafIdRef.current = requestAnimationFrame(flushTextToUI);
    };

    rafIdRef.current = requestAnimationFrame(flushTextToUI);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, ...bodyParams }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let streamBuffer = "";
      let currentEvent = "";
      let metaReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        
        const messagesList = streamBuffer.split("\n\n");
        streamBuffer = messagesList.pop() || "";

        for (const messageText of messagesList) {
          const lines = messageText.split("\n");
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("event: ")) {
              currentEvent = trimmedLine.slice(7).trim();
            } else if (trimmedLine.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmedLine.slice(6));

                if (currentEvent === "token") {
                  rawTokenBuffer += data.text;
                }

                if (currentEvent === "meta" && !metaReceived) {
                  metaReceived = true;
                  if (onMeta) {
                    const parts = rawTokenBuffer.split('[META]');
                    const extractedText = parts[0];
                    onMeta({
                      ...data,
                      responseText: data.response || extractedText,
                    });
                  }
                }

                if (currentEvent === "error") {
                  const errMsg = data.message || "⚠️ Response interrupted.";
                  setError(errMsg);
                  setStreamState("error");
                  if (onError) onError(errMsg);
                }

              } catch { /* JSON parse error — skip malformed chunk */ }
            }
          }
        }
      }

    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // aborted cleanly
      } else {
        const errMsg = "⚠️ Response interrupted.";
        setError(errMsg);
        setStreamState("error");
        if (onError) onError(errMsg);
      }
    } finally {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setStreamState(prev => prev === "error" ? "error" : "completed");
      abortControllerRef.current = null;
      if (onCompleted) onCompleted();
    }
  }, [endpoint, token, onToken, onMeta, onError, onCompleted, stopStream]);

  return {
    streamState,
    error,
    startStream,
    stopStream,
  };
}
