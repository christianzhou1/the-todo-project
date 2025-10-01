import { attachmentApi } from "./generatedApi";

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
}

class AttachmentService {
  /**
   * Upload file without linking to task
   */
  async uploadFile(file: File, userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await attachmentApi.upload(userId, file);
      return {
        code: 200,
        msg: "File uploaded successfully",
        data: response.data,
      };
    } catch (error: any) {
      console.error("Upload file error:", error);

      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || "Failed to upload file.",
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
  ): Promise<ApiResponse<any>> {
    try {
      const response = await attachmentApi.uploadForTask(taskId, userId, file);
      return {
        code: 200,
        msg: "File uploaded and attached successfully",
        data: response.data,
      };
    } catch (error: any) {
      console.error("Upload file for task error:", error);

      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || "Failed to upload file for task.",
      };
    }
  }

  /**
   * Get attachments for a task
   */
  async getTaskAttachments(
    taskId: string,
    userId: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await attachmentApi.listForTask(taskId, userId);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: any) {
      console.error("Get task attachments error:", error);

      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || "Failed to get task attachments.",
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
  ): Promise<ApiResponse<any>> {
    try {
      const response = await attachmentApi.attach(attachmentId, taskId, userId);
      return {
        code: 200,
        msg: "File attached successfully",
        data: response.data,
      };
    } catch (error: any) {
      console.error("Attach file to task error:", error);

      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || "Failed to attach file to task.",
      };
    }
  }

  /**
   * Detach file from task
   */
  async detachFileFromTask(
    attachmentId: string,
    userId: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await attachmentApi.detach(attachmentId, userId);
      return {
        code: 200,
        msg: "File detached successfully",
        data: response.data,
      };
    } catch (error: any) {
      console.error("Detach file from task error:", error);

      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || "Failed to detach file from task.",
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
      const response = await attachmentApi.download(attachmentId, userId);
      return {
        code: 200,
        msg: "File downloaded successfully",
        data: response.data,
      };
    } catch (error: any) {
      console.error("Download file error:", error);

      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || "Failed to download file.",
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
    try {
      await attachmentApi.delete(attachmentId, userId);
      return {
        code: 200,
        msg: "Attachment deleted successfully",
      };
    } catch (error: any) {
      console.error("Delete attachment error:", error);

      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || "Failed to delete attachment.",
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
}

export const attachmentService = new AttachmentService();
export default attachmentService;
