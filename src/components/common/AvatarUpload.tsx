import React, { useState, useRef } from "react";
import { Camera, Loader2, Check, X, User } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { uploadAvatar } from "../../lib/storage";
import { api } from "../../lib/api";

interface AvatarUploadProps {
  userId: string;
  idToUpdate: string;
  role: "member" | "trainer";
  currentAvatarUrl: string | null;
  name: string;
  onUploadSuccess: (url: string) => void;
}

export default function AvatarUpload({ 
  userId, 
  idToUpdate, 
  role, 
  currentAvatarUrl, 
  name, 
  onUploadSuccess 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCircleClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be less than 2MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const publicUrl = await uploadAvatar(userId, selectedFile);

      // 2. Patch database record
      if (role === "member") {
        await api.patch(`/api/v1/members/${idToUpdate}`, {
          avatar_url: publicUrl
        });
      } else {
        await api.patch(`/api/v1/trainers/${idToUpdate}`, {
          avatar_url: publicUrl
        });
      }

      toast.success("Profile photo updated successfully!");
      onUploadSuccess(publicUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  // Get initials for avatar fallback
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const displayImage = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        onClick={handleCircleClick}
        className="w-20 h-20 rounded-full border-2 border-white/5 bg-[#171717] hover:border-[#FF6B00]/40 transition-colors cursor-pointer relative overflow-hidden flex items-center justify-center group"
      >
        {displayImage ? (
          <img 
            src={displayImage} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[#FF6B00] text-xl font-black">{initials}</span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Camera size={18} className="text-white" />
        </div>

        {/* Loading Spinner overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 size={18} className="text-[#FF6B00] animate-spin" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Action buttons shown when file is chosen */}
      {selectedFile && !uploading && (
        <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <Button
            size="sm"
            onClick={handleCancel}
            className="h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2.5 flex items-center gap-1"
          >
            <X size={12} />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            className="h-8 rounded-lg bg-green-500 hover:bg-green-600 text-white px-2.5 flex items-center gap-1 font-bold"
          >
            <Check size={12} />
            Save Photo
          </Button>
        </div>
      )}
    </div>
  );
}
