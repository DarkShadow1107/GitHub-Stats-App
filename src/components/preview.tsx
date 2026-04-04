"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

import { Icons } from "./icons";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { useGithubStats } from "@/hooks/use-github-stats";
import { useParams, useSearchParams } from "next/navigation";
import { SkeletonCard } from "./skeleton-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Preview = () => {
  const { theme: currentTheme } = useTheme();

  const searchParams = useSearchParams();
  const themePreview = searchParams.get("theme_preview");
  const baseTheme = currentTheme === "light" ? "github" : "tokyonight";

  const [openDialog, setOpenDialog] = useState("");

  const { username } = useParams<{ username: string }>();
  const theme = searchParams.get("theme") || themePreview || baseTheme;
  const countPrivate = searchParams.get("count_private") || "true";
  const hideBorder = searchParams.get("hide_border") || "true";
  const gradeFormat = searchParams.get("grade_format") || "number";
  const scoreSize = searchParams.get("score_size") || "normal";
  const showTotalContributions = searchParams.get("show_total_contributions") || "false";
  const showStreak = searchParams.get("show_streak") || "false";
  const progressionBars = searchParams.get("progression_bars") || "false";
  const titleColor = searchParams.get("title_color") || undefined;
  const textColor = searchParams.get("text_color") || undefined;
  const iconColor = searchParams.get("icon_color") || undefined;
  const bgColor = searchParams.get("bg_color") || undefined;
  const borderColor = searchParams.get("border_color") || undefined;
  const borderRadius = searchParams.get("border_radius") || undefined;
  const disableAnimations = searchParams.get("disable_animations") || undefined;

  const { stats, topLanguages, streak } = useGithubStats({
    username: username ?? "DarkShadow1107",
    theme,
    countPrivate,
    hideBorder,
  });

  const tabsData = [
    {
      name: "Stats",
      value: "stats",
      imgSrc: stats,
      alt: "github stats",
    },
    {
      name: "Top Languages",
      value: "languages",
      imgSrc: topLanguages,
      alt: "github top languages",
    },
    {
      name: "Streak",
      value: "streak",
      imgSrc: streak,
      alt: "github streak",
    },
  ];

  return (
    <Tabs defaultValue="stats" className="w-full mt-5">
      <TabsList className="w-full bg-transparent px-0 flex mb-5">
        {tabsData.map(({ name, value }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="w-full data-[state=active]:border-primary/50 border-secondary transition-color border-b rounded-none"
          >
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      {!username && (
        <p className="text-sm italic text-muted-foreground">
          This is only a preview, generate stats to get your result.
        </p>
      )}
      {tabsData.map(({ value, imgSrc, alt }) => (
        <div key={value} className="w-full">
          <ImgPreview
            alt={alt}
            value={value}
            imgSrc={imgSrc}
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
          />
        </div>
      ))}
    </Tabs>
  );
};

const ImgPreview = ({
  value,
  imgSrc,
  alt,
  openDialog,
  setOpenDialog,
}: {
  value: string;
  imgSrc: string;
  alt: string;
  openDialog: string;
  setOpenDialog: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [imgLoad, setImgLoad] = useState(true);

  const { username } = useParams<{ username: string }>();

  const copyVariants = [
    {
      type: "markdown",
      Icon: () => <Icons.clipboard />,
    },
    {
      type: "url",
      Icon: () => <Icons.link />,
    },
    {
      type: "code",
      Icon: () => <Icons.code />,
    },
  ];

  const copyToClipboard = (type: string) => {
    if (username) {
      let copiedText = "";
      const fullImgSrc = imgSrc.startsWith("/")
        ? `${window.location.origin}${imgSrc}`
        : imgSrc;

      if (type === "markdown") {
        copiedText = `![GitHub Stats](${fullImgSrc})`;
      } else if (type === "url") {
        copiedText = fullImgSrc;
      } else if (type === "code") {
        copiedText = `<img src="${fullImgSrc}" alt="${username}'s GitHub Stats" />`;
      }
      navigator.clipboard.writeText(copiedText);
      toast.success(`Copied to Clipboard as ${type}.`);
    }
  };

  return (
    <>
      <Dialog
        open={openDialog === value}
        onOpenChange={() => setOpenDialog(openDialog === value ? "" : value)}
      >
        <DialogContent className="sm:p-10">
          <div className="relative">
            {imgLoad && (
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full">
                <SkeletonCard />
              </div>
            )}

            <Image
              width={400}
              height={150}
              className="w-full output"
              src={imgSrc}
              alt={alt}
              priority
              unoptimized
              onLoadStart={() => setImgLoad(true)}
              onLoad={() => setImgLoad(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <TabsContent key={value} value={value}>
        <div className="sm:flex gap-3">
          <div className="relative w-full">
            {imgLoad && (
              <div className="absolute top-0 left-0 w-full">
                <SkeletonCard />
              </div>
            )}

            <Image
              width={400}
              height={150}
              className="w-full output cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              src={imgSrc}
              alt={alt}
              priority
              unoptimized
              onLoadStart={() => setImgLoad(true)}
              onLoad={() => setImgLoad(false)}
              onClick={() => setOpenDialog(value)}
            />
          </div>

          {username && (
            <div className="mt-2 sm:mt-0 flex sm:flex-col justify-between">
              <div className="sm:flex-col flex gap-2">
                {copyVariants.map(({ type, Icon }) => (
                  <TooltipProvider key={type}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="[&>*]:h-5"
                          onClick={() => copyToClipboard(type)}
                        >
                          <Icon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy as {type}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>

              <Button
                asChild
                variant="outline"
                size="icon"
                className="[&>*]:h-5"
              >
                <Link href="/">
                  <Icons.back className="h-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </TabsContent>
    </>
  );
};
