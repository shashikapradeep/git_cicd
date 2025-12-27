import React from 'react';
import Label from '../atomic/Label';
import Input from '../atomic/Input';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

export default function FormInput({ id, label, ...props }: FormInputProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}
