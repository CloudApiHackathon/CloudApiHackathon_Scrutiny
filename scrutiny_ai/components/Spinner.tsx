import { ReloadIcon } from "@radix-ui/react-icons";

const Spinner = () => {
  return (
    <div className="relative w-9.5 h-9.5 before:relative before:content-none before:block before:pt-full">
      <ReloadIcon className="mr-2 h-9.5 w-9.5 animate-spin" />
    </div>
  );
};

export default Spinner;
