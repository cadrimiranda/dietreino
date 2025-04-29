// clientUtils.ts
export interface Client {
  id: number | string;
  name: string;
  email: string;
  trainingStatus: string;
  dietStatus: string;
  createdAt: Date | string;
  phone?: string;
}

export type StatusType =
  | "active"
  | "pending"
  | "inactive"
  | "completed"
  | "overdue";

export const formatters = {
  getInitials(name: string): string {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  },

  capitalizeFirst(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  },

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: "green",
      pending: "gold",
      inactive: "gray",
      completed: "blue",
      overdue: "red",
    };
    return colors[status.toLowerCase()] || "blue";
  },

  getAvatarStyle(name: string): Record<string, string> {
    const colors = [
      "#1890ff",
      "#52c41a",
      "#faad14",
      "#f5222d",
      "#722ed1",
      "#13c2c2",
      "#eb2f96",
      "#fa8c16",
    ];
    const charCode = name
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return {
      backgroundColor: colors[charCode % colors.length],
      color: "#ffffff",
    };
  },
};

export const statusFilters = [
  { text: "Active", value: "active" },
  { text: "Pending", value: "pending" },
  { text: "Inactive", value: "inactive" },
  { text: "Completed", value: "completed" },
  { text: "Overdue", value: "overdue" },
];
