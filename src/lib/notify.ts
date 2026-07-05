import { toast } from "sonner";

export const notify = {
  success: (message: string) => {
    toast.success(message);
  },
  error: (message: string) => {
    toast.error(message);
  },
  info: (message: string) => {
    toast.info(message);
  },
  warning: (message: string) => {
    toast.warning(message);
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },
  confirm: (message: string, onConfirm: () => void, description?: string) => {
    toast(message, {
      description: description || "Please confirm to proceed with this operation.",
      action: {
        label: "Confirm",
        onClick: onConfirm,
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
      duration: 8000,
    });
  }
};
