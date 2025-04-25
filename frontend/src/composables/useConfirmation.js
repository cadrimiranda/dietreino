import { useConfirm } from "primevue/useconfirm";

export function useConfirmation() {
  const confirm = useConfirm();

  const showDeleteConfirmation = (onAccept, onReject) => {
    confirm.require({
      message: "Are you sure you want to delete this item?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClass: "p-button-danger",
      accept: onAccept,
      reject: onReject || (() => {}),
    });
  };

  const showConfirmation = (options) => {
    confirm.require({
      message: options.message || "Are you sure you want to proceed?",
      header: options.header || "Confirmation",
      icon: options.icon || "pi pi-exclamation-triangle",
      acceptClass: options.acceptClass || "p-button-primary",
      accept: options.accept || (() => {}),
      reject: options.reject || (() => {}),
    });
  };

  return {
    showDeleteConfirmation,
    showConfirmation,
    // Access to the raw confirm service
    raw: confirm,
  };
}
