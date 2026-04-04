"use client";

import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import themes from "@/themes.json";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Icons } from "./icons";
import { Label } from "./ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  theme: z.string({
    required_error: "Please select a theme.",
  }),
  hideBorder: z.boolean(),
  countPrivate: z.boolean(),
  gradeFormat: z.enum(["number", "letter"]),
  scoreSize: z.enum(["normal", "large"]),
  showTotalContributions: z.boolean(),
  showStreak: z.boolean(),
  progressionBars: z.boolean(),
  titleColor: z.string().optional(),
  textColor: z.string().optional(),
  iconColor: z.string().optional(),
  bgColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderRadius: z.string().optional(),
  disableAnimations: z.boolean().default(false),
});

export function GhStatsForm() {
  const [loading, setLoading] = useState(false);

  const { push } = useRouter();
  const searchParams = useSearchParams();
  const themePreview = searchParams.get("theme_preview");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      hideBorder: true,
      countPrivate: true,
      gradeFormat: "number",
      theme: themePreview || "default",
      scoreSize: "normal",
      showTotalContributions: false,
      showStreak: false,
      progressionBars: false,
      titleColor: "",
      textColor: "",
      iconColor: "",
      bgColor: "",
      borderColor: "",
      borderRadius: "",
      disableAnimations: false,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const {
      username,
      theme,
      hideBorder,
      countPrivate,
      gradeFormat,
      scoreSize,
      showTotalContributions,
      showStreak,
      progressionBars,
      titleColor,
      textColor,
      iconColor,
      bgColor,
      borderColor,
      borderRadius,
      disableAnimations
    } = data;

    setLoading(true);

    toast.success("Generated GitHub Stats!");

    const query = new URLSearchParams();
    query.set("theme", theme);
    query.set("hide_border", hideBorder.toString());
    query.set("count_private", countPrivate.toString());
    query.set("grade_format", gradeFormat);
    query.set("score_size", scoreSize);
    query.set("show_total_contributions", showTotalContributions.toString());
    query.set("show_streak", showStreak.toString());
    query.set("progression_bars", progressionBars.toString());

    if (titleColor) query.set("title_color", titleColor.replace("#", ""));
    if (textColor) query.set("text_color", textColor.replace("#", ""));
    if (iconColor) query.set("icon_color", iconColor.replace("#", ""));
    if (bgColor) query.set("bg_color", bgColor.replace("#", ""));
    if (borderColor) query.set("border_color", borderColor.replace("#", ""));
    if (borderRadius) query.set("border_radius", borderRadius);
    if (disableAnimations) query.set("disable_animations", "true");

    push(`/user/${username}?${query.toString()}`);
  }

  function updateThemePreview(_theme: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme_preview", _theme);
    window.history.pushState(null, "", `?${params.toString()}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>GitHub Username</FormLabel>
                <FormControl>
                  <Input placeholder="DarkShadow1107" {...field} />
                </FormControl>
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel>Theme</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value || field.value === "default"
                            ? "text-muted-foreground"
                            : ""
                        )}
                      >
                        {field.value
                          ? themes.find((theme) => theme.value === field.value)
                              ?.label
                          : "Select theme"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search theme..." />
                      <CommandEmpty>No theme found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {themes.map((theme) => (
                            <CommandItem
                              value={theme.label}
                              key={theme.value}
                              onSelect={() => {
                                form.setValue("theme", theme.value);
                                updateThemePreview(theme.value);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  theme.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {theme.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-muted-foreground">
                <Icons.adjust className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto px-7">
              <p className="text-muted-foreground mb-5 text-sm">
                Update card preferences.
              </p>

              <div className="space-y-1">
                <FormField
                  control={form.control}
                  name="hideBorder"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="hideBorder"
                          />
                        </FormControl>
                      </FormItem>
                      <Label htmlFor="hideBorder" className="mb-1">
                        Hide Card Border
                      </Label>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="countPrivate"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="countPrivate"
                          />
                        </FormControl>
                      </FormItem>
                      <Label htmlFor="countPrivate" className="mb-1">
                        Count Private Commits
                      </Label>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gradeFormat"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value === "number"}
                            onCheckedChange={(checked) => field.onChange(checked ? "number" : "letter")}
                            id="gradeFormat"
                          />
                        </FormControl>
                      </FormItem>
                      <Label htmlFor="gradeFormat" className="mb-1">
                        Use Numeric Grade
                      </Label>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scoreSize"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value === "large"}
                            onCheckedChange={(checked) => field.onChange(checked ? "large" : "normal")}
                            id="scoreSize"
                          />
                        </FormControl>
                      </FormItem>
                      <Label htmlFor="scoreSize" className="mb-1">
                        Large Score Circle
                      </Label>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showTotalContributions"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="showTotalContributions"
                          />
                        </FormControl>
                      </FormItem>
                      <Label htmlFor="showTotalContributions" className="mb-1">
                        Show Total Contributions
                      </Label>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showStreak"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="showStreak"
                          />
                        </FormControl>
                      </FormItem>
                      <Label htmlFor="showStreak" className="mb-1">
                        Show Streaks
                      </Label>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="progressionBars"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="progressionBars"
                          />
                        </FormControl>
                      </FormItem>
                      <Label htmlFor="progressionBars" className="mb-1">
                        Progression Bars
                      </Label>
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="disableAnimations"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="disableAnimations"
                          />
                        </FormControl>
                      </FormItem>
                      <Label htmlFor="disableAnimations" className="mb-1">
                        Disable Animations
                      </Label>
                    </div>
                  )}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Custom Colors & Borders Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="titleColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 2f80ed or #2f80ed" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 434d58 or #434d58" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iconColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 4c71f2 or #4c71f2" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bgColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. fffefe or #fffefe" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="borderColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Border Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. e4e2e2 or #e4e2e2" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="borderRadius"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Border Radius</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 4.5" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {!loading ? "Generate Stats" : <Icons.spinner />}
        </Button>
      </form>
    </Form>
  );
}
