import Button, { ButtonProps } from "./Button";
import React from "react";

export interface ButtonPrimaryProps extends ButtonProps { }

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  className = "",
  ...args
}) => {
  return (
    <Button
      className={`ttnc-ButtonPrimary disabled:bg-opacity-70 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-md hover:shadow-lg border border-blue-700 dark:bg-gradient-to-r dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 dark:text-white dark:shadow-lg dark:shadow-blue-500/30 dark:border-blue-600 transition-all duration-200 ${className}`}
      {...args}
    />
  );
};

export default ButtonPrimary;
