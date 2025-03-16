import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
} from "react";
import type { StartAvatarResponse } from "@heygen/streaming-avatar";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
} from "@heygen/streaming-avatar";
import styles from "@App/styles/NaturalConversationPage.module.scss";

const HeyGenApiKey = process.env.HeyGenApiKey;

interface InteractiveAvatarProps {
  onTranscriptChange: (transcript: string) => void;
  onInterviewerTranscriptChange?: (transcript: string) => void;
}

const InteractiveAvatar = forwardRef((props: InteractiveAvatarProps, ref) => {
  const { onTranscriptChange, onInterviewerTranscriptChange } = props;
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>("");
  const [data, setData] = useState<StartAvatarResponse>();
  // 'UserTextRef' holds the candidate's final answer.
  const UserTextRef = useRef("");
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);

  // Temporary accumulator for the interviewer transcript.
  const interviewerTranscriptRef = useRef<string>("");

  async function fetchAccessToken() {
    try {
      const response = await fetch(
        "https://api.heygen.com/v1/streaming.create_token",
        {
          method: "POST",
          headers: { "x-api-key": HeyGenApiKey || "" },
        }
      );
      const { data } = await response.json();
      console.log("Access Token:", data.token);
      return data.token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
    return "";
  }

  async function startSession() {
    setIsLoadingSession(true);
    // Reset the interviewer transcript accumulator
    interviewerTranscriptRef.current = "";
    const newToken = await fetchAccessToken();
    avatar.current = new StreamingAvatar({ token: newToken });

    avatar.current.on(StreamingEvents.STREAM_READY, (event) => {
      console.log("Stream ready:", event.detail);
      setStream(event.detail);
    });

    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log("Avatar started talking", e);
      // Clear any previous accumulation when starting to talk
    });

    // Instead of immediately updating on each word, accumulate the message.
    avatar.current.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (message) => {
      console.log("Avatar talking message:", message);
      if (
        message.detail.message == "." ||
        message.detail.message == "," ||
        message.detail.message == "!" ||
        message.detail.message == "?"
      ) {
        interviewerTranscriptRef.current += message.detail.message;
      } else {
        interviewerTranscriptRef.current += message.detail.message + " ";
      }
      console.log(interviewerTranscriptRef.current);
    });

    // When the avatar stops talking, send the accumulated transcript.
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log("Avatar stopped talking", e);
      if (onInterviewerTranscriptChange) {
        // Trim to remove any extra spaces.
        onInterviewerTranscriptChange(interviewerTranscriptRef.current.trim());
      }
      interviewerTranscriptRef.current = "";
    });

    // Update transcript when user is talking.
    avatar.current.on(StreamingEvents.USER_TALKING_MESSAGE, (message) => {
      console.log("User talking message:", message);
      UserTextRef.current = message.detail.message;
      console.log(UserTextRef.current);
      setIsUserTalking(false);
      onTranscriptChange(message.detail.message);
    });

    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: "default",
        knowledgeBase: `You are a professional job interviewer. Your responsibilities include:
                          - Evaluating the candidate's skills, experience, and overall fit for the role.
                          - Asking clarifying questions to understand the candidate's perspective.
                          - Encouraging the candidate to elaborate on their experiences with specific examples.
                          - Maintaining a friendly, respectful, and professional tone at all times.
                          - Adjusting your follow-up questions based on the candidate's previous answers.
                        Based on the candidate's answer provided below, please ask a relevant and probing follow-up question to gather deeper insights.
                        Candidate Answer: `,
        disableIdleTimeout: true,
      });
      setData(res);
      // Start voice chat with silence prompt enabled.
      await avatar.current?.startVoiceChat({ useSilencePrompt: true });
      setChatMode("voice_mode");
    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoadingSession(false);
    }

    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
      console.log(">>>>> User stopped talking:", event);
      console.log(UserTextRef.current);
    });

    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("Stream disconnected");
      endSession();
    });

    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log(">>>>> Stream ready:", event.detail);
      setStream(event.detail);
    });

    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      console.log(">>>>> User started talking:", event);
      setIsUserTalking(true);
    });
  }

  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
    await avatar.current.interrupt().catch((e) => {
      setDebug(e.message);
    });
  }

  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }

  useImperativeHandle(ref, () => ({
    startSession,
    endSession,
    handleInterrupt,
  }));

  useEffect(() => {
    if (text) {
      avatar.current?.startListening();
    } else {
      avatar.current?.stopListening();
    }
  }, [text]);

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className={styles.avatarContainer}>
      {!stream ? (
        <div className={styles.avatarPlaceholder}></div> // Black box placeholder
      ) : (
        <video
          ref={mediaStream}
          autoPlay
          playsInline
          className={styles.avatarModel}
        >
          <track kind="captions" />
        </video>
      )}
    </div>
  );
});

export default InteractiveAvatar;
