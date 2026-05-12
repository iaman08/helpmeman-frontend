"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import getCroppedImg from "@/lib/cropImage";
import { useToast } from "./Toast";

interface ImageCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

export function ImageCropModal({ imageSrc, onClose, onCropComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const handleCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const saveCroppedImage = async () => {
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      if (croppedFile) {
        onCropComplete(croppedFile);
      } else {
        throw new Error("Failed to crop image");
      }
    } catch (e) {
      toast("Error cropping image", "error");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-(--bg) border border-(--hairline) rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-(--hairline)">
          <h2 className="text-lg font-bold">Adjust Profile Photo</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-(--fg)/5 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative w-full h-[400px] bg-neutral-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={handleCropComplete}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Footer / Controls */}
        <div className="p-5 flex flex-col gap-6">
          <div className="flex items-center gap-4 px-2">
            <ZoomOut className="h-5 w-5 text-(--muted)" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-(--accent)"
            />
            <ZoomIn className="h-5 w-5 text-(--muted)" />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl font-medium text-(--muted) hover:text-(--fg) hover:bg-(--fg)/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveCroppedImage}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl font-medium bg-(--accent) text-(--accent-fg) hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[120px]"
            >
              {isProcessing ? "Processing..." : "Save Photo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
