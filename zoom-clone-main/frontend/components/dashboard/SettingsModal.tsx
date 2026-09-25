"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  Settings,
  Mic,
  Video,
  Sliders,
  User,
  Volume2,
  Check,
  Shield,
  Monitor,
} from "lucide-react";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<"av" | "general" | "profile">("av");

  // Settings states with localStorage persistence
  const [userName, setUserName] = useState("Default User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [autoMute, setAutoMute] = useState(false);
  const [autoVideoOff, setAutoVideoOff] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [hdVideo, setHdVideo] = useState(true);
  const [mirrorVideo, setMirrorVideo] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zoom_clone_user_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.userEmail) setUserEmail(parsed.userEmail);
        if (typeof parsed.autoMute === "boolean") setAutoMute(parsed.autoMute);
        if (typeof parsed.autoVideoOff === "boolean") setAutoVideoOff(parsed.autoVideoOff);
        if (typeof parsed.noiseSuppression === "boolean") setNoiseSuppression(parsed.noiseSuppression);
        if (typeof parsed.hdVideo === "boolean") setHdVideo(parsed.hdVideo);
        if (typeof parsed.mirrorVideo === "boolean") setMirrorVideo(parsed.mirrorVideo);
        if (typeof parsed.soundAlerts === "boolean") setSoundAlerts(parsed.soundAlerts);
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  const handleSave = () => {
    try {
      const settings = {
        userName,
        userEmail,
        autoMute,
        autoVideoOff,
        noiseSuppression,
        hdVideo,
        mirrorVideo,
        soundAlerts,
      };
      localStorage.setItem("zoom_clone_user_settings", JSON.stringify(settings));
      success("Settings saved successfully!");
      onClose();
    } catch {
      success("Settings saved for this session");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-hover" />
          <span>Application Settings</span>
        </div>
      }
      description="Configure your audio, video hardware devices, and personal preferences"
      maxWidth="lg"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} className="gap-1.5 px-4">
            <Check className="w-4 h-4" />
            <span>Save Preferences</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-dark-border gap-2">
          <button
            onClick={() => setActiveTab("av")}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "av"
                ? "border-brand text-brand-hover"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Audio & Video</span>
          </button>

          <button
            onClick={() => setActiveTab("general")}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "general"
                ? "border-brand text-brand-hover"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>General</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "border-brand text-brand-hover"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

        {/* Tab 1: Audio & Video */}
        {activeTab === "av" && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="space-y-2">
              <label className="font-semibold text-slate-200 block">Microphone Settings</label>
              <div className="p-3 rounded-xl bg-dark-bg border border-dark-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">Default Input Microphone</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">Connected</span>
                </div>

                <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noiseSuppression}
                    onChange={(e) => setNoiseSuppression(e.target.checked)}
                    className="rounded border-dark-border bg-dark-surface text-brand focus:ring-brand/40"
                  />
                  <span className="text-slate-300">
                    Enable AI background noise cancellation & echo suppression
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-200 block">Camera & Video</label>
              <div className="p-3 rounded-xl bg-dark-bg border border-dark-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">Integrated HD Webcam</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">Available</span>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hdVideo}
                    onChange={(e) => setHdVideo(e.target.checked)}
                    className="rounded border-dark-border bg-dark-surface text-brand focus:ring-brand/40"
                  />
                  <span className="text-slate-300">Enable 1080p High Definition video stream</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mirrorVideo}
                    onChange={(e) => setMirrorVideo(e.target.checked)}
                    className="rounded border-dark-border bg-dark-surface text-brand focus:ring-brand/40"
                  />
                  <span className="text-slate-300">Mirror my video display</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: General */}
        {activeTab === "general" && (
          <div className="space-y-3 animate-fade-in text-xs">
            <div className="p-3 rounded-xl bg-dark-bg border border-dark-border space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-200 block">Mute mic when joining</span>
                  <span className="text-slate-400 text-[11px]">
                    Always join new meetings with microphone muted
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoMute}
                  onChange={(e) => setAutoMute(e.target.checked)}
                  className="rounded border-dark-border bg-dark-surface text-brand"
                />
              </label>

              <hr className="border-dark-border/40" />

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-200 block">Turn off video when joining</span>
                  <span className="text-slate-400 text-[11px]">
                    Join meetings with camera off by default
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoVideoOff}
                  onChange={(e) => setAutoVideoOff(e.target.checked)}
                  className="rounded border-dark-border bg-dark-surface text-brand"
                />
              </label>

              <hr className="border-dark-border/40" />

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-200 block">Meeting Audio Chimes</span>
                  <span className="text-slate-400 text-[11px]">
                    Play sound chime when participants enter or leave
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="rounded border-dark-border bg-dark-surface text-brand"
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Profile */}
        {activeTab === "profile" && (
          <div className="space-y-3 animate-fade-in text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Display Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-dark-bg border border-dark-border text-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-dark-bg border border-dark-border text-slate-200"
              />
            </div>

            <div className="p-3 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-hover" />
                <span className="font-semibold text-white">Zoom Pro Enterprise License</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand text-white">
                Active
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
