"use client";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Header from "@/components/Header";
import clsx from "clsx";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import Plus from "@/components/icons/Plus";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormProvider, useForm } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import File from "@/components/icons/File";

interface FileData {
<<<<<<< HEAD
=======
  signedUrl: string | undefined;
  url: string | URL | undefined;
>>>>>>> 8355ab9 (temporary assume that bucket is public)
  id: string;
  fileName: string;
}

const formSchema = z.object({});

const Page = () => {
  const { user, isLoading } = useUser();
  const [files, setFiles] = useState<FileData[]>([]);
  const [open, setOpen] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const fetchFiles = async () => {
    if (!user?.accessToken) return;

    setIsFileLoading(true);
    setError(null); // Reset error state
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/resumes`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files", error);
      setError("Failed to load files. Please try again.");
    } finally {
      setIsFileLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user?.accessToken]);

  const handleUpload = async () => {
    if (!user?.accessToken) return;

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      console.error("No file selected");
      setError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null); // Reset error state
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/resumes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
      setFiles((prev) => [
        ...prev,
<<<<<<< HEAD
        { id: file.name, fileName: file.name.split("\\").pop()! },
=======
        {
          signedUrl: undefined,
          url: undefined,
          id: file.name,
          fileName: file.name.split("\\").pop()!,
        },
>>>>>>> 8355ab9 (temporary assume that bucket is public)
      ]);
      setOpen(false);
    } catch (error) {
      console.error("Error uploading file", error);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={clsx(
        "flex flex-col min-h-screen w-full",
        !isLoading ? "animate-fade-in" : "opacity-0"
      )}
    >
      <Header isSidebarOpen={true} />
      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="w-full p-4 bg-white">
          <div className="flex flex-col items-start justify-center h-auto p-6 overflow-y-auto">
            <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
              Storage
            </h1>
            {error && <p className="text-red-600">{error}</p>}
            <div className="mt-10 w-full h-full">
              {isFileLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {files.map((file) => (
<<<<<<< HEAD
                    <div
=======
                    <a
                      href={file.signedUrl}
>>>>>>> 8355ab9 (temporary assume that bucket is public)
                      key={file.id}
                      className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg"
                    >
                      <File className="w-12 h-12" />
                      <p className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300 truncate">
                        {file.fileName.slice(0, 20) + "..."}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" className="fixed bottom-4 right-4">
            <Plus />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add your resume</DialogTitle>
            <DialogDescription>
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(handleUpload)}>
                  <FormItem>
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        placeholder="Upload your resume"
                        aria-label="Upload your resume"
                      />
                    </FormControl>
                    <FormDescription>Upload a file</FormDescription>
                    <FormMessage />
                  </FormItem>
                  <Button type="submit" className="w-full">
                    {isUploading ? (
                      <>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload"
                    )}
                  </Button>
                </form>
              </FormProvider>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
