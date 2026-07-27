import { type RefObject, useCallback, useRef, useState } from "react";

declare global {
	interface Window {
		webkitSpeechRecognition: typeof SpeechRecognition;
	}
}

interface UseSpeechRecognitionReturn {
	transcript: string;
	interimTranscript: string;
	isListening: boolean;
	error: string | null;
	startListening: () => void;
	stopListening: () => Promise<void>;
	transcriptRef: RefObject<string>;
	clearTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
	const [transcript, setTranscript] = useState("");
	const [interimTranscript, setInterimTranscript] = useState("");
	const [isListening, setIsListening] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const transcriptRef = useRef("");
	const lastInterimIndexRef = useRef(-1);
	const skipUpToIndexRef = useRef(-1);

	const startListening = useCallback(() => {
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		if (!SpeechRecognition) {
			setError(
				"Speech recognition is not supported in this browser. Use Chrome.",
			);
			return;
		}

		transcriptRef.current = "";
		setTranscript("");
		setInterimTranscript("");
		lastInterimIndexRef.current = -1;
		skipUpToIndexRef.current = -1;

		const recognition = new SpeechRecognition();
		recognition.lang = "en-US";
		recognition.interimResults = true;
		recognition.continuous = true;

		recognition.onstart = () => {
			setIsListening(true);
			setError(null);
		};

		recognition.onresult = (event) => {
			const result = event.results[event.resultIndex];
			const idx = event.resultIndex;

			if (idx <= skipUpToIndexRef.current) return; // stale result after a clear

			if (result.isFinal) {
				const newText = result[0].transcript;
				const accumulated = transcriptRef.current
					? `${transcriptRef.current} ${newText}`
					: newText;
				transcriptRef.current = accumulated;
				setTranscript(accumulated);
				setInterimTranscript("");
			} else {
				lastInterimIndexRef.current = idx; // track which interim is in-progress
				setInterimTranscript(result[0].transcript);
			}
		};

		recognition.onerror = (event) => {
			if (event.error === "no-speech") return;
			setError(event.error);
			setIsListening(false);
		};

		recognition.onend = () => {
			setIsListening(false);
		};

		recognitionRef.current = recognition;
		recognition.start();
	}, []);

	const stopListening = useCallback((): Promise<void> => {
		return new Promise((resolve) => {
			const recognition = recognitionRef.current;
			if (!recognition) {
				resolve();
				return;
			}
			recognition.onend = () => {
				setIsListening(false);
				setInterimTranscript("");
				resolve();
			};
			recognition.stop();
		});
	}, []);

	const clearTranscript = useCallback(() => {
		skipUpToIndexRef.current = lastInterimIndexRef.current;
		transcriptRef.current = "";
		setTranscript("");
		setInterimTranscript("");
	}, []);

	return {
		transcript,
		interimTranscript,
		isListening,
		error,
		startListening,
		stopListening,
		clearTranscript,
		transcriptRef,
	};
}
