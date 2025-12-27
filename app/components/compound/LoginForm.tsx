import React from 'react';
import FormInput from '../molecule/FormInput';
import Button from '../atomic/Button';

export default function LoginForm() {
  return (
    <form className="space-y-6">
      {/* Username Input */}
      <FormInput
        id="username"
        label="Username"
        type="text"
        placeholder="Enter your username"
      />

      {/* Password Input */}
      <FormInput
        id="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
      />
      
      {/* Sign In Button */}
      <Button type="submit" variant="primary">
        Sign In
      </Button>
    </form>
  );
}
