import { TextInput, type TextInputProps } from "react-native";

type TextFieldProps = TextInputProps & {
  className?: string;
};

export function TextField({ className, ...inputProps }: TextFieldProps) {
  return (
    <TextInput
      placeholderTextColor="#64748b"
      className={`rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white ${className ?? ""}`}
      {...inputProps}
    />
  );
}
