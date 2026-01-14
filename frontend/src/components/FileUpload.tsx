import React, { useState } from "react";
import { attachmentService, authService } from "../services";

interface FileUploadProps {
  taskId?: string;
  onUploadSuccess?: (attachment: unknown) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ taskId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const userId = authService.getUserId();
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      let response;
      if (taskId) {
        response = await attachmentService.uploadFileForTask(
          taskId,
          selectedFile,
          userId
        );
      } else {
        response = await attachmentService.uploadFile(selectedFile, userId);
      }

      if (response.code === 200) {
        setSuccess("File uploaded successfully!");
        setSelectedFile(null);
        if (onUploadSuccess && response.data) {
          onUploadSuccess(response.data);
        }
      } else {
        setError(response.msg);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        {taskId ? "Upload File for Task" : "Upload File"}
      </h3>

      <div className="space-y-4">
        <input
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          accept="*/*"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />

        {selectedFile && (
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-700">
              Selected: {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500">
              Size: {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full bg-blue-600 text-white border-0 p-3 rounded text-base cursor-pointer hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded mt-4 text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-600 text-white p-3 rounded mt-4 text-center">
          {success}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
