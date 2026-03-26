"use client";

import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";
import { Input } from "../input";

type InputFieldProps = {
  nameInSchema: string;
  fieldTitle?: string;
  description?: string;
  placeholder?: string;
  type?: string;
  labelClassName?: string;
  inputClassName?: string;
  formItemClassName?: string;
  labelFor?: string;
};

export function InputField({
  nameInSchema,
  fieldTitle,
  description,
  placeholder,
  type = "text",
  labelClassName,
  inputClassName,
  formItemClassName,
  labelFor,
}: InputFieldProps) {
  const form = useFormContext();
  const htmlFor = labelFor ?? fieldTitle;

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem className={formItemClassName}>
          <FormLabel
            htmlFor={htmlFor}
            className={cn(!fieldTitle && "sr-only", labelClassName)}
          >
            {fieldTitle || htmlFor}
          </FormLabel>

          <FormControl>
            <Input
              {...field}
              id={htmlFor}
              type={type}
              placeholder={placeholder}
              onFocus={(e) => e.target.select()}
              className={inputClassName}
            />
          </FormControl>

          {description && <FormDescription>{description}</FormDescription>}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
