import React from "react";
import { useForm, Controller, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AvatarUpload from "../../common/AvatarUpload";

export type FormFieldType = 
  | "text" 
  | "email" 
  | "password" 
  | "number" 
  | "currency" 
  | "phone" 
  | "date" 
  | "textarea" 
  | "select" 
  | "multi-select" 
  | "switch" 
  | "checkbox" 
  | "radio" 
  | "avatar";

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: any }[]; // Used for select, multi-select, radio
  description?: string;
  // Extra props for avatar upload
  avatarProps?: {
    userId: string;
    role: "member" | "trainer";
    idToUpdate: string;
  };
}

interface CrudFormProps {
  fields: FormFieldConfig[];
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
  submitLabel?: string;
  loading?: boolean;
  validationSchema?: any; // Zod schema resolver can be passed from parent
}

export default function CrudForm({
  fields,
  onSubmit,
  defaultValues = {},
  submitLabel = "Save Record",
  loading = false
}: CrudFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    defaultValues
  });

  const getRegisterOptions = (field: FormFieldConfig) => {
    const options: any = {
      required: field.required ? "This field is required" : false
    };

    if (field.type === "email") {
      if (field.required) {
        options.pattern = {
          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          message: "Invalid email address format"
        };
      } else {
        options.validate = (value: string) => 
          !value || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) || "Invalid email address format";
      }
    } else if (field.type === "phone") {
      if (field.required) {
        options.pattern = {
          value: /^[0-9]{10}$/,
          message: "Phone number must be exactly 10 digits"
        };
      } else {
        options.validate = (value: string) => 
          !value || /^[0-9]{10}$/.test(value) || "Phone number must be exactly 10 digits";
      }
    }

    return options;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map((field) => {
          const error = errors[field.name];
          const hasError = !!error;

          return (
            <div 
              key={field.name} 
              className={`space-y-1.5 ${
                field.type === "textarea" || field.type === "avatar" ? "col-span-1 md:col-span-2" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <Label className={`text-[10px] font-bold uppercase tracking-wider ${
                  hasError ? "text-red-500" : "text-slate-400"
                }`}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
              </div>

              {/* Text / Email / Password / Number / Date */}
              {(field.type === "text" || 
                field.type === "email" || 
                field.type === "password" || 
                field.type === "number" ||
                field.type === "date") && (
                <Input
                  type={field.type}
                  {...register(field.name, getRegisterOptions(field))}
                  placeholder={field.placeholder}
                  disabled={loading}
                  className={`h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white placeholder:text-slate-700 focus-visible:ring-1 focus-visible:ring-[#FF6B00] ${
                    hasError ? "border-red-500/50" : ""
                  }`}
                />
              )}

              {/* Currency Input (Pre-pends INR ₹ symbol) */}
              {field.type === "currency" && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(field.name, getRegisterOptions(field))}
                    placeholder={field.placeholder || "0.00"}
                    disabled={loading}
                    className={`h-10 pl-7 border-white/5 bg-black/40 rounded-xl text-xs text-white placeholder:text-slate-700 focus-visible:ring-1 focus-visible:ring-[#FF6B00] ${
                      hasError ? "border-red-500/50" : ""
                    }`}
                  />
                </div>
              )}

              {/* Phone Input (Pre-pends +91 prefix) */}
              {field.type === "phone" && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                  <Input
                    type="tel"
                    {...register(field.name, getRegisterOptions(field))}
                    placeholder={field.placeholder || "99999 88888"}
                    disabled={loading}
                    className={`h-10 pl-11 border-white/5 bg-black/40 rounded-xl text-xs text-white placeholder:text-slate-700 focus-visible:ring-1 focus-visible:ring-[#FF6B00] ${
                      hasError ? "border-red-500/50" : ""
                    }`}
                  />
                </div>
              )}

              {/* Textarea */}
              {field.type === "textarea" && (
                <Textarea
                  {...register(field.name, getRegisterOptions(field))}
                  placeholder={field.placeholder}
                  disabled={loading}
                  className={`min-h-20 border-white/5 bg-black/40 rounded-xl text-xs text-white placeholder:text-slate-700 focus-visible:ring-1 focus-visible:ring-[#FF6B00] ${
                    hasError ? "border-red-500/50" : ""
                  }`}
                />
              )}

              {/* Select */}
              {field.type === "select" && (
                <select
                  {...register(field.name, getRegisterOptions(field))}
                  disabled={loading}
                  className={`w-full h-10 bg-[#121212] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00] ${
                    hasError ? "border-red-500/50" : ""
                  }`}
                >
                  <option value="">{field.placeholder || "Select option..."}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Multi-Select Select Box */}
              {field.type === "multi-select" && (
                <Controller
                  name={field.name}
                  control={control}
                  rules={getRegisterOptions(field)}
                  render={({ field: { value = [], onChange } }) => (
                    <div className="space-y-2">
                      <select
                        multiple
                        value={value}
                        onChange={(e) => {
                          const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                          onChange(opts);
                        }}
                        className="w-full min-h-20 bg-[#121212] border border-white/5 rounded-xl text-xs text-white p-2 focus:outline-none focus:border-[#FF6B00]"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-[9px] text-slate-500 block">Hold Ctrl (or Cmd) to select multiple options</span>
                    </div>
                  )}
                />
              )}

              {/* Switch */}
              {field.type === "switch" && (
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: { value = false, onChange } }) => (
                    <div className="flex items-center gap-3 pt-2">
                      <Switch
                        checked={value}
                        onCheckedChange={onChange}
                        disabled={loading}
                      />
                      <span className="text-xs font-semibold text-slate-300">
                        {value ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  )}
                />
              )}

              {/* Checkbox */}
              {field.type === "checkbox" && (
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: { value = false, onChange } }) => (
                    <div className="flex items-center gap-2.5 pt-2">
                      <Checkbox
                        checked={value}
                        onCheckedChange={onChange}
                        disabled={loading}
                      />
                      <span className="text-xs font-semibold text-slate-300">
                        Confirm validation selection
                      </span>
                    </div>
                  )}
                />
              )}

              {/* Radio Group */}
              {field.type === "radio" && (
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: { value = "", onChange } }) => (
                    <RadioGroup
                      value={value}
                      onValueChange={onChange}
                      className="flex gap-4 pt-2"
                    >
                      {field.options?.map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.value} id={`${field.name}-${opt.value}`} />
                          <label htmlFor={`${field.name}-${opt.value}`} className="text-xs text-slate-300 font-semibold cursor-pointer">
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              )}

              {/* Avatar Upload */}
              {field.type === "avatar" && field.avatarProps && (
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: { value = null, onChange } }) => (
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center justify-center">
                      <AvatarUpload
                        userId={field.avatarProps!.userId}
                        idToUpdate={field.avatarProps!.idToUpdate}
                        role={field.avatarProps!.role}
                        currentAvatarUrl={value}
                        name={field.label}
                        onUploadSuccess={onChange}
                      />
                    </div>
                  )}
                />
              )}

              {/* Error messages */}
              {hasError && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider animate-in fade-in">
                  {error.message?.toString() || "This field is required"}
                </p>
              )}

              {/* Field description */}
              {field.description && !hasError && (
                <span className="text-[9px] text-slate-500 font-semibold block leading-relaxed">
                  {field.description}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="h-10 px-6 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#FF6B00]/10"
        >
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
