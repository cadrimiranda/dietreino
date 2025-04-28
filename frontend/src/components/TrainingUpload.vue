<!-- TrainingUpload.vue -->
<template>
  <div>
    <!-- Page header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Upload Training Plan</h1>
        <p class="text-gray-600">Create a new training plan for your client</p>
      </div>
    </div>

    <!-- Upload Form -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Client Selection -->
          <div>
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="client"
            >
              Select Client
            </label>
            <div class="relative">
              <select
                id="client"
                v-model="formData.clientId"
                class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                required
              >
                <option value="" disabled>Choose a client</option>
                <option
                  v-for="client in clients"
                  :key="client.id"
                  :value="client.id"
                >
                  {{ client.name }}
                </option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
              >
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>

          <!-- Training Type -->
          <div>
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="type"
            >
              Training Type
            </label>
            <div class="relative">
              <select
                id="type"
                v-model="formData.trainingType"
                class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                required
              >
                <option value="" disabled>Select training type</option>
                <option value="strength">Strength Training</option>
                <option value="hypertrophy">Hypertrophy</option>
                <option value="endurance">Endurance</option>
                <option value="functional">Functional</option>
                <option value="custom">Custom</option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
              >
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>

          <!-- Start Date -->
          <div>
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="startDate"
            >
              Start Date
            </label>
            <input
              id="startDate"
              v-model="formData.startDate"
              type="date"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <!-- End Date -->
          <div>
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="endDate"
            >
              End Date
            </label>
            <input
              id="endDate"
              v-model="formData.endDate"
              type="date"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <!-- Description -->
        <div class="mt-6">
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="description"
          >
            Description/Notes
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes or special instructions..."
          ></textarea>
        </div>

        <!-- File Upload -->
        <div class="mt-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Upload Training Sheet (XLSX)
          </label>
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center"
            :class="{ 'border-blue-500 bg-blue-50': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
          >
            <div v-if="!formData.file">
              <div class="text-center">
                <i class="fas fa-file-excel text-4xl text-gray-400 mb-3"></i>
                <p class="text-gray-700 mb-2">
                  Drag and drop your XLSX file here
                </p>
                <p class="text-gray-500 text-sm mb-4">or</p>
                <label
                  for="fileInput"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
                >
                  Browse Files
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  class="hidden"
                  @change="handleFileSelect"
                />
              </div>
            </div>
            <div v-else class="w-full">
              <div
                class="flex items-center justify-between bg-blue-50 p-3 rounded-lg"
              >
                <div class="flex items-center">
                  <i class="fas fa-file-excel text-xl text-blue-600 mr-3"></i>
                  <div>
                    <p class="font-medium">{{ formData.file.name }}</p>
                    <p class="text-sm text-gray-500">
                      {{ formatFileSize(formData.file.size) }}
                    </p>
                  </div>
                </div>
                <button
                  @click="removeFile"
                  class="text-red-600 hover:text-red-800"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            Supported formats: XLSX, XLS (Max 10MB)
          </p>
        </div>

        <!-- Submit buttons -->
        <div class="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            @click="$router.go(-1)"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            :disabled="!isFormValid || isSubmitting"
          >
            <i class="fas fa-spinner fa-spin mr-2" v-if="isSubmitting"></i>
            <span v-if="isSubmitting">Uploading...</span>
            <span v-else>Upload Training Plan</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Success Modal -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div class="text-center mb-6">
          <div
            class="bg-green-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4"
          >
            <i class="fas fa-check text-2xl text-green-600"></i>
          </div>
          <h2 class="text-xl font-bold text-gray-900">
            Training Plan Uploaded!
          </h2>
          <p class="text-gray-600 mt-2">
            The training plan has been successfully uploaded for
            {{ selectedClientName }}.
          </p>
        </div>

        <div class="flex justify-center space-x-3">
          <button
            @click="viewTrainingPlans"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            View All Plans
          </button>
          <button
            @click="uploadAnother"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upload Another
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface Client {
  id: number;
  name: string;
}

interface TrainingFormData {
  clientId: number | string;
  trainingType: string;
  startDate: string;
  endDate: string;
  description: string;
  file: File | null;
}

export default defineComponent({
  name: "TrainingUpload",
  data() {
    return {
      isDragging: false,
      isSubmitting: false,
      showSuccessModal: false,
      formData: {
        clientId: "",
        trainingType: "",
        startDate: "",
        endDate: "",
        description: "",
        file: null,
      } as TrainingFormData,
      clients: [
        { id: 1, name: "João Silva" },
        { id: 2, name: "Maria Oliveira" },
        { id: 3, name: "Pedro Santos" },
      ] as Client[],
    };
  },
  computed: {
    isFormValid(): boolean {
      return (
        !!this.formData.clientId &&
        !!this.formData.trainingType &&
        !!this.formData.startDate &&
        !!this.formData.endDate &&
        !!this.formData.file
      );
    },
    selectedClientName(): string {
      if (!this.formData.clientId) return "";
      const client = this.clients.find((c) => c.id === this.formData.clientId);
      return client ? client.name : "";
    },
  },
  methods: {
    handleFileSelect(event: Event): void {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (file) {
        this.validateAndSetFile(file);
      }
    },
    handleFileDrop(event: DragEvent): void {
      this.isDragging = false;
      const file = event.dataTransfer?.files[0];
      if (file) {
        this.validateAndSetFile(file);
      }
    },
    validateAndSetFile(file: File): void {
      // Check file type
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid Excel file (XLSX or XLS)");
        return;
      }

      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds the 10MB limit");
        return;
      }

      this.formData.file = file;
    },
    removeFile(): void {
      this.formData.file = null;
      // Reset the file input
      const fileInput = document.getElementById(
        "fileInput"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    },
    formatFileSize(bytes: number): string {
      if (bytes < 1024) {
        return bytes + " bytes";
      } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
      } else {
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
      }
    },
    handleSubmit(): void {
      // Simulate form submission
      this.isSubmitting = true;

      // In a real app, you would upload the file to your backend here
      // For this example, we'll just simulate a delay
      setTimeout(() => {
        this.isSubmitting = false;
        this.showSuccessModal = true;

        // In a real app, you'd handle the response from your API here
      }, 2000);
    },
    viewTrainingPlans(): void {
      this.showSuccessModal = false;
      this.$router.push("/training");
    },
    uploadAnother(): void {
      // Reset the form
      this.formData = {
        clientId: "",
        trainingType: "",
        startDate: "",
        endDate: "",
        description: "",
        file: null,
      };
      this.showSuccessModal = false;
    },
  },
  mounted() {
    // Set default dates (today and 4 weeks from today)
    const today = new Date();
    const fourWeeksLater = new Date();
    fourWeeksLater.setDate(today.getDate() + 28);

    this.formData.startDate = today.toISOString().split("T")[0];
    this.formData.endDate = fourWeeksLater.toISOString().split("T")[0];
  },
});
</script>
