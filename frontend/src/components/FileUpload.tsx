import React, { useState } from "react";
import { attachmentService, authService } from "../services";

interface FileUploadProps {
  taskId?: string;
  onUploadSuccess?: (attachment: any) => void;
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
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <h3>{taskId ? "Upload File for Task" : "Upload File"}</h3>

      <div className="upload-controls">
        <input
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          accept="*/*"
        />

        {selectedFile && (
          <div className="file-info">
            <p>Selected: {selectedFile.name}</p>
            <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        <button onClick={handleUpload} disabled={!selectedFile || uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default FileUpload;
