import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface Props {
  totalSeconds: number;
  onTimeUp: () => void;
  running: boolean;
}

export default function Timer({ totalSeconds, onTimeUp, running }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      if (!triggered) {
        setTriggered(true);
        onTimeUp();
      }
      return;
    }
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, remaining, onTimeUp, triggered]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isWarning = remaining <= 300 && remaining > 0; // Last 5 minutes
  const isExpired = remaining <= 0;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold transition-all ${
        isExpired
          ? "bg-red-100 text-red-700"
          : isWarning
          ? "bg-red-50 text-red-600 pulse-warning"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      <Clock className="w-5 h-5" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
      {remaining > 0 && <span className="text-xs font-normal text-slate-400">剩余</span>}
      {isExpired && <span className="text-xs font-normal">时间到</span>}
    </div>
  );
}
