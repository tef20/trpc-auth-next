import * as RadixDialog from "@radix-ui/react-dialog";

type SignupFormProps = {
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
};

export default function Dialog({ children, title, trigger }: SignupFormProps) {
  return (
    <RadixDialog.Root>
      <RadixDialog.Trigger>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-[--foreground] opacity-70" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 w-[clamp(25ch,70%,58ch)] -translate-x-1/2 -translate-y-1/2 rounded-md bg-[--background] px-2 pb-24 pt-6">
          <div className="flow grid w-full grid-cols-[1fr_auto_1fr] items-center">
            <RadixDialog.Title className="col-start-2 text-3xl">
              {title}
            </RadixDialog.Title>
            <div className="col-start-2">{children}</div>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
