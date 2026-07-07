"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";

export default function PdfUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processPDF = async (pdfFile: File) => {
    setIsProcessing(true);
    try {
      // In a real scenario, this would use pdfjs-dist or call an API to extract text.
      // E.g., const pdfjs = await import("pdfjs-dist");
      // For now we simulate an extraction delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setExtractedText(
        "Sample extracted text from the PDF: This text has been successfully read and converted into a custom HTML structure. You can now build any layout you desire with this data."
      );
    } catch (error) {
      console.error("Failed to parse PDF", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        processPDF(droppedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processPDF(selectedFile);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Upload Area */}
      {!file && (
        <div
          className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all duration-300 ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02]"
              : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-full shadow-sm mb-6 pointer-events-none">
            <UploadCloud className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2 pointer-events-none">
            Drop your PDF here
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-center pointer-events-none">
            or click to browse from your computer
          </p>
        </div>
      )}

      {/* Processing State */}
      {file && isProcessing && (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-zinc-900/5 dark:ring-white/10">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
          <h3 className="text-xl font-medium text-zinc-900 dark:text-white">
            Extracting structure...
          </h3>
          <p className="text-zinc-500 mt-2">Analyzing {file.name}</p>
        </div>
      )}

      {/* Result State */}
      {file && !isProcessing && extractedText && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
                <FileIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-sm text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setExtractedText("");
              }}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-zinc-900/5 dark:ring-white/10 prose dark:prose-invert max-w-none">
            <h2>Extracted Content Structure</h2>
            <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                {extractedText}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
