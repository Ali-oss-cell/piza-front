import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldControl } from "@/lib/theme-classes";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input className={cn(fieldControl, className)} ref={ref} {...props} />
));
Input.displayName = "Input";

export { Input };
