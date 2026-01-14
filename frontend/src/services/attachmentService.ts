import { attachmentApi } from "./generatedApi";

export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data?: T;
}

class AttachmentService {
  /**
   * Upload file without linking to task
   */
  async uploadFile(file: File, userId: string): Promise<ApiResponse<unknown>> {
    // Enhanced mobile debugging
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      console.log("📱 AttachmentService Debug - uploadFile:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId: userId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        apiBaseUrl: window.location.origin,
      });
    }

    try {
      if (isMobile) {
        console.log(
          "📱 AttachmentService Debug - Calling attachmentApi.upload..."
        );
        console.log("📱 AttachmentService Debug - Request details:", {
          url: `${window.location.origin}/api/attachments/${userId}`,
          method: "POST",
          contentType: "multipart/form-data",
          fileSize: file.size,
          fileName: file.name,
          fileType: file.type,
          userId: userId,
        });
      }

      const response = await attachmentApi.upload(userId, file);

      if (isMobile) {
        console.log(
          "📱 AttachmentService Debug - Upload API response:",
          response
        );
      }

      return {
        code: 200,
        msg: "File uploaded successfully",
        data: response.data,
      };
    } catch (error: unknown) {
      if (isMobile) {
        console.error("📱 AttachmentService Debug - Upload error:", error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown }; config?: { url?: string; method?: string; headers?: unknown } };
          console.error("📱 AttachmentService Debug - Error details:", {
            name: 'name' in error ? error.name : undefined,
            message: 'message' in error ? error.message : undefined,
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data,
            config: {
              url: axiosError.config?.url,
              method: axiosError.config?.method,
              headers: axiosError.config?.headers,
            },
          });
        }
      }
      console.error("Upload file error:", error);

      // Enhanced error message handling
      let errorMessage = "Failed to upload file.";
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: unknown } } 
        : null;
      const errorCode = axiosError?.response?.status || 500;

      if (axiosError?.response?.data) {
        const errorData = axiosError.response.data;
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData && typeof errorData === 'object') {
          if ('msg' in errorData && typeof errorData.msg === 'string') {
            errorMessage = errorData.msg;
          } else if ('message' in errorData && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          }
        }
      }

      // Special handling for 413 errors
      if (errorCode === 413) {
        errorMessage = "File too large. Maximum allowed size is 25MB.";
      }

      return {
        code: errorCode,
        msg: errorMessage,
      };
    }
  }

  /**
   * Upload file and attach to task
   */
  async uploadFileForTask(
    taskId: string,
    file: File,
    userId: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await attachmentApi.uploadForTask(taskId, userId, file);
      return {
        code: 200,
        msg: "File uploaded and attached successfully",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Upload file for task error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to upload file for task.",
      };
    }
  }

  /**
   * Get attachments for a task
   */
  async getTaskAttachments(
    taskId: string,
    userId: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await attachmentApi.listForTask(taskId, userId);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Get task attachments error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to get task attachments.",
      };
    }
  }

  async getUserAttachments(userId: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await attachmentApi.listForUser(userId);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Get user attachments error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to get user attachments.",
      };
    }
  }

  /**
   * Attach existing file to task
   */
  async attachFileToTask(
    attachmentId: string,
    taskId: string,
    userId: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await attachmentApi.attach(attachmentId, taskId, userId);
      return {
        code: 200,
        msg: "File attached successfully",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Attach file to task error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to attach file to task.",
      };
    }
  }

  /**
   * Detach file from task
   */
  async detachFileFromTask(
    attachmentId: string,
    userId: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await attachmentApi.detach(attachmentId, userId);
      return {
        code: 200,
        msg: "File detached successfully",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Detach file from task error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to detach file from task.",
      };
    }
  }

  /**
   * Download file
   */
  async downloadFile(
    attachmentId: string,
    userId: string
  ): Promise<ApiResponse<Blob>> {
    try {
      const response = await attachmentApi.download(attachmentId, userId, {
        responseType: "blob",
      });
      return {
        code: 200,
        msg: "File downloaded successfully",
        data: response.data as unknown as Blob,
      };
    } catch (error: unknown) {
      console.error("Download file error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to download file.",
      };
    }
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(
    attachmentId: string,
    userId: string
  ): Promise<ApiResponse> {
    // Enhanced mobile debugging
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      console.log("📱 AttachmentService Debug - deleteAttachment:", {
        attachmentId: attachmentId,
        userId: userId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        apiBaseUrl: window.location.origin,
      });
    }

    try {
      if (isMobile) {
        console.log(
          "📱 AttachmentService Debug - Calling attachmentApi._delete..."
        );
      }

      await attachmentApi._delete(attachmentId, userId);

      if (isMobile) {
        console.log("📱 AttachmentService Debug - Delete API call successful");
      }

      return {
        code: 200,
        msg: "Attachment deleted successfully",
      };
    } catch (error: unknown) {
      if (isMobile) {
        console.error("📱 AttachmentService Debug - Delete error:", error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown }; config?: { url?: string; method?: string; headers?: unknown } };
          console.error("📱 AttachmentService Debug - Error details:", {
            name: 'name' in error ? error.name : undefined,
            message: 'message' in error ? error.message : undefined,
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data,
            config: {
              url: axiosError.config?.url,
              method: axiosError.config?.method,
              headers: axiosError.config?.headers,
            },
          });
        }
      }
      console.error("Delete attachment error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to delete attachment.",
      };
    }
  }

  /**
   * Helper method to trigger file download
   */
  async downloadAndSaveFile(
    attachmentId: string,
    fileName: string,
    userId: string
  ): Promise<boolean> {
    try {
      const response = await this.downloadFile(attachmentId, userId);

      if (response.code === 200 && response.data) {
        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Download and save file error:", error);
      return false;
    }
  }

  /**
   * Get file content as text for text files
   */
  async getFileAsText(
    attachmentId: string,
    userId: string
  ): Promise<ApiResponse<string>> {
    try {
      const response = await attachmentApi.download(attachmentId, userId, {
        responseType: "text",
      });
      return {
        code: 200,
        msg: "File content retrieved successfully",
        data: response.data as unknown as string,
      };
    } catch (error: unknown) {
      console.error("Get file as text error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to get file content.",
      };
    }
  }
}

export const attachmentService = new AttachmentService();
export default attachmentService;
