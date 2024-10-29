import { useUser } from "@auth0/nextjs-auth0/client";
import clsx from "clsx";
import PlainButton from "./PlainButton";
import Videocam from "./icons/Videocam";
import useTime from "../hooks/useTime";
import UserButton from "./UserButton";
import { useRouter } from "next/navigation";
import IconButton from "./IconButton";
import Settings from "./icons/Settings";

interface HeaderProps {
  navItems?: boolean;
}

const Header = ({ navItems = true }: HeaderProps) => {
  const { isLoading, user } = useUser();
  const { currentDateTime } = useTime();
  const router = useRouter();
  return (
    <header className="w-full px-4 pt-4 flex items-center justify-between bg-white">
      <div className="w-60 max-w-full flex items-center cursor-default">
        <a href="/#" className="flex items-center gap-2 w-full">
          <Videocam width={40} height={40} color="var(--primary)" />
          <div className="font-product-sans text-2xl leading-6 text-meet-gray select-none">
            <span className="font-medium">Scrunity </span>
          </div>
        </a>
        <PlainButton
          size="sm"
          onClick={() => {
            router.push("/api/auth/login");
          }}
        >
          Dashboard
        </PlainButton>
      </div>
      <div className="flex items-center cursor-default">
        {navItems && (
          <>
            <div className="hidden md:block mr-2 text-lg leading-4.5 text-meet-gray select-none">
              {currentDateTime}
            </div>
            <div className="hidden sm:contents [&>button]:mx-2.5">
              <IconButton title="Settings" icon={<Settings />} />
            </div>
          </>
        )}
        <div className=" flex items-center justify-end w-[6.5625rem] lg:ml-5">
          <div
            className={clsx(
              "w-[3.04rem] grow flex items-center justify-end [&_img]:w-9 [&_span]:w-9 [&_img]:h-9 [&_span]:h-9",
              !isLoading ? "animate-fade-in" : "opacity-0"
            )}
          >
            {user ? (
              <>
                {!navItems && (
                  <div className="hidden sm:block mr-3 font-roboto leading-4 text-right text-meet-black">
                    <div className="text-sm leading-4">{user.email}</div>
                    <div className="text-sm hover:text-meet-blue cursor-pointer">
                      Switch account
                    </div>
                  </div>
                )}
                <div className="relative h-9">
                  <UserButton user={user} />
                </div>
              </>
            ) : (
              <PlainButton
                size="sm"
                onClick={() => {
                  router.push("/api/auth/login");
                }}
              >
                Sign In
              </PlainButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
